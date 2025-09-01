// File: tests/mini-projects/form-validation.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Form Validation System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Rules', () => {
    it('should implement basic validation rules', () => {
      interface ValidationResult {
        isValid: boolean;
        message?: string;
      }
      
      type ValidationRule<T = any> = (value: T) => ValidationResult;
      
      class ValidationRules {
        static required(): ValidationRule<any> {
          return (value: any) => ({
            isValid: value !== null && value !== undefined && value !== '',
            message: 'This field is required'
          });
        }
        
        static minLength(min: number): ValidationRule<string> {
          return (value: string) => ({
            isValid: !value || value.length >= min,
            message: `Must be at least ${min} characters long`
          });
        }
        
        static maxLength(max: number): ValidationRule<string> {
          return (value: string) => ({
            isValid: !value || value.length <= max,
            message: `Must be no more than ${max} characters long`
          });
        }
        
        static email(): ValidationRule<string> {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return (value: string) => ({
            isValid: !value || emailRegex.test(value),
            message: 'Must be a valid email address'
          });
        }
        
        static pattern(regex: RegExp, message: string): ValidationRule<string> {
          return (value: string) => ({
            isValid: !value || regex.test(value),
            message
          });
        }
        
        static min(minValue: number): ValidationRule<number> {
          return (value: number) => ({
            isValid: value === undefined || value === null || value >= minValue,
            message: `Must be at least ${minValue}`
          });
        }
        
        static max(maxValue: number): ValidationRule<number> {
          return (value: number) => ({
            isValid: value === undefined || value === null || value <= maxValue,
            message: `Must be no more than ${maxValue}`
          });
        }
        
        static custom<T>(validator: (value: T) => boolean, message: string): ValidationRule<T> {
          return (value: T) => ({
            isValid: validator(value),
            message
          });
        }
        
        static match<T>(otherValue: T, message: string = 'Values must match'): ValidationRule<T> {
          return (value: T) => ({
            isValid: value === otherValue,
            message
          });
        }
      }
      
      // Test required rule
      const requiredRule = ValidationRules.required();
      expect(requiredRule('test').isValid).toBe(true);
      expect(requiredRule('').isValid).toBe(false);
      expect(requiredRule(null).isValid).toBe(false);
      expect(requiredRule(undefined).isValid).toBe(false);
      
      // Test minLength rule
      const minLengthRule = ValidationRules.minLength(5);
      expect(minLengthRule('hello').isValid).toBe(true);
      expect(minLengthRule('hi').isValid).toBe(false);
      expect(minLengthRule('').isValid).toBe(true); // Empty is valid for optional fields
      
      // Test email rule
      const emailRule = ValidationRules.email();
      expect(emailRule('test@example.com').isValid).toBe(true);
      expect(emailRule('invalid-email').isValid).toBe(false);
      expect(emailRule('').isValid).toBe(true); // Empty is valid for optional fields
      
      // Test pattern rule
      const phoneRule = ValidationRules.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Must be in format XXX-XXX-XXXX');
      expect(phoneRule('123-456-7890').isValid).toBe(true);
      expect(phoneRule('1234567890').isValid).toBe(false);
      expect(phoneRule('123-456-7890').message).toBeUndefined();
      expect(phoneRule('1234567890').message).toBe('Must be in format XXX-XXX-XXXX');
      
      // Test numeric rules
      const minRule = ValidationRules.min(18);
      const maxRule = ValidationRules.max(100);
      expect(minRule(25).isValid).toBe(true);
      expect(minRule(15).isValid).toBe(false);
      expect(maxRule(50).isValid).toBe(true);
      expect(maxRule(150).isValid).toBe(false);
      
      // Test custom rule
      const strongPasswordRule = ValidationRules.custom<string>(
        (password) => {
          return password.length >= 8 && 
                 /[A-Z]/.test(password) && 
                 /[a-z]/.test(password) && 
                 /\d/.test(password) && 
                 /[!@#$%^&*]/.test(password);
        },
        'Password must contain uppercase, lowercase, number, and special character'
      );
      
      expect(strongPasswordRule('Password123!').isValid).toBe(true);
      expect(strongPasswordRule('password').isValid).toBe(false);
      
      // Test match rule
      const confirmPasswordRule = ValidationRules.match('Password123!', 'Passwords must match');
      expect(confirmPasswordRule('Password123!').isValid).toBe(true);
      expect(confirmPasswordRule('Different').isValid).toBe(false);
    });
  });

  describe('Field Validator', () => {
    it('should validate individual fields with multiple rules', () => {
      interface ValidationResult {
        isValid: boolean;
        message?: string;
      }
      
      type ValidationRule<T = any> = (value: T) => ValidationResult;
      
      class FieldValidator<T = any> {
        private rules: ValidationRule<T>[] = [];
        private value: T | undefined;
        
        constructor(private fieldName: string) {}
        
        addRule(rule: ValidationRule<T>): this {
          this.rules.push(rule);
          return this;
        }
        
        setValue(value: T): this {
          this.value = value;
          return this;
        }
        
        validate(value?: T): ValidationResult {
          const valueToValidate = value !== undefined ? value : this.value;
          
          for (const rule of this.rules) {
            const result = rule(valueToValidate);
            if (!result.isValid) {
              return {
                isValid: false,
                message: result.message
              };
            }
          }
          
          return { isValid: true };
        }
        
        getFieldName(): string {
          return this.fieldName;
        }
        
        getRuleCount(): number {
          return this.rules.length;
        }
        
        clearRules(): this {
          this.rules = [];
          return this;
        }
      }
      
      // Mock validation rules for testing
      const required = () => (value: any) => ({
        isValid: value !== null && value !== undefined && value !== '',
        message: 'Required field'
      });
      
      const minLength = (min: number) => (value: string) => ({
        isValid: !value || value.length >= min,
        message: `Must be at least ${min} characters`
      });
      
      const email = () => (value: string) => ({
        isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Must be valid email'
      });
      
      // Test field validator
      const emailValidator = new FieldValidator<string>('email')
        .addRule(required())
        .addRule(email())
        .addRule(minLength(5));
      
      expect(emailValidator.getFieldName()).toBe('email');
      expect(emailValidator.getRuleCount()).toBe(3);
      
      // Test valid email
      let result = emailValidator.validate('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
      
      // Test empty value (should fail required)
      result = emailValidator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Required field');
      
      // Test invalid email format
      result = emailValidator.validate('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Must be valid email');
      
      // Test too short
      result = emailValidator.validate('a@b.c');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Must be at least 5 characters');
      
      // Test with setValue
      emailValidator.setValue('valid@email.com');
      result = emailValidator.validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Form Validator', () => {
    it('should validate entire forms with multiple fields', () => {
      interface ValidationResult {
        isValid: boolean;
        message?: string;
      }
      
      interface FormValidationResult {
        isValid: boolean;
        errors: Record<string, string>;
      }
      
      type ValidationRule<T = any> = (value: T) => ValidationResult;
      type FieldValidator = {
        validate: (value: any) => ValidationResult;
      };
      
      class FormValidator {
        private fields: Map<string, FieldValidator> = new Map();
        private formData: Record<string, any> = {};
        
        addField(name: string, validator: FieldValidator): this {
          this.fields.set(name, validator);
          return this;
        }
        
        setData(data: Record<string, any>): this {
          this.formData = { ...data };
          return this;
        }
        
        validateField(fieldName: string, value?: any): ValidationResult {
          const validator = this.fields.get(fieldName);
          if (!validator) {
            throw new Error(`No validator found for field: ${fieldName}`);
          }
          
          const valueToValidate = value !== undefined ? value : this.formData[fieldName];
          return validator.validate(valueToValidate);
        }
        
        validateAll(data?: Record<string, any>): FormValidationResult {
          const dataToValidate = data || this.formData;
          const errors: Record<string, string> = {};
          let isValid = true;
          
          for (const [fieldName, validator] of this.fields) {
            const result = validator.validate(dataToValidate[fieldName]);
            if (!result.isValid) {
              errors[fieldName] = result.message || 'Invalid value';
              isValid = false;
            }
          }
          
          return { isValid, errors };
        }
        
        hasField(fieldName: string): boolean {
          return this.fields.has(fieldName);
        }
        
        getFieldNames(): string[] {
          return Array.from(this.fields.keys());
        }
        
        removeField(fieldName: string): boolean {
          return this.fields.delete(fieldName);
        }
        
        clearFields(): void {
          this.fields.clear();
        }
      }
      
      // Mock field validators
      class MockFieldValidator {
        constructor(private rules: ValidationRule[]) {}
        
        validate(value: any): ValidationResult {
          for (const rule of this.rules) {
            const result = rule(value);
            if (!result.isValid) {
              return result;
            }
          }
          return { isValid: true };
        }
      }
      
      // Create validation rules
      const required = () => (value: any) => ({
        isValid: value !== null && value !== undefined && value !== '',
        message: 'This field is required'
      });
      
      const minLength = (min: number) => (value: string) => ({
        isValid: !value || value.length >= min,
        message: `Must be at least ${min} characters long`
      });
      
      const email = () => (value: string) => ({
        isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Must be a valid email address'
      });
      
      const min = (minValue: number) => (value: number) => ({
        isValid: value >= minValue,
        message: `Must be at least ${minValue}`
      });
      
      // Create form validator
      const formValidator = new FormValidator()
        .addField('name', new MockFieldValidator([required(), minLength(2)]))
        .addField('email', new MockFieldValidator([required(), email()]))
        .addField('age', new MockFieldValidator([required(), min(18)]));
      
      expect(formValidator.hasField('name')).toBe(true);
      expect(formValidator.hasField('nonexistent')).toBe(false);
      expect(formValidator.getFieldNames()).toEqual(['name', 'email', 'age']);
      
      // Test valid form data
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      
      let result = formValidator.validateAll(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      
      // Test invalid form data
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: 15
      };
      
      result = formValidator.validateAll(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('This field is required');
      expect(result.errors.email).toBe('Must be a valid email address');
      expect(result.errors.age).toBe('Must be at least 18');
      
      // Test individual field validation
      formValidator.setData(invalidData);
      
      const nameResult = formValidator.validateField('name');
      expect(nameResult.isValid).toBe(false);
      expect(nameResult.message).toBe('This field is required');
      
      const emailResult = formValidator.validateField('email', 'valid@email.com');
      expect(emailResult.isValid).toBe(true);
      
      // Test field management
      formValidator.removeField('age');
      expect(formValidator.hasField('age')).toBe(false);
      expect(formValidator.getFieldNames()).toEqual(['name', 'email']);
    });
  });

  describe('Async Validation', () => {
    it('should handle async validation rules', async () => {
      interface AsyncValidationResult {
        isValid: boolean;
        message?: string;
      }
      
      type AsyncValidationRule<T = any> = (value: T) => Promise<AsyncValidationResult>;
      
      class AsyncFieldValidator<T = any> {
        private syncRules: Array<(value: T) => AsyncValidationResult> = [];
        private asyncRules: AsyncValidationRule<T>[] = [];
        
        addSyncRule(rule: (value: T) => AsyncValidationResult): this {
          this.syncRules.push(rule);
          return this;
        }
        
        addAsyncRule(rule: AsyncValidationRule<T>): this {
          this.asyncRules.push(rule);
          return this;
        }
        
        async validate(value: T): Promise<AsyncValidationResult> {
          // Run sync rules first
          for (const rule of this.syncRules) {
            const result = rule(value);
            if (!result.isValid) {
              return result;
            }
          }
          
          // Run async rules
          for (const rule of this.asyncRules) {
            const result = await rule(value);
            if (!result.isValid) {
              return result;
            }
          }
          
          return { isValid: true };
        }
      }
      
      class AsyncFormValidator {
        private fields: Map<string, AsyncFieldValidator> = new Map();
        
        addField(name: string, validator: AsyncFieldValidator): this {
          this.fields.set(name, validator);
          return this;
        }
        
        async validateField(fieldName: string, value: any): Promise<AsyncValidationResult> {
          const validator = this.fields.get(fieldName);
          if (!validator) {
            throw new Error(`No validator found for field: ${fieldName}`);
          }
          
          return await validator.validate(value);
        }
        
        async validateAll(data: Record<string, any>): Promise<{
          isValid: boolean;
          errors: Record<string, string>;
        }> {
          const errors: Record<string, string> = {};
          const validationPromises: Promise<void>[] = [];
          
          for (const [fieldName, validator] of this.fields) {
            const promise = validator.validate(data[fieldName]).then(result => {
              if (!result.isValid) {
                errors[fieldName] = result.message || 'Invalid value';
              }
            });
            validationPromises.push(promise);
          }
          
          await Promise.all(validationPromises);
          
          return {
            isValid: Object.keys(errors).length === 0,
            errors
          };
        }
      }
      
      // Mock async validation functions
      const checkUsernameAvailability = async (username: string): Promise<AsyncValidationResult> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const unavailableUsernames = ['admin', 'test', 'user'];
        return {
          isValid: !unavailableUsernames.includes(username.toLowerCase()),
          message: unavailableUsernames.includes(username.toLowerCase()) ? 
            'Username is already taken' : undefined
        };
      };
      
      const checkEmailExists = async (email: string): Promise<AsyncValidationResult> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const existingEmails = ['existing@example.com', 'taken@test.com'];
        return {
          isValid: !existingEmails.includes(email.toLowerCase()),
          message: existingEmails.includes(email.toLowerCase()) ? 
            'Email is already registered' : undefined
        };
      };
      
      // Create validators with async rules
      const usernameValidator = new AsyncFieldValidator<string>()
        .addSyncRule((value: string) => ({
          isValid: value.length >= 3,
          message: 'Username must be at least 3 characters long'
        }))
        .addAsyncRule(checkUsernameAvailability);
      
      const emailValidator = new AsyncFieldValidator<string>()
        .addSyncRule((value: string) => ({
          isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Must be a valid email address'
        }))
        .addAsyncRule(checkEmailExists);
      
      const formValidator = new AsyncFormValidator()
        .addField('username', usernameValidator)
        .addField('email', emailValidator);
      
      // Test valid data
      const validResult = await formValidator.validateAll({
        username: 'newuser',
        email: 'new@example.com'
      });
      
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors)).toHaveLength(0);
      
      // Test invalid data (sync validation fails)
      const invalidSyncResult = await formValidator.validateAll({
        username: 'ab', // Too short
        email: 'invalid-email'
      });
      
      expect(invalidSyncResult.isValid).toBe(false);
      expect(invalidSyncResult.errors.username).toBe('Username must be at least 3 characters long');
      expect(invalidSyncResult.errors.email).toBe('Must be a valid email address');
      
      // Test invalid data (async validation fails)
      const invalidAsyncResult = await formValidator.validateAll({
        username: 'admin', // Taken username
        email: 'existing@example.com' // Existing email
      });
      
      expect(invalidAsyncResult.isValid).toBe(false);
      expect(invalidAsyncResult.errors.username).toBe('Username is already taken');
      expect(invalidAsyncResult.errors.email).toBe('Email is already registered');
      
      // Test individual field validation
      const usernameResult = await formValidator.validateField('username', 'availableuser');
      expect(usernameResult.isValid).toBe(true);
      
      const takenUsernameResult = await formValidator.validateField('username', 'test');
      expect(takenUsernameResult.isValid).toBe(false);
      expect(takenUsernameResult.message).toBe('Username is already taken');
    });
  });

  describe('Custom Validation Messages', () => {
    it('should support custom validation messages and internationalization', () => {
      interface ValidationResult {
        isValid: boolean;
        messageKey?: string;
        messageParams?: Record<string, any>;
        message?: string;
      }
      
      type MessageResolver = (key: string, params?: Record<string, any>) => string;
      
      class I18nValidator {
        private messageResolver: MessageResolver;
        
        constructor(messageResolver: MessageResolver) {
          this.messageResolver = messageResolver;
        }
        
        required(): (value: any) => ValidationResult {
          return (value: any) => ({
            isValid: value !== null && value !== undefined && value !== '',
            messageKey: 'validation.required'
          });
        }
        
        minLength(min: number): (value: string) => ValidationResult {
          return (value: string) => ({
            isValid: !value || value.length >= min,
            messageKey: 'validation.minLength',
            messageParams: { min }
          });
        }
        
        maxLength(max: number): (value: string) => ValidationResult {
          return (value: string) => ({
            isValid: !value || value.length <= max,
            messageKey: 'validation.maxLength',
            messageParams: { max }
          });
        }
        
        email(): (value: string) => ValidationResult {
          return (value: string) => ({
            isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            messageKey: 'validation.email'
          });
        }
        
        custom<T>(
          validator: (value: T) => boolean,
          messageKey: string,
          messageParams?: Record<string, any>
        ): (value: T) => ValidationResult {
          return (value: T) => ({
            isValid: validator(value),
            messageKey,
            messageParams
          });
        }
        
        resolveMessage(result: ValidationResult): string {
          if (result.isValid || !result.messageKey) {
            return '';
          }
          
          if (result.message) {
            return result.message;
          }
          
          return this.messageResolver(result.messageKey, result.messageParams);
        }
      }
      
      // Mock message resolver with different languages
      const createMessageResolver = (language: 'en' | 'es' | 'fr'): MessageResolver => {
        const messages = {
          en: {
            'validation.required': 'This field is required',
            'validation.minLength': 'Must be at least {{min}} characters long',
            'validation.maxLength': 'Must be no more than {{max}} characters long',
            'validation.email': 'Must be a valid email address',
            'validation.custom.strongPassword': 'Password must contain uppercase, lowercase, number, and special character'
          },
          es: {
            'validation.required': 'Este campo es obligatorio',
            'validation.minLength': 'Debe tener al menos {{min}} caracteres',
            'validation.maxLength': 'No debe tener más de {{max}} caracteres',
            'validation.email': 'Debe ser una dirección de correo válida',
            'validation.custom.strongPassword': 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
          },
          fr: {
            'validation.required': 'Ce champ est requis',
            'validation.minLength': 'Doit contenir au moins {{min}} caractères',
            'validation.maxLength': 'Ne doit pas contenir plus de {{max}} caractères',
            'validation.email': 'Doit être une adresse email valide',
            'validation.custom.strongPassword': 'Le mot de passe doit contenir des majuscules, minuscules, chiffres et caractères spéciaux'
          }
        };
        
        return (key: string, params?: Record<string, any>) => {
          let message = messages[language][key] || key;
          
          if (params) {
            Object.keys(params).forEach(param => {
              message = message.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
            });
          }
          
          return message;
        };
      };
      
      // Test English messages
      const enValidator = new I18nValidator(createMessageResolver('en'));
      
      let requiredRule = enValidator.required();
      let result = requiredRule('');
      expect(result.isValid).toBe(false);
      expect(enValidator.resolveMessage(result)).toBe('This field is required');
      
      let minLengthRule = enValidator.minLength(5);
      result = minLengthRule('abc');
      expect(result.isValid).toBe(false);
      expect(enValidator.resolveMessage(result)).toBe('Must be at least 5 characters long');
      
      let emailRule = enValidator.email();
      result = emailRule('invalid-email');
      expect(result.isValid).toBe(false);
      expect(enValidator.resolveMessage(result)).toBe('Must be a valid email address');
      
      // Test Spanish messages
      const esValidator = new I18nValidator(createMessageResolver('es'));
      
      requiredRule = esValidator.required();
      result = requiredRule('');
      expect(esValidator.resolveMessage(result)).toBe('Este campo es obligatorio');
      
      minLengthRule = esValidator.minLength(3);
      result = minLengthRule('ab');
      expect(esValidator.resolveMessage(result)).toBe('Debe tener al menos 3 caracteres');
      
      // Test French messages
      const frValidator = new I18nValidator(createMessageResolver('fr'));
      
      const maxLengthRule = frValidator.maxLength(10);
      result = maxLengthRule('This is a very long text');
      expect(frValidator.resolveMessage(result)).toBe('Ne doit pas contenir plus de 10 caractères');
      
      // Test custom validation with parameters
      const strongPasswordRule = enValidator.custom<string>(
        (password) => {
          return password.length >= 8 && 
                 /[A-Z]/.test(password) && 
                 /[a-z]/.test(password) && 
                 /\d/.test(password) && 
                 /[!@#$%^&*]/.test(password);
        },
        'validation.custom.strongPassword'
      );
      
      result = strongPasswordRule('weak');
      expect(result.isValid).toBe(false);
      expect(enValidator.resolveMessage(result)).toBe('Password must contain uppercase, lowercase, number, and special character');
      
      const esStrongPasswordRule = esValidator.custom<string>(
        (password) => password.length >= 8,
        'validation.custom.strongPassword'
      );
      
      result = esStrongPasswordRule('weak');
      expect(esValidator.resolveMessage(result)).toBe('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales');
    });
  });

  describe('Conditional Validation', () => {
    it('should support conditional validation based on other field values', () => {
      interface ValidationContext {
        [key: string]: any;
      }
      
      interface ConditionalValidationResult {
        isValid: boolean;
        message?: string;
        shouldValidate?: boolean;
      }
      
      type ConditionalRule<T = any> = (value: T, context: ValidationContext) => ConditionalValidationResult;
      
      class ConditionalValidator {
        private rules: ConditionalRule[] = [];
        
        addRule(rule: ConditionalRule): this {
          this.rules.push(rule);
          return this;
        }
        
        validate(value: any, context: ValidationContext): ConditionalValidationResult {
          for (const rule of this.rules) {
            const result = rule(value, context);
            
            // If shouldValidate is false, skip this rule
            if (result.shouldValidate === false) {
              continue;
            }
            
            if (!result.isValid) {
              return result;
            }
          }
          
          return { isValid: true };
        }
      }
      
      class ConditionalFormValidator {
        private fields: Map<string, ConditionalValidator> = new Map();
        
        addField(name: string, validator: ConditionalValidator): this {
          this.fields.set(name, validator);
          return this;
        }
        
        validateAll(data: ValidationContext): {
          isValid: boolean;
          errors: Record<string, string>;
        } {
          const errors: Record<string, string> = {};
          
          for (const [fieldName, validator] of this.fields) {
            const result = validator.validate(data[fieldName], data);
            if (!result.isValid && result.shouldValidate !== false) {
              errors[fieldName] = result.message || 'Invalid value';
            }
          }
          
          return {
            isValid: Object.keys(errors).length === 0,
            errors
          };
        }
      }
      
      // Create conditional validation rules
      const requiredIf = (condition: (context: ValidationContext) => boolean): ConditionalRule => {
        return (value, context) => {
          const shouldValidate = condition(context);
          
          if (!shouldValidate) {
            return { isValid: true, shouldValidate: false };
          }
          
          return {
            isValid: value !== null && value !== undefined && value !== '',
            message: 'This field is required',
            shouldValidate: true
          };
        };
      };
      
      const requiredUnless = (condition: (context: ValidationContext) => boolean): ConditionalRule => {
        return (value, context) => {
          const shouldSkip = condition(context);
          
          if (shouldSkip) {
            return { isValid: true, shouldValidate: false };
          }
          
          return {
            isValid: value !== null && value !== undefined && value !== '',
            message: 'This field is required',
            shouldValidate: true
          };
        };
      };
      
      const validateIfPresent = (validationFn: (value: any) => boolean, message: string): ConditionalRule => {
        return (value, context) => {
          if (!value || value === '') {
            return { isValid: true, shouldValidate: false };
          }
          
          return {
            isValid: validationFn(value),
            message,
            shouldValidate: true
          };
        };
      };
      
      // Create form with conditional validation
      const formValidator = new ConditionalFormValidator();
      
      // Shipping address is required only if different from billing
      const shippingAddressValidator = new ConditionalValidator()
        .addRule(requiredIf(context => context.differentShippingAddress === true));
      
      // Phone is required if contact method is 'phone'
      const phoneValidator = new ConditionalValidator()
        .addRule(requiredIf(context => context.contactMethod === 'phone'))
        .addRule(validateIfPresent(
          value => /^\d{3}-\d{3}-\d{4}$/.test(value),
          'Phone must be in format XXX-XXX-XXXX'
        ));
      
      // Email is required unless contact method is 'phone'
      const emailValidator = new ConditionalValidator()
        .addRule(requiredUnless(context => context.contactMethod === 'phone'))
        .addRule(validateIfPresent(
          value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          'Must be valid email'
        ));
      
      // Company name is required if account type is 'business'
      const companyNameValidator = new ConditionalValidator()
        .addRule(requiredIf(context => context.accountType === 'business'));
      
      formValidator
        .addField('shippingAddress', shippingAddressValidator)
        .addField('phone', phoneValidator)
        .addField('email', emailValidator)
        .addField('companyName', companyNameValidator);
      
      // Test scenario 1: Personal account, email contact, same address
      let result = formValidator.validateAll({
        accountType: 'personal',
        contactMethod: 'email',
        differentShippingAddress: false,
        email: 'test@example.com',
        phone: '',
        shippingAddress: '',
        companyName: ''
      });
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      
      // Test scenario 2: Business account, phone contact, different address
      result = formValidator.validateAll({
        accountType: 'business',
        contactMethod: 'phone',
        differentShippingAddress: true,
        email: '',
        phone: '123-456-7890',
        shippingAddress: '123 Main St',
        companyName: 'ACME Corp'
      });
      
      expect(result.isValid).toBe(true);
      
      // Test scenario 3: Missing required conditional fields
      result = formValidator.validateAll({
        accountType: 'business',
        contactMethod: 'phone',
        differentShippingAddress: true,
        email: '',
        phone: '', // Missing required phone
        shippingAddress: '', // Missing required shipping address
        companyName: '' // Missing required company name
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('This field is required');
      expect(result.errors.shippingAddress).toBe('This field is required');
      expect(result.errors.companyName).toBe('This field is required');
      expect(result.errors.email).toBeUndefined(); // Email not required when contact method is phone
      
      // Test scenario 4: Invalid format when field is present
      result = formValidator.validateAll({
        accountType: 'personal',
        contactMethod: 'email',
        differentShippingAddress: false,
        email: 'invalid-email',
        phone: '1234567890', // Invalid format
        shippingAddress: '',
        companyName: ''
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Must be valid email');
      expect(result.errors.phone).toBe('Phone must be in format XXX-XXX-XXXX');
    });
  });
});