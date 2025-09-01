// File: concepts/decorators/parameter-decorators.ts

/**
 * PARAMETER DECORATORS
 * 
 * A parameter decorator is declared just before a parameter declaration.
 * The parameter decorator is applied to the function for a class constructor
 * or method declaration. Parameter decorators can only be used to observe
 * that a parameter has been declared on a method.
 */

import 'reflect-metadata';

// Basic parameter decorator to mark required parameters
export function Required(target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
  const existingRequiredParameters: number[] = 
    Reflect.getOwnMetadata('required', target, propertyName!) || [];
  
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata('required', existingRequiredParameters, target, propertyName!);
}

// Parameter validation decorator
export function ValidateType(expectedType: 'string' | 'number' | 'boolean' | 'object') {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingTypes = Reflect.getOwnMetadata('parameter:types', target, propertyName!) || {};
    existingTypes[parameterIndex] = expectedType;
    Reflect.defineMetadata('parameter:types', existingTypes, target, propertyName!);
  };
}

// Parameter range validation
export function Range(min: number, max: number) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingRanges = Reflect.getOwnMetadata('parameter:ranges', target, propertyName!) || {};
    existingRanges[parameterIndex] = { min, max };
    Reflect.defineMetadata('parameter:ranges', existingRanges, target, propertyName!);
  };
}

// Parameter minimum length validation
export function MinLength(length: number) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingMinLengths = Reflect.getOwnMetadata('parameter:minLengths', target, propertyName!) || {};
    existingMinLengths[parameterIndex] = length;
    Reflect.defineMetadata('parameter:minLengths', existingMinLengths, target, propertyName!);
  };
}

// Parameter email validation
export function EmailParam(target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
  const existingEmailParams = Reflect.getOwnMetadata('parameter:emails', target, propertyName!) || [];
  existingEmailParams.push(parameterIndex);
  Reflect.defineMetadata('parameter:emails', existingEmailParams, target, propertyName!);
}

// Parameter transformation decorator
export function Transform(transformer: (value: any) => any) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingTransformers = Reflect.getOwnMetadata('parameter:transformers', target, propertyName!) || {};
    existingTransformers[parameterIndex] = transformer;
    Reflect.defineMetadata('parameter:transformers', existingTransformers, target, propertyName!);
  };
}

// Parameter default value decorator
export function DefaultValue(value: any) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingDefaults = Reflect.getOwnMetadata('parameter:defaults', target, propertyName!) || {};
    existingDefaults[parameterIndex] = value;
    Reflect.defineMetadata('parameter:defaults', existingDefaults, target, propertyName!);
  };
}

// Custom validation decorator
export function Validate(validator: (value: any) => boolean, message?: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingValidators = Reflect.getOwnMetadata('parameter:validators', target, propertyName!) || {};
    existingValidators[parameterIndex] = { validator, message };
    Reflect.defineMetadata('parameter:validators', existingValidators, target, propertyName!);
  };
}

// Dependency injection decorators
export function Inject(token: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getOwnMetadata('parameter:tokens', target, propertyName!) || {};
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata('parameter:tokens', existingTokens, target, propertyName!);
  };
}

export function Optional(target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
  const existingOptionals = Reflect.getOwnMetadata('parameter:optionals', target, propertyName!) || [];
  existingOptionals.push(parameterIndex);
  Reflect.defineMetadata('parameter:optionals', existingOptionals, target, propertyName!);
}

// HTTP parameter decorators
export function Body(target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
  Reflect.defineMetadata('parameter:source', 'body', target, propertyName!);
  Reflect.defineMetadata('parameter:bodyIndex', parameterIndex, target, propertyName!);
}

export function Query(key?: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingQueries = Reflect.getOwnMetadata('parameter:queries', target, propertyName!) || {};
    existingQueries[parameterIndex] = key;
    Reflect.defineMetadata('parameter:queries', existingQueries, target, propertyName!);
  };
}

export function Param(key?: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingParams = Reflect.getOwnMetadata('parameter:params', target, propertyName!) || {};
    existingParams[parameterIndex] = key;
    Reflect.defineMetadata('parameter:params', existingParams, target, propertyName!);
  };
}

