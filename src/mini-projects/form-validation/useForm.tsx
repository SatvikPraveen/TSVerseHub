// File: mini-projects/form-validation/useForm.ts

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

import { 
  type ValidationSchema, 
  ValidationEngine, 
  type ValidationErrors, 
  type FieldError,
  type ValidationContext 
} from './validation';

// Leaf values that are addressed directly rather than traversed into
type PathLeaf = string | number | boolean | bigint | symbol | null | undefined | Date | readonly unknown[] | ((...args: never[]) => unknown);

type NestedFieldPath<T> = 0 extends 1 & T
  ? string // `any` values accept any path
  : {
      [K in keyof T & string]: NonNullable<T[K]> extends PathLeaf
        ? K
        : K | `${K}.${NestedFieldPath<NonNullable<T[K]>>}`;
    }[keyof T & string];

/**
 * Dotted path into the form values, e.g. 'email' or 'address.street'.
 * Intersected with string so generic code can use it wherever a key is expected.
 */
export type FieldPath<T> = string & NestedFieldPath<T>;

/** Per-field boolean flags (touched / dirty) keyed by field path */
export type FieldFlags<T> = Partial<Record<FieldPath<T>, boolean>>;

/** Read a (possibly nested) value by dotted path */
export function getPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (acc, key) => (acc !== null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
    source
  );
}

/**
 * Form values are typed as the caller's own interface, which carries no index
 * signature; the validation engine only needs string-keyed read access.
 */
function asRecord(values: object): Record<string, unknown> {
  return values as Record<string, unknown>;
}

/** Immutably write a (possibly nested) value by dotted path */
export function setPath<V extends object>(source: V, path: string, value: unknown): V {
  const [head, ...rest] = path.split('.');
  if (head === undefined) return source;
  if (rest.length === 0) return { ...source, [head]: value };
  const child = asRecord(source)[head];
  const nested = child !== null && typeof child === 'object' && !Array.isArray(child)
    ? (child as Record<string, unknown>)
    : {};
  return { ...source, [head]: setPath(nested, rest.join('.'), value) };
}

/** Collect every leaf path of a values object (e.g. ['email', 'address.street']) */
function collectLeafPaths(source: unknown, prefix = ''): string[] {
  if (source === null || typeof source !== 'object' || Array.isArray(source) || source instanceof Date) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(source as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

/** Return a copy of `errors` with `field` set to `fieldErrors`, or removed when there are none */
function withFieldErrors(errors: ValidationErrors, field: string, fieldErrors: FieldError[] | undefined): ValidationErrors {
  const next = { ...errors };
  if (fieldErrors && fieldErrors.length > 0) {
    next[field] = fieldErrors;
  } else {
    delete next[field];
  }
  return next;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: ValidationErrors;
  touched: FieldFlags<T>;
  dirty: FieldFlags<T>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface FormConfig<T = Record<string, unknown>> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  enableReinitialize?: boolean;
  onSubmit?: (values: T, actions: FormActions<T>) => void | Promise<void>;
  onValidationError?: (errors: ValidationErrors) => void;
}

export interface FormActions<T = Record<string, unknown>> {
  setFieldValue: (field: FieldPath<T>, value: unknown) => void;
  setFieldError: (field: FieldPath<T>, error: string | FieldError[]) => void;
  setFieldTouched: (field: FieldPath<T>, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<ValidationErrors>) => void;
  setTouched: (touched: FieldFlags<T>) => void;
  resetForm: (newValues?: Partial<T>) => void;
  submitForm: () => Promise<void>;
  validateField: (field: FieldPath<T>) => Promise<FieldError[]>;
  validateForm: () => Promise<boolean>;
}

/** Native form controls that `getFieldProps` can be spread onto */
export type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** What React accepts for a control's `value` attribute */
export type InputValue = string | number | readonly string[];

/**
 * Coerce an arbitrary form value into something a native control can display.
 * Mirrors what React does when rendering the attribute (strings/numbers pass
 * through, nullish becomes '', anything else is stringified).
 */
function toInputValue(raw: unknown): InputValue {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (Array.isArray(raw) && raw.every(item => typeof item === 'string')) {
    return raw as readonly string[];
  }
  return String(raw);
}

export interface FieldProps {
  name: string;
  value: InputValue;
  onChange: (event: React.ChangeEvent<FormControlElement>) => void;
  onBlur: (event: React.FocusEvent<FormControlElement>) => void;
  error?: FieldError[];
  touched?: boolean;
  dirty?: boolean;
}

export interface FormReturn<T = Record<string, unknown>> {
  values: T;
  errors: ValidationErrors;
  touched: FieldFlags<T>;
  dirty: FieldFlags<T>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
  getFieldProps: (name: FieldPath<T>) => FieldProps;
  setFieldValue: (field: FieldPath<T>, value: unknown) => void;
  setFieldError: (field: FieldPath<T>, error: string | FieldError[]) => void;
  setFieldTouched: (field: FieldPath<T>, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<ValidationErrors>) => void;
  setTouched: (touched: FieldFlags<T>) => void;
  resetForm: (newValues?: Partial<T>) => void;
  submitForm: () => Promise<void>;
  validateField: (field: FieldPath<T>) => Promise<FieldError[]>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
}

export function useForm<T extends object>(
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
    touched: {},
    dirty: {},
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

  // Create validation context
  const createValidationContext = useCallback((fieldName: string): ValidationContext => ({
    fieldName,
    formData: asRecord(state.values),
    touched: state.touched,
    dirty: state.dirty
  }), [state.values, state.touched, state.dirty]);

  // Validate a single field
  const validateField = useCallback(async (field: FieldPath<T>): Promise<FieldError[]> => {
    if (!validationEngine.current) return [];

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const context = createValidationContext(field);
      const fieldErrors = await validationEngine.current.validateField(
        field,
        getPath(state.values, field),
        context
      );

      setState(prev => ({
        ...prev,
        errors: withFieldErrors(prev.errors, field, fieldErrors),
        isValidating: false
      }));

      return fieldErrors;
    } catch {
      setState(prev => ({ ...prev, isValidating: false }));
      return [];
    }
  }, [state.values, createValidationContext]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationEngine.current) return true;

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const formData = asRecord(state.values);
      const context = {
        fieldName: '',
        formData,
        touched: state.touched,
        dirty: state.dirty
      };

      const errors = await validationEngine.current.validateForm(formData, context);
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
    } catch {
      setState(prev => ({ ...prev, isValidating: false }));
      return false;
    }
  }, [state.values, state.touched, state.dirty, onValidationError]);

  // Validate on mount if enabled. The latest validateForm is read through a ref
  // so that this effect runs once per `validateOnMount` change rather than on
  // every values change.
  const validateFormRef = useRef(validateForm);
  useEffect(() => {
    validateFormRef.current = validateForm;
  }, [validateForm]);

  useEffect(() => {
    if (validateOnMount && validationEngine.current) {
      validateFormRef.current();
    }
  }, [validateOnMount]);

  // Set field value
  const setFieldValue = useCallback((field: FieldPath<T>, value: unknown) => {
    setState(prev => {
      const newValues = setPath(prev.values, field, value);
      const isDirty = getPath(newValues, field) !== getPath(initialValuesRef.current, field);

      return {
        ...prev,
        values: newValues,
        dirty: { ...prev.dirty, [field]: isDirty }
      };
    });

    // Validate on change if enabled
    if (validateOnChange && validationEngine.current) {
      const context = createValidationContext(field);
      validationEngine.current.validateFieldWithDebounce(
        field,
        value,
        { ...context, formData: asRecord(setPath(state.values, field, value)) },
        (errors) => {
          setState(prev => ({
            ...prev,
            errors: withFieldErrors(prev.errors, field, errors)
          }));
        }
      );
    }
  }, [validateOnChange, state.values, createValidationContext]);

  // Set field error
  const setFieldError = useCallback((field: FieldPath<T>, error: string | FieldError[]) => {
    setState(prev => ({
      ...prev,
      errors: withFieldErrors(prev.errors, field, typeof error === 'string' ? [{ message: error }] : error)
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: FieldPath<T>, touched: boolean = true) => {
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
      const newDirty: FieldFlags<T> = { ...prev.dirty };

      // Update dirty state for each (top-level) field
      (Object.keys(values) as FieldPath<T>[]).forEach(key => {
        newDirty[key] = getPath(newValues, key) !== getPath(initialValuesRef.current, key);
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
      errors: Object.entries(errors).reduce(
        (acc, [field, fieldErrors]) => withFieldErrors(acc, field, fieldErrors),
        prev.errors
      )
    }));
  }, []);

  // Set multiple touched fields
  const setTouched = useCallback((touched: FieldFlags<T>) => {
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
      touched: {},
      dirty: {},
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

    // Mark all (leaf) fields as touched
    const allTouched: FieldFlags<T> = {};
    (collectLeafPaths(state.values) as FieldPath<T>[]).forEach(path => {
      allTouched[path] = true;
    });
    
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
  const getFieldProps = useCallback((name: FieldPath<T>): FieldProps => ({
    name,
    value: toInputValue(getPath(state.values, name)),
    onChange: (event: React.ChangeEvent<FormControlElement>) => {
      const target = event.target;
      const value = target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
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
export function withForm<P extends object, T extends object>(
  WrappedComponent: React.ComponentType<P & { form: FormReturn<T> }>,
  config: FormConfig<T>
) {
  return function FormWrappedComponent(props: P) {
    const form = useForm(config);
    return <WrappedComponent {...props} form={form} />;
  };
}

// Custom hooks for specific form patterns
export function useFieldArray<T, V extends object = Record<string, unknown>>(
  name: FieldPath<V>,
  form: FormReturn<V>
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
  const fields = useMemo<T[]>(() => {
    const current = getPath(form.values, name);
    return Array.isArray(current) ? (current as T[]) : [];
  }, [form.values, name]);

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
    const itemA = newFields[indexA];
    const itemB = newFields[indexB];
    if (itemA === undefined || itemB === undefined) return;
    newFields[indexA] = itemB;
    newFields[indexB] = itemA;
    form.setFieldValue(name, newFields);
  }, [fields, form, name]);

  const move = useCallback((from: number, to: number) => {
    const newFields = [...fields];
    const [item] = newFields.splice(from, 1);
    if (item === undefined) return;
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