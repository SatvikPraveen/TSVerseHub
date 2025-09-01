// File: concepts/tsconfig/strict-mode.ts

/**
 * TYPESCRIPT STRICT MODE
 * 
 * TypeScript's strict mode enables a wide range of type checking behavior
 * that results in stronger guarantees of program correctness. This file
 * demonstrates all strict mode options and their effects.
 */

// ===== STRICT MODE FLAGS =====

export interface StrictModeOptions {
  // Master strict flag - enables all strict mode checks
  strict?: boolean;
  
  // Individual strict mode flags
  noImplicitAny?: boolean;
  strictNullChecks?: boolean;
  strictFunctionTypes?: boolean;
  strictBindCallApply?: boolean;
  strictPropertyInitialization?: boolean;
  noImplicitReturns?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  noUncheckedIndexedAccess?: boolean;
  
  // Additional strict checks (not part of --strict)
  noImplicitThis?: boolean;
  alwaysStrict?: boolean;
  exactOptionalPropertyTypes?: boolean;
  noPropertyAccessFromIndexSignature?: boolean;
}

// ===== STRICT MODE CONFIGURATIONS =====

// Minimal strict configuration
export const minimalStrictConfig: StrictModeOptions = {
  strict: true
};

// Gradual strict configuration
export const gradualStrictConfig: StrictModeOptions = {
  noImplicitAny: true,
  strictNullChecks: false, // Enable later
  strictFunctionTypes: true,
  strictBindCallApply: true,
  strictPropertyInitialization: false, // Enable later
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true
};

// Maximum strict configuration
export const maximumStrictConfig: StrictModeOptions = {
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitThis: true,
  alwaysStrict: true,
  exactOptionalPropertyTypes: true,
  noPropertyAccessFromIndexSignature: true
};

// ===== STRICT MODE EFFECTS DEMONSTRATION =====

// 1. noImplicitAny
export namespace NoImplicitAnyDemo {
  // ❌ Without noImplicitAny - implicit 'any' type
  // function badFunction(param) { // Error with noImplicitAny
  //   return param.toString();
  // }

  // ✅ With noImplicitAny - explicit typing required
  function goodFunction(param: string): string {
    return param.toString();
  }

  // ❌ Implicit any in array
  // const badArray = []; // Error with noImplicitAny

  // ✅ Explicit typing
  const goodArray: string[] = [];

  // ❌ Implicit any in object
  // const badObject = {}; // May cause issues
  // badObject.prop = 'value'; // Error with noImplicitAny

  // ✅ Explicit typing
  const goodObject: Record<string, unknown> = {};
  goodObject.prop = 'value';
}

// 2. strictNullChecks
export namespace StrictNullChecksDemo {
  interface User {
    name: string;
    email?: string; // Optional property
  }

  function processUser(user: User | null): void {
    // ❌ Without strictNullChecks - no error
    // console.log(user.name); // Runtime error if user is null

    // ✅ With strictNullChecks - null check required
    if (user) {
      console.log(user.name); // OK
      
      // Optional property handling
      if (user.email) {
        console.log(user.email.toUpperCase()); // OK
      }
    }
  }

  function getLength(str: string | undefined): number {
    // ❌ Without strictNullChecks
    // return str.length; // Runtime error if str is undefined

    // ✅ With strictNullChecks
    return str?.length ?? 0; // Safe with optional chaining
  }

  // Non-null assertion operator (use with caution)
  function forceNonNull(value: string | null): string {
    return value!; // Tells TypeScript that value is definitely not null
  }
}

// 3. strictFunctionTypes
export namespace StrictFunctionTypesDemo {
  // Contravariance in function parameters
  interface Animal {
    name: string;
  }

  interface Dog extends Animal {
    breed: string;
  }

  type AnimalHandler = (animal: Animal) => void;
  type DogHandler = (dog: Dog) => void;

  function handleAnimals(handler: AnimalHandler): void {
    const animal: Animal = { name: 'Fluffy' };
    handler(animal);
  }

  const dogHandler: DogHandler = (dog) => {
    console.log(`${dog.name} is a ${dog.breed}`);
  };

  // ❌ Without strictFunctionTypes - allowed but unsafe
  // handleAnimals(dogHandler); // Runtime error - animal doesn't have breed

  // ✅ With strictFunctionTypes - compilation error prevents runtime issue
  const animalHandler: AnimalHandler = (animal) => {
    console.log(animal.name); // Safe - only uses Animal properties
  };

  handleAnimals(animalHandler); // OK
}

// 4. strictBindCallApply
export namespace StrictBindCallApplyDemo {
  function greet(this: { name: string }, greeting: string, punctuation: string): string {
    return `${greeting}, ${this.name}${punctuation}`;
  }

  const person = { name: 'Alice' };

  // ❌ Without strictBindCallApply - no type checking
  // const result1 = greet.call(person, 123, true); // Wrong argument types

  // ✅ With strictBindCallApply - strict type checking
  const result2 = greet.call(person, 'Hello', '!'); // OK - correct types

  const boundGreet = greet.bind(person);
  const result3 = boundGreet('Hi', '.'); // OK

  // Apply with array arguments
  const result4 = greet.apply(person, ['Hey', '?']); // OK
}

// 5. strictPropertyInitialization
export namespace StrictPropertyInitializationDemo {
  // ❌ Without strictPropertyInitialization - no error
  class BadUser {
    name: string; // Should be initialized
    email: string; // Should be initialized
  }

  // ✅ With strictPropertyInitialization - must initialize
  class GoodUser {
    name: string;
    email: string;

    constructor(name: string, email: string) {
      this.name = name;
      this.email = email;
    }
  }

  // Alternative: definite assignment assertion
  class UserWithAssertion {
    name!: string; // Definite assignment assertion
    email!: string;

    initialize(name: string, email: string): void {
      this.name = name;
      this.email = email;
    }
  }

  // Optional properties don't need initialization
  class UserWithOptional {
    name: string;
    email?: string; // Optional - no initialization required

    constructor(name: string) {
      this.name = name;
    }
  }
}

// 6. noImplicitReturns
export namespace NoImplicitReturnsDemo {
  // ❌ Without noImplicitReturns - missing return statement
  function badFunction(condition: boolean): string {
    if (condition) {
      return 'true';
    }
    // Missing return statement - implicit undefined return
  }

  // ✅ With noImplicitReturns - all code paths must return
  function goodFunction(condition: boolean): string {
    if (condition) {
      return 'true';
    }
    return 'false'; // All paths return a value
  }

  // Void functions are exempt
  function voidFunction(condition: boolean): void {
    if (condition) {
      console.log('condition is true');
      return; // Early return is OK
    }
    console.log('condition is false');
    // No return statement needed
  }
}

// 7. noFallthroughCasesInSwitch
export namespace NoFallthroughCasesInSwitchDemo {
  enum Color {
    Red = 'red',
    Green = 'green',
    Blue = 'blue'
  }

  // ❌ Without noFallthroughCasesInSwitch - fallthrough allowed
  function badSwitch(color: Color): string {
    let description = '';
    switch (color) {
      case Color.Red:
        description = 'Hot color';
        // Missing break - falls through to next case
      case Color.Green:
        description += ' Natural color';
        break;
      case Color.Blue:
        description = 'Cool color';
        break;
    }
    return description;
  }

  // ✅ With noFallthroughCasesInSwitch - explicit breaks required
  function goodSwitch(color: Color): string {
    switch (color) {
      case Color.Red:
        return 'Hot color';
      case Color.Green:
        return 'Natural color';
      case Color.Blue:
        return 'Cool color';
      default:
        return 'Unknown color';
    }
  }

  // Intentional fallthrough with comment
  function intentionalFallthrough(value: number): string {
    switch (value) {
      case 1:
      case 2:
        return 'Small number';
      case 3:
        // falls through
      case 4:
        return 'Medium number';
      default:
        return 'Large number';
    }
  }
}

// 8. noUncheckedIndexedAccess
export namespace NoUncheckedIndexedAccessDemo {
  const users = ['Alice', 'Bob', 'Charlie'];
  const userMap: Record<string, string> = {
    '1': 'Alice',
    '2': 'Bob'
  };

  // ❌ Without noUncheckedIndexedAccess - assumes value exists
  // const firstUser = users[0]; // Type: string
  // const user = userMap['unknown']; // Type: string

  // ✅ With noUncheckedIndexedAccess - includes undefined in type
  const firstUser = users[0]; // Type: string | undefined
  const user = userMap['unknown']; // Type: string | undefined

  // Safe access patterns
  function getFirstUser(): string {
    return users[0] ?? 'No users'; // Handle undefined
  }

  function getUserById(id: string): string {
    const user = userMap[id];
    if (user) {
      return user; // Type narrowed to string
    }
    throw new Error('User not found');
  }

  // Array bounds checking
  function safeArrayAccess<T>(arr: T[], index: number): T | undefined {
    return arr[index]; // Returns T | undefined
  }
}

// ===== STRICT MODE MIGRATION STRATEGY =====

export class StrictModeMigration {
  // Phase 1: Enable basic strict checks
  static phase1Config: StrictModeOptions = {
    noImplicitAny: true,
    strictFunctionTypes: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true
  };

  // Phase 2: Add null safety
  static phase2Config: StrictModeOptions = {
    ...StrictModeMigration.phase1Config,
    strictNullChecks: true,
    strictBindCallApply: true
  };

  // Phase 3: Complete strict mode
  static phase3Config: StrictModeOptions = {
    strict: true, // Enables all strict flags
    noUncheckedIndexedAccess: true
  };

  // Phase 4: Maximum strictness
  static phase4Config: StrictModeOptions = {
    ...StrictModeMigration.phase3Config,
    exactOptionalPropertyTypes: true,
    noPropertyAccessFromIndexSignature: true
  };

  static getMigrationPlan(): Array<{ phase: number; description: string; config: StrictModeOptions }> {
    return [
      {
        phase: 1,
        description: 'Enable basic type checking without breaking existing null handling',
        config: StrictModeMigration.phase1Config
      },
      {
        phase: 2,
        description: 'Add null safety - requires updating null/undefined handling',
        config: StrictModeMigration.phase2Config
      },
      {
        phase: 3,
        description: 'Enable full strict mode - includes property initialization checks',
        config: StrictModeMigration.phase3Config
      },
      {
        phase: 4,
        description: 'Maximum type safety with cutting-edge features',
        config: StrictModeMigration.phase4Config
      }
    ];
  }
}

// ===== STRICT MODE BENEFITS =====

export const strictModeBenefits = {
  catchesErrors: [
    'Null pointer exceptions at compile time',
    'Type mismatches in function calls',
    'Missing return statements',
    'Uninitialized class properties',
    'Array index out of bounds (potential)',
    'Switch case fallthrough bugs'
  ],
  
  improveCodeQuality: [
    'Forces explicit type annotations',
    'Encourages defensive programming',
    'Makes code more self-documenting',
    'Reduces runtime errors',
    'Improves IDE support and autocomplete',
    'Makes refactoring safer'
  ],
  
  developmentBenefits: [
    'Better IntelliSense and code completion',
    'More accurate error messages',
    'Easier debugging',
    'Improved code review process',
    'Better tooling support',
    'Catches errors during development, not production'
  ]
};

// ===== USAGE EXAMPLES =====

console.log('=== Strict Mode Examples ===');

// Demonstrate migration phases
const migrationPlan = StrictModeMigration.getMigrationPlan();
migrationPlan.forEach(phase => {
  console.log(`\nPhase ${phase.phase}: ${phase.description}`);
  console.log('Config:', JSON.stringify(phase.config, null, 2));
});

// Show benefits
console.log('\nStrict Mode Benefits:');
console.log('Catches Errors:', strictModeBenefits.catchesErrors.slice(0, 3));
console.log('Code Quality:', strictModeBenefits.improveCodeQuality.slice(0, 3));

// Example of strict null checks in action
const userEmail: string | undefined = undefined;
const emailLength = userEmail?.length ?? 0;
console.log('Email length (safe):', emailLength);

// Example of proper error handling with strict mode
function processUserData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    const user = data as { name: string };
    return `Processing user: ${user.name}`;
  }
  throw new Error('Invalid user data');
}

export default {
  StrictModeOptions,
  minimalStrictConfig,
  gradualStrictConfig,
  maximumStrictConfig,
  NoImplicitAnyDemo,
  StrictNullChecksDemo,
  StrictFunctionTypesDemo,
  StrictBindCallApplyDemo,
  StrictPropertyInitializationDemo,
  NoImplicitReturnsDemo,
  NoFallthroughCasesInSwitchDemo,
  NoUncheckedIndexedAccessDemo,
  StrictModeMigration,
  strictModeBenefits,
};