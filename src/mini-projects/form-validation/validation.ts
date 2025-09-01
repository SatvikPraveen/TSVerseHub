// File: mini-projects/form-validation/validation.ts

export type ValidationResult = {
  isValid: boolean;
  message?: string;
  code?: string;
};

export type ValidatorFunction<T = any> = (value: T, context?: ValidationContext) => ValidationResult | Promise<ValidationResult>;

export interface ValidationContext {
  fieldName: string;
  formData: Record<string, any>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
}

export interface ValidationRule<T = any> {
  validator: ValidatorFunction<T>;
  message?: string;
  code?: string;
  when?: (context: ValidationContext) => boolean;
}

export interface FieldValidation {
  rules: ValidationRule[];
  required?: boolean;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface ValidationSchema {
  [fieldName: string]: FieldValidation;
}

export interface FieldError {
  message: string;
  code?: string;
  rule?: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: FieldError[];
}

// Built-in validators
export const validators = {
  required: (message: string = 'This field is required'): ValidatorFunction => {
    return (value: any): ValidationResult => {
      const isEmpty = value === null || 
                      value === undefined || 
                      (typeof value === 'string' && value.trim() === '') ||
                      (Array.isArray(value) && value.length === 0);
      
      return {
        isValid: !isEmpty,
        message: isEmpty ? message : undefined,
        code: 'required'
      };
    };
  },

  minLength: (min: number, message?: string): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      const length = value ? value.length : 0;
      const isValid = length >= min;
      
      return {
        isValid,
        message: !isValid ? (message || `Must be at least ${min} characters`) : undefined,
        code: 'minLength'
      };
    };
  },

  maxLength: (max: number, message?: string): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      const length = value ? value.length : 0;
      const isValid = length <= max;
      
      return {
        isValid,
        message: !isValid ? (message || `Must be no more than ${max} characters`) : undefined,
        code: 'maxLength'
      };
    };
  },

  email: (message: string = 'Please enter a valid email address'): ValidatorFunction<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true }; // Let required handle empty values
      
      const isValid = emailRegex.test(value);
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: 'email'
      };
    };
  },

  pattern: (regex: RegExp, message: string): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true }; // Let required handle empty values
      
      const isValid = regex.test(value);
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: 'pattern'
      };
    };
  },

  min: (minValue: number, message?: string): ValidatorFunction<number> => {
    return (value: number): ValidationResult => {
      if (value === null || value === undefined) return { isValid: true };
      
      const isValid = value >= minValue;
      return {
        isValid,
        message: !isValid ? (message || `Must be at least ${minValue}`) : undefined,
        code: 'min'
      };
    };
  },

  max: (maxValue: number, message?: string): ValidatorFunction<number> => {
    return (value: number): ValidationResult => {
      if (value === null || value === undefined) return { isValid: true };
      
      const isValid = value <= maxValue;
      return {
        isValid,
        message: !isValid ? (message || `Must be no more than ${maxValue}`) : undefined,
        code: 'max'
      };
    };
  },

  url: (message: string = 'Please enter a valid URL'): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true };
      
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return {
          isValid: false,
          message,
          code: 'url'
        };
      }
    };
  },

  phone: (message: string = 'Please enter a valid phone number'): ValidatorFunction<string> => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true };
      
      const cleanValue = value.replace(/[\s\-\(\)\.]/g, '');
      const isValid = phoneRegex.test(cleanValue);
      
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: 'phone'
      };
    };
  },

  creditCard: (message: string = 'Please enter a valid credit card number'): ValidatorFunction<string> => {
    // Luhn algorithm implementation
    const luhnCheck = (num: string): boolean => {
      let sum = 0;
      let isEven = false;
      
      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    };

    return (value: string): ValidationResult => {
      if (!value) return { isValid: true };
      
      const cleanValue = value.replace(/\s/g, '');
      const isValid = /^\d{13,19}$/.test(cleanValue) && luhnCheck(cleanValue);
      
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: 'creditCard'
      };
    };
  },

  date: (message: string = 'Please enter a valid date'): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true };
      
      const date = new Date(value);
      const isValid = !isNaN(date.getTime());
      
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: 'date'
      };
    };
  },

  dateRange: (
    minDate: Date | string, 
    maxDate: Date | string, 
    message?: string
  ): ValidatorFunction<string> => {
    return (value: string): ValidationResult => {
      if (!value) return { isValid: true };
      
      const date = new Date(value);
      const min = new Date(minDate);
      const max = new Date(maxDate);
      
      if (isNaN(date.getTime())) {
        return {
          isValid: false,
          message: 'Please enter a valid date',
          code: 'date'
        };
      }
      
      const isValid = date >= min && date <= max;
      
      return {
        isValid,
        message: !isValid ? (message || `Date must be between ${min.toDateString()} and ${max.toDateString()}`) : undefined,
        code: 'dateRange'
      };
    };
  },

  matches: (fieldName: string, message?: string): ValidatorFunction => {
    return (value: any, context?: ValidationContext): ValidationResult => {
      if (!context) return { isValid: true };
      
      const otherValue = context.formData[fieldName];
      const isValid = value === otherValue;
      
      return {
        isValid,
        message: !isValid ? (message || `Must match ${fieldName}`) : undefined,
        code: 'matches'
      };
    };
  },

  custom: (
    validatorFn: (value: any, context?: ValidationContext) => boolean,
    message: string,
    code?: string
  ): ValidatorFunction => {
    return (value: any, context?: ValidationContext): ValidationResult => {
      const isValid = validatorFn(value, context);
      
      return {
        isValid,
        message: !isValid ? message : undefined,
        code: code || 'custom'
      };
    };
  },

  async: (
    validatorFn: (value: any, context?: ValidationContext) => Promise<boolean>,
    message: string,
    code?: string
  ): ValidatorFunction => {
    return async (value: any, context?: ValidationContext): Promise<ValidationResult> => {
      try {
        const isValid = await validatorFn(value, context);
        
        return {
          isValid,
          message: !isValid ? message : undefined,
          code: code || 'async'
        };
      } catch (error) {
        return {
          isValid: false,
          message: 'Validation error occurred',
          code: 'asyncError'
        };
      }
    };
  }
};

// Composite validators
export const compositeValidators = {
  password: (
    minLength: number = 8,
    requireSpecialChar: boolean = true,
    requireNumber: boolean = true,
    requireUppercase: boolean = true
  ): ValidationRule[] => {
    const rules: ValidationRule[] = [
      { validator: validators.minLength(minLength) }
    ];

    if (requireSpecialChar) {
      rules.push({
        validator: validators.pattern(
          /[!@#$%^&*(),.?":{}|<>]/,
          'Password must contain at least one special character'
        )
      });
    }

    if (requireNumber) {
      rules.push({
        validator: validators.pattern(/\d/, 'Password must contain at least one number')
      });
    }

    if (requireUppercase) {
      rules.push({
        validator: validators.pattern(/[A-Z]/, 'Password must contain at least one uppercase letter')
      });
    }

    return rules;
  },

  name: (): ValidationRule[] => [
    { validator: validators.required('Name is required') },
    { validator: validators.minLength(2, 'Name must be at least 2 characters') },
    { validator: validators.maxLength(50, 'Name must be no more than 50 characters') },
    { 
      validator: validators.pattern(
        /^[a-zA-Z\s\-']+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      )
    }
  ],

  address: (): ValidationRule[] => [
    { validator: validators.required('Address is required') },
    { validator: validators.minLength(5, 'Address must be at least 5 characters') },
    { validator: validators.maxLength(200, 'Address must be no more than 200 characters') }
  ],

  zipCode: (country: string = 'US'): ValidationRule[] => {
    const patterns = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/
    };

    return [
      { validator: validators.required('Zip code is required') },
      { 
        validator: validators.pattern(
          patterns[country as keyof typeof patterns] || patterns.US,
          `Please enter a valid ${country} zip code`
        )
      }
    ];
  }
};

// Validation engine
export class ValidationEngine {
  private schema: ValidationSchema;
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  async validateField(
    fieldName: string,
    value: any,
    context: ValidationContext
  ): Promise<FieldError[]> {
    const fieldValidation = this.schema[fieldName];
    if (!fieldValidation) return [];

    const errors: FieldError[] = [];

    // Check required validation first
    if (fieldValidation.required) {
      const requiredResult = validators.required()(value);
      if (!requiredResult.isValid) {
        errors.push({
          message: requiredResult.message!,
          code: requiredResult.code
        });
        return errors; // Don't continue if required validation fails
      }
    }

    // Run other validations
    for (const rule of fieldValidation.rules) {
      // Check conditional validation
      if (rule.when && !rule.when(context)) {
        continue;
      }

      try {
        const result = await rule.validator(value, context);
        
        if (!result.isValid) {
          errors.push({
            message: rule.message || result.message!,
            code: rule.code || result.code,
            rule
          });
        }
      } catch (error) {
        errors.push({
          message: 'Validation error occurred',
          code: 'validationError',
          rule
        });
      }
    }

    return errors;
  }

  async validateForm(
    formData: Record<string, any>,
    context: Partial<ValidationContext> = {}
  ): Promise<ValidationErrors> {
    const errors: ValidationErrors = {};
    const fullContext: ValidationContext = {
      fieldName: '',
      formData,
      touched: context.touched || {},
      dirty: context.dirty || {}
    };

    const validationPromises = Object.keys(this.schema).map(async (fieldName) => {
      const fieldContext = { ...fullContext, fieldName };
      const fieldErrors = await this.validateField(fieldName, formData[fieldName], fieldContext);
      
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    });

    await Promise.all(validationPromises);
    return errors;
  }

  async validateFieldWithDebounce(
    fieldName: string,
    value: any,
    context: ValidationContext,
    callback: (errors: FieldError[]) => void
  ): Promise<void> {
    const fieldValidation = this.schema[fieldName];
    if (!fieldValidation) return;

    const debounceMs = fieldValidation.debounceMs || 300;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(fieldName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      const errors = await this.validateField(fieldName, value, context);
      callback(errors);
      this.debounceTimers.delete(fieldName);
    }, debounceMs);

    this.debounceTimers.set(fieldName, timer);
  }

  updateSchema(newSchema: Partial<ValidationSchema>): void {
    this.schema = { ...this.schema, ...newSchema };
  }

  getSchema(): ValidationSchema {
    return { ...this.schema };
  }

  clearDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Utility functions
export function createValidationSchema(schema: ValidationSchema): ValidationEngine {
  return new ValidationEngine(schema);
}

export function combineValidators(...validators: ValidatorFunction[]): ValidatorFunction {
  return async (value: any, context?: ValidationContext): Promise<ValidationResult> => {
    for (const validator of validators) {
      const result = await validator(value, context);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
}

export function conditionalValidator(
  condition: (context: ValidationContext) => boolean,
  validator: ValidatorFunction,
  elseValidator?: ValidatorFunction
): ValidatorFunction {
  return async (value: any, context?: ValidationContext): Promise<ValidationResult> => {
    if (!context) return { isValid: true };
    
    if (condition(context)) {
      return validator(value, context);
    } else if (elseValidator) {
      return elseValidator(value, context);
    }
    
    return { isValid: true };
  };
}