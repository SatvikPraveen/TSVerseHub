// File: mini-projects/form-validation/useForm.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ValidationSchema, 
  ValidationEngine, 
  ValidationErrors, 
  FieldError,
  ValidationContext 
} from './validation';

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface FormConfig<T = Record<string, any>> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
  onSubmit?: (values: T, actions: FormActions<T>) => void | Promise<void>;
  onValidationError?: (errors: ValidationErrors) => void;
}

export interface FormActions<T = Record<string, any>> {
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | FieldError[]) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<ValidationErrors>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  resetForm: (newValues?: Partial<T>) => void;
  submitForm: () => Promise<void>;
  validateField: (field: keyof T) => Promise<FieldError[]>;
  validateForm: () => Promise<boolean>;
}

export interface FieldProps {
  name: string;
  value: any;
  onChange: (event: React.ChangeEvent<any>) => void;
  onBlur: (event: React.FocusEvent<any>) => void;
  error?: FieldError[];
  touched?: boolean;
  dirty?: boolean;
}

export interface FormReturn<T = Record<string, any>> {
  values: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
  getFieldProps: (name: keyof T) => FieldProps;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | FieldError[]) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<ValidationErrors>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  resetForm: (newValues?: Partial<T>) => void;
  submitForm: () => Promise<void>;
  validateField: (field: keyof T) => Promise<FieldError[]>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): FormReturn<T> {
  const {
    initialValues,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    enableReinitialize = false,
    onSubmit,
    onValidationError
  } = config;

  // Create validation engine
  const validationEngine = useRef<ValidationEngine | null>(
    validationSchema ? new ValidationEngine(validationSchema) : null
  );

  // Form state
  const [state, setState] = useState<FormState<T>>({
    values: { ...initialValues },
    errors: {},
    touched: {} as Record<keyof T, boolean>,
    dirty: {} as Record<keyof T, boolean>,
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    submitCount: 0
  });

  // Keep track of initial values for dirty checking
  const initialValuesRef = useRef(initialValues);
  
  // Update initial values if enableReinitialize is true
  useEffect(() => {
    if (enableReinitialize) {
      initialValuesRef.current = initialValues;
      setState(prev => ({
        ...prev,
        values: { ...initialValues }
      }));
    }
  }, [initialValues, enableReinitialize]);

  // Update validation engine when schema changes
  useEffect(() => {
    if (validationSchema) {
      validationEngine.current = new ValidationEngine(validationSchema);
    }
  }, [validationSchema]);

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount && validationEngine.current) {
      validateForm();
    }
  }, [validateOnMount]);

  // Create validation context
  const createValidationContext = useCallback((fieldName: string): ValidationContext => ({
    fieldName,
    formData: state.values,
    touched: state.touched,
    dirty: state.dirty
  }), [state.values, state.touched, state.dirty]);

  // Validate a single field
  const validateField = useCallback(async (field: keyof T): Promise<FieldError[]> => {
    if (!validationEngine.current) return [];

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const context = createValidationContext(field as string);
      const fieldErrors = await validationEngine.current.validateField(
        field as string,
        state.values[field],
        context
      );

      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: fieldErrors.length > 0 ? fieldErrors : undefined
        },
        isValidating: false
      }));

      return fieldErrors;
    } catch (error) {
      setState(prev => ({ ...prev, isValidating: false }));
      return [];
    }
  }, [state.values, createValidationContext]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationEngine.current) return true;

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const context = {
        fieldName: '',
        formData: state.values,
        touched: state.touched,
        dirty: state.dirty
      };

      const errors = await validationEngine.current.validateForm(state.values, context);
      const isValid = Object.keys(errors).length === 0;

      setState(prev => ({
        ...prev,
        errors,
        isValid,
        isValidating: false
      }));

      if (!isValid && onValidationError) {
        onValidationError(errors);
      }

      return isValid;
    } catch (error) {
      setState(prev => ({ ...prev, isValidating: false }));
      return false;
    }
  }, [state.values, state.touched, state.dirty, onValidationError]);

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const isDirty = newValues[field] !== initialValuesRef.current[field];

      return {
        ...prev,
        values: newValues,
        dirty: { ...prev.dirty, [field]: isDirty }
      };
    });

    // Validate on change if enabled
    if (validateOnChange && validationEngine.current) {
      const context = createValidationContext(field as string);
      validationEngine.current.validateFieldWithDebounce(
        field as string,
        value,
        { ...context, formData: { ...state.values, [field]: value } },
        (errors) => {
          setState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [field]: errors.length > 0 ? errors : undefined
            }
          }));
        }
      );
    }
  }, [validateOnChange, state.values, createValidationContext]);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string | FieldError[]) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: typeof error === 'string' 
          ? [{ message: error }] 
          : error.length > 0 ? error : undefined
      }
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched }
    }));

    // Validate on blur if enabled and field is touched
    if (touched && validateOnBlur) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnBlur, validateField]);

  // Set multiple values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const newDirty = { ...prev.dirty };

      // Update dirty state for each field
      Object.keys(values).forEach(key => {
        newDirty[key as keyof T] = newValues[key] !== initialValuesRef.current[key];
      });

      return {
        ...prev,
        values: newValues,
        dirty: newDirty
      };
    });
  }, []);

  // Set multiple errors
  const setErrors = useCallback((errors: Partial<ValidationErrors>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors }
    }));
  }, []);

  // Set multiple touched fields
  const setTouched = useCallback((touched: Partial<Record<keyof T, boolean>>) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, ...touched }
    }));
  }, []);

  // Reset form
  const resetForm = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    
    setState({
      values: { ...resetValues },
      errors: {},
      touched: {} as Record<keyof T, boolean>,
      dirty: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      submitCount: 0
    });

    if (newValues) {
      initialValuesRef.current = { ...initialValuesRef.current, ...newValues };
    }

    // Clear debounce timers
    if (validationEngine.current) {
      validationEngine.current.clearDebounceTimers();
    }
  }, [initialValues]);

  // Submit form
  const submitForm = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }));

    // Mark all fields as touched
    const allTouched = Object.keys(state.values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    
    setState(prev => ({ ...prev, touched: allTouched }));

    // Validate form
    const isValid = await validateForm();

    if (isValid && onSubmit) {
      try {
        const actions: FormActions<T> = {
          setFieldValue,
          setFieldError,
          setFieldTouched,
          setValues,
          setErrors,
          setTouched,
          resetForm,
          submitForm,
          validateField,
          validateForm
        };

        await onSubmit(state.values, actions);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setState(prev => ({ ...prev, isSubmitting: false }));
  }, [
    state.values,
    onSubmit,
    validateForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    setTouched,
    resetForm,
    validateField
  ]);

  // Handle form submit event
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    await submitForm();
  }, [submitForm]);

  // Get field props for easy integration
  const getFieldProps = useCallback((name: keyof T): FieldProps => ({
    name: name as string,
    value: state.values[name] ?? '',
    onChange: (event: React.ChangeEvent<any>) => {
      const value = event.target.type === 'checkbox' 
        ? event.target.checked 
        : event.target.value;
      setFieldValue(name, value);
    },
    onBlur: () => setFieldTouched(name, true),
    error: state.errors[name],
    touched: state.touched[name] ?? false,
    dirty: state.dirty[name] ?? false
  }), [state, setFieldValue, setFieldTouched]);

  // Calculate overall form validity
  useEffect(() => {
    const isValid = Object.keys(state.errors).length === 0;
    if (state.isValid !== isValid) {
      setState(prev => ({ ...prev, isValid }));
    }
  }, [state.errors, state.isValid]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    isValid: state.isValid,
    submitCount: state.submitCount,
    getFieldProps,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    setTouched,
    resetForm,
    submitForm,
    validateField,
    validateForm,
    handleSubmit
  };
}

// Higher-order component for form integration
export function withForm<P extends object, T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P & { form: FormReturn<T> }>,
  config: FormConfig<T>
) {
  return function FormWrappedComponent(props: P) {
    const form = useForm(config);
    return <WrappedComponent {...props} form={form} />;
  };
}

// Custom hooks for specific form patterns
export function useFieldArray<T>(
  name: string,
  form: FormReturn<any>
): {
  fields: T[];
  append: (value: T) => void;
  prepend: (value: T) => void;
  insert: (index: number, value: T) => void;
  remove: (index: number) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  replace: (index: number, value: T) => void;
} {
  const fields = (form.values[name] as T[]) || [];

  const append = useCallback((value: T) => {
    form.setFieldValue(name, [...fields, value]);
  }, [fields, form, name]);

  const prepend = useCallback((value: T) => {
    form.setFieldValue(name, [value, ...fields]);
  }, [fields, form, name]);

  const insert = useCallback((index: number, value: T) => {
    const newFields = [...fields];
    newFields.splice(index, 0, value);
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  const remove = useCallback((index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  const swap = useCallback((indexA: number, indexB: number) => {
    const newFields = [...fields];
    [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  const move = useCallback((from: number, to: number) => {
    const newFields = [...fields];
    const item = newFields.splice(from, 1)[0];
    newFields.splice(to, 0, item);
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  const replace = useCallback((index: number, value: T) => {
    const newFields = [...fields];
    newFields[index] = value;
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  return {
    fields,
    append,
    prepend,
    insert,
    remove,
    swap,
    move,
    replace
  };
}