export function Header(key?: string) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingHeaders = Reflect.getOwnMetadata('parameter:headers', target, propertyName!) || {};
    existingHeaders[parameterIndex] = key;
    Reflect.defineMetadata('parameter:headers', existingHeaders, target, propertyName!);
  };
}

// Method decorator that validates parameters based on parameter decorators
export function ValidateParams(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    // Check required parameters
    const requiredParameters = Reflect.getOwnMetadata('required', target, propertyName) || [];
    for (const paramIndex of requiredParameters) {
      if (args[paramIndex] == null) {
        throw new Error(`Parameter ${paramIndex} is required in method ${propertyName}`);
      }
    }

    // Check parameter types
    const parameterTypes = Reflect.getOwnMetadata('parameter:types', target, propertyName) || {};
    for (const [paramIndex, expectedType] of Object.entries(parameterTypes)) {
      const value = args[parseInt(paramIndex)];
      if (value != null && typeof value !== expectedType) {
        throw new Error(`Parameter ${paramIndex} must be of type ${expectedType}, got ${typeof value}`);
      }
    }

    // Check parameter ranges
    const parameterRanges = Reflect.getOwnMetadata('parameter:ranges', target, propertyName) || {};
    for (const [paramIndex, range] of Object.entries(parameterRanges)) {
      const value = args[parseInt(paramIndex)];
      const { min, max } = range as { min: number; max: number };
      if (value != null && (value < min || value > max)) {
        throw new Error(`Parameter ${paramIndex} must be between ${min} and ${max}`);
      }
    }

    // Check minimum lengths
    const minLengths = Reflect.getOwnMetadata('parameter:minLengths', target, propertyName) || {};
    for (const [paramIndex, minLength] of Object.entries(minLengths)) {
      const value = args[parseInt(paramIndex)];
      if (value != null && typeof value === 'string' && value.length < (minLength as number)) {
        throw new Error(`Parameter ${paramIndex} must be at least ${minLength} characters long`);
      }
    }

    // Check email parameters
    const emailParams = Reflect.getOwnMetadata('parameter:emails', target, propertyName) || [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const paramIndex of emailParams) {
      const value = args[paramIndex];
      if (value != null && typeof value === 'string' && !emailRegex.test(value)) {
        throw new Error(`Parameter ${paramIndex} must be a valid email address`);
      }
    }

    // Apply transformations
    const transformers = Reflect.getOwnMetadata('parameter:transformers', target, propertyName) || {};
    for (const [paramIndex, transformer] of Object.entries(transformers)) {
      if (args[parseInt(paramIndex)] != null) {
        args[parseInt(paramIndex)] = (transformer as Function)(args[parseInt(paramIndex)]);
      }
    }

    // Apply default values
    const defaults = Reflect.getOwnMetadata('parameter:defaults', target, propertyName) || {};
    for (const [paramIndex, defaultValue] of Object.entries(defaults)) {
      if (args[parseInt(paramIndex)] == null) {
        args[parseInt(paramIndex)] = defaultValue;
      }
    }

    // Custom validations
    const validators = Reflect.getOwnMetadata('parameter:validators', target, propertyName) || {};
    for (const [paramIndex, validation] of Object.entries(validators)) {
      const value = args[parseInt(paramIndex)];
      const { validator, message } = validation as { validator: (value: any) => boolean; message?: string };
      if (value != null && !validator(value)) {
        throw new Error(message || `Validation failed for parameter ${paramIndex}`);
      }
    }

    return method.apply(this, args);
  };

  return descriptor;
}

// Usage Examples

export class UserService {
  @ValidateParams
  createUser(
    @Required @MinLength(3) @Transform((v: string) => v.trim()) name: string,
    @Required @EmailParam email: string,
    @Range(18, 120) age: number,
    @DefaultValue('user') @ValidateType('string') role: string
  ) {
    console.log('Creating user:', { name, email, age, role });
    return { id: Date.now(), name, email, age, role };
  }

  @ValidateParams
  updateUser(
    @Required @ValidateType('string') id: string,
    @MinLength(2) name?: string,
    @EmailParam email?: string,
    @Range(18, 120) age?: number
  ) {
    console.log('Updating user:', { id, name, email, age });
    return { id, name, email, age, updated: true };
  }

  @ValidateParams
  setUserPreferences(
    @Required id: string,
    @Validate((prefs: any) => typeof prefs === 'object' && prefs !== null, 'Preferences must be an object')
    preferences: any
  ) {
    console.log('Setting preferences for user:', id, preferences);
    return { success: true };
  }
}

export class MathService {
  @ValidateParams
  divide(
    @Required @ValidateType('number') dividend: number,
    @Required @ValidateType('number') @Validate((n: number) => n !== 0, 'Divisor cannot be zero') divisor: number
  ): number {
    return dividend / divisor;
  }

  @ValidateParams
  power(
    @Required @ValidateType('number') base: number,
    @Required @Range(0, 10) exponent: number
  ): number {
    return Math.pow(base, exponent);
  }

  @ValidateParams
  formatNumber(
    @Required @ValidateType('number') value: number,
    @DefaultValue(2) @Range(0, 10) decimalPlaces: number,
    @DefaultValue('en-US') @Transform((locale: string) => locale.toLowerCase()) locale: string
  ): string {
    return value.toLocaleString(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }
}

// HTTP Controller example using parameter decorators
export class ApiController {
  getUser(
    @Param('id') id: string,
    @Query('include') include?: string,
    @Header('authorization') auth?: string
  ) {
    console.log('Getting user:', { id, include, auth });
    return { id, name: `User ${id}`, include };
  }

  createUser(
    @Body userData: any,
    @Header('content-type') contentType?: string
  ) {
    console.log('Creating user with data:', userData, 'Content-Type:', contentType);
    return { ...userData, id: Date.now() };
  }

  updateUser(
    @Param('id') id: string,
    @Body updates: any,
    @Query('validate') shouldValidate?: boolean
  ) {
    console.log('Updating user:', { id, updates, shouldValidate });
    return { id, ...updates, updated: true };
  }
}

// Dependency injection example
export interface Logger {
  log(message: string): void;
}

export interface Database {
  save(data: any): Promise<any>;
  find(id: string): Promise<any>;
}

export class BusinessService {
  constructor(
    @Inject('Logger') private logger: Logger,
    @Inject('Database') private db: Database,
    @Optional @Inject('Cache') private cache?: any
  ) {}

  @ValidateParams
  async processData(
    @Required @ValidateType('object') data: any,
    @DefaultValue(false) skipValidation: boolean
  ) {
    this.logger.log('Processing data...');
    
    if (!skipValidation) {
      // Validation logic
    }

    const result = await this.db.save(data);
    
    if (this.cache) {
      this.cache.set(result.id, result);
    }

    return result;
  }
}

// Helper function to extract parameter metadata
export function getParameterMetadata(target: any, methodName: string) {
  return {
    required: Reflect.getOwnMetadata('required', target, methodName) || [],
    types: Reflect.getOwnMetadata('parameter:types', target, methodName) || {},
    ranges: Reflect.getOwnMetadata('parameter:ranges', target, methodName) || {},
    minLengths: Reflect.getOwnMetadata('parameter:minLengths', target, methodName) || {},
    emails: Reflect.getOwnMetadata('parameter:emails', target, methodName) || [],
    transformers: Reflect.getOwnMetadata('parameter:transformers', target, methodName) || {},
    defaults: Reflect.getOwnMetadata('parameter:defaults', target, methodName) || {},
    validators: Reflect.getOwnMetadata('parameter:validators', target, methodName) || {},
    queries: Reflect.getOwnMetadata('parameter:queries', target, methodName) || {},
    params: Reflect.getOwnMetadata('parameter:params', target, methodName) || {},
    headers: Reflect.getOwnMetadata('parameter:headers', target, methodName) || {},
  };
}

export default {
  Required,
  ValidateType,
  Range,
  MinLength,
  EmailParam,
  Transform,
  DefaultValue,
  Validate,
  Inject,
  Optional,
  Body,
  Query,
  Param,
  Header,
  ValidateParams,
  UserService,
  MathService,
  ApiController,
  BusinessService,
  getParameterMetadata,
};