// File: concepts/decorators/property-decorators.ts

/**
 * PROPERTY DECORATORS
 * 
 * A property decorator is declared just before a property declaration. 
 * Property decorators can't modify properties directly, but they can observe
 * and register metadata about the property.
 */

import 'reflect-metadata';

// Basic property decorator for marking required fields
export function Required(target: any, propertyName: string) {
  const existingRequired = Reflect.getMetadata('required', target) || [];
  Reflect.defineMetadata('required', [...existingRequired, propertyName], target);
}

// Property decorator with validation
export function MinLength(minLength: number) {
  return function (target: any, propertyName: string) {
    // Store validation metadata
    const validations = Reflect.getMetadata('validations', target) || {};
    validations[propertyName] = validations[propertyName] || [];
    validations[propertyName].push({
      type: 'minLength',
      value: minLength,
      message: `${propertyName} must be at least ${minLength} characters long`
    });
    Reflect.defineMetadata('validations', validations, target);

    // Create property descriptor with validation
    let value: string;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: string) {
        if (newValue && newValue.length < minLength) {
          throw new Error(`${propertyName} must be at least ${minLength} characters long`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Property decorator for maximum length validation
export function MaxLength(maxLength: number) {
  return function (target: any, propertyName: string) {
    const validations = Reflect.getMetadata('validations', target) || {};
    validations[propertyName] = validations[propertyName] || [];
    validations[propertyName].push({
      type: 'maxLength',
      value: maxLength,
      message: `${propertyName} must be at most ${maxLength} characters long`
    });
    Reflect.defineMetadata('validations', validations, target);

    let value: string;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: string) {
        if (newValue && newValue.length > maxLength) {
          throw new Error(`${propertyName} must be at most ${maxLength} characters long`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Email validation decorator
export function Email(target: any, propertyName: string) {
  const validations = Reflect.getMetadata('validations', target) || {};
  validations[propertyName] = validations[propertyName] || [];
  validations[propertyName].push({
    type: 'email',
    message: `${propertyName} must be a valid email address`
  });
  Reflect.defineMetadata('validations', validations, target);

  let value: string;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  Object.defineProperty(target, propertyName, {
    get: function() {
      return value;
    },
    set: function(newValue: string) {
      if (newValue && !emailRegex.test(newValue)) {
        throw new Error(`${propertyName} must be a valid email address`);
      }
      value = newValue;
    },
    enumerable: true,
    configurable: true
  });
}

// Range validation decorator
export function Range(min: number, max: number) {
  return function (target: any, propertyName: string) {
    const validations = Reflect.getMetadata('validations', target) || {};
    validations[propertyName] = validations[propertyName] || [];
    validations[propertyName].push({
      type: 'range',
      min,
      max,
      message: `${propertyName} must be between ${min} and ${max}`
    });
    Reflect.defineMetadata('validations', validations, target);

    let value: number;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: number) {
        if (newValue != null && (newValue < min || newValue > max)) {
          throw new Error(`${propertyName} must be between ${min} and ${max}`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Format decorator for automatic formatting
export function Format(formatter: (value: any) => any) {
  return function (target: any, propertyName: string) {
    let value: any;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: any) {
        value = formatter(newValue);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// ReadOnly decorator
export function ReadOnly(target: any, propertyName: string) {
  let value: any;
  let hasBeenSet = false;
  
  Object.defineProperty(target, propertyName, {
    get: function() {
      return value;
    },
    set: function(newValue: any) {
      if (hasBeenSet) {
        throw new Error(`Cannot set readonly property ${propertyName}`);
      }
      value = newValue;
      hasBeenSet = true;
    },
    enumerable: true,
    configurable: true
  });
}

// Default value decorator
export function Default(defaultValue: any) {
  return function (target: any, propertyName: string) {
    let value: any = defaultValue;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: any) {
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Observable decorator for property changes
export function Observable(target: any, propertyName: string) {
  const callbacks = new Set<(oldValue: any, newValue: any) => void>();
  let value: any;
  
  // Add methods to subscribe to changes
  const observerMethodName = `observe${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
  target[observerMethodName] = function(callback: (oldValue: any, newValue: any) => void) {
    callbacks.add(callback);
    return () => callbacks.delete(callback); // Return unsubscribe function
  };
  
  Object.defineProperty(target, propertyName, {
    get: function() {
      return value;
    },
    set: function(newValue: any) {
      const oldValue = value;
      value = newValue;
      callbacks.forEach(callback => callback(oldValue, newValue));
    },
    enumerable: true,
    configurable: true
  });
}

// Computed property decorator
export function Computed(dependencies: string[]) {
  return function (target: any, propertyName: string) {
    // Store the original getter
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
    const originalGetter = descriptor?.get;
    
    if (!originalGetter) {
      throw new Error(`@Computed can only be used on getter properties`);
    }

    let cachedValue: any;
    let isDirty = true;
    
    // Set up dependency tracking
    const dependencyValues: any = {};
    
    dependencies.forEach(dep => {
      // Store initial values
      dependencyValues[dep] = target[dep];
      
      // Override dependency setters to invalidate cache
      const depDescriptor = Object.getOwnPropertyDescriptor(target, dep) || {};
      const originalSetter = depDescriptor.set;
      
      Object.defineProperty(target, dep, {
        get: depDescriptor.get || (() => dependencyValues[dep]),
        set: function(value: any) {
          const oldValue = dependencyValues[dep];
          dependencyValues[dep] = value;
          if (originalSetter) {
            originalSetter.call(this, value);
          }
          if (oldValue !== value) {
            isDirty = true;
          }
        },
        enumerable: true,
        configurable: true
      });
    });
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        if (isDirty) {
          cachedValue = originalGetter.call(this);
          isDirty = false;
        }
        return cachedValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Deprecated property decorator
export function DeprecatedProperty(message?: string) {
  return function (target: any, propertyName: string) {
    let value: any;
    let hasWarned = false;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        if (!hasWarned) {
          console.warn(`⚠️ Property ${propertyName} is deprecated.${message ? ` ${message}` : ''}`);
          hasWarned = true;
        }
        return value;
      },
      set: function(newValue: any) {
        if (!hasWarned) {
          console.warn(`⚠️ Property ${propertyName} is deprecated.${message ? ` ${message}` : ''}`);
          hasWarned = true;
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Lazy loading decorator
export function Lazy(factory: () => any) {
  return function (target: any, propertyName: string) {
    let value: any;
    let hasBeenInitialized = false;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        if (!hasBeenInitialized) {
          value = factory();
          hasBeenInitialized = true;
        }
        return value;
      },
      set: function(newValue: any) {
        value = newValue;
        hasBeenInitialized = true;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Type validation decorator
export function Type(expectedType: 'string' | 'number' | 'boolean' | 'object' | 'function') {
  return function (target: any, propertyName: string) {
    let value: any;
    
    Object.defineProperty(target, propertyName, {
      get: function() {
        return value;
      },
      set: function(newValue: any) {
        if (newValue != null && typeof newValue !== expectedType) {
          throw new Error(`${propertyName} must be of type ${expectedType}, got ${typeof newValue}`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Usage Examples

export class User {
  @Required
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @Required
  @Email
  email!: string;

  @Range(18, 120)
  age!: number;

  @ReadOnly
  id!: string;

  @Default('active')
  status!: string;

  @Format((value: string) => value?.toLowerCase())
  username!: string;

  @Observable
  preferences!: any;

  @DeprecatedProperty('Use fullName instead')
  displayName!: string;

  @Type('string')
  description!: string;

  @Lazy(() => new Date())
  createdAt!: Date;

  constructor() {
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

export class Calculator {
  @Observable
  operandA!: number;

  @Observable
  operandB!: number;

  @Computed(['operandA', 'operandB'])
  get sum(): number {
    console.log('Computing sum...');
    return (this.operandA || 0) + (this.operandB || 0);
  }

  @Computed(['operandA', 'operandB'])
  get product(): number {
    console.log('Computing product...');
    return (this.operandA || 0) * (this.operandB || 0);
  }
}

export class Product {
  @Required
  @MinLength(3)
  name!: string;

  @Required
  @Range(0, Number.MAX_SAFE_INTEGER)
  price!: number;

  @Default('Available')
  status!: string;

  @Format((value: string) => value?.toUpperCase())
  category!: string;

  @Observable
  inventory!: number;

  @ReadOnly
  sku!: string;

  constructor() {
    this.sku = `SKU-${Date.now()}`;
  }
}

// Helper function to validate objects with decorated properties
export function validateObject(obj: any): { isValid: boolean; errors: string[] } {
  const constructor = obj.constructor;
  const errors: string[] = [];

  // Check required fields
  const requiredFields = Reflect.getMetadata('required', constructor.prototype) || [];
  for (const field of requiredFields) {
    if (obj[field] == null || obj[field] === '') {
      errors.push(`${field} is required`);
    }
  }

  // Check validations
  const validations = Reflect.getMetadata('validations', constructor.prototype) || {};
  for (const [field, fieldValidations] of Object.entries(validations)) {
    const value = obj[field];
    if (value != null) {
      for (const validation of fieldValidations as any[]) {
        switch (validation.type) {
          case 'minLength':
            if (typeof value === 'string' && value.length < validation.value) {
              errors.push(validation.message);
            }
            break;
          case 'maxLength':
            if (typeof value === 'string' && value.length > validation.value) {
              errors.push(validation.message);
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value === 'string' && !emailRegex.test(value)) {
              errors.push(validation.message);
            }
            break;
          case 'range':
            if (typeof value === 'number' && (value < validation.min || value > validation.max)) {
              errors.push(validation.message);
            }
            break;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  Required,
  MinLength,
  MaxLength,
  Email,
  Range,
  Format,
  ReadOnly,
  Default,
  Observable,
  Computed,
  DeprecatedProperty,
  Lazy,
  Type,
  User,
  Calculator,
  Product,
  validateObject,
};