// File: concepts/decorators/demo.tsx

import React, { useState, useEffect } from 'react';

// Mock the decorator functionality for demo purposes
const DecoratorDemo: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [userInput, setUserInput] = useState({
    name: '',
    email: '',
    age: '',
  });

  const addOutput = (message: string) => {
    setOutput(prev => [...prev, message]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  // Simulate class decorators
  const demonstrateClassDecorators = () => {
    clearOutput();
    addOutput('=== CLASS DECORATORS DEMO ===');
    addOutput('');
    
    // Simulate @Logged decorator
    addOutput('// @Logged class creates logging for instantiation');
    addOutput('class User {');
    addOutput('  constructor(name: string) { this.name = name; }');
    addOutput('}');
    addOutput('');
    addOutput('const user = new User("John");');
    addOutput('// Output: Creating instance of User with args: ["John"]');
    addOutput('// Output: Instance of User created successfully');
    addOutput('');
    
    // Simulate @Singleton decorator
    addOutput('// @Singleton ensures only one instance exists');
    addOutput('@Singleton');
    addOutput('class DatabaseConnection {');
    addOutput('  connect() { console.log("Connected!"); }');
    addOutput('}');
    addOutput('');
    addOutput('const db1 = new DatabaseConnection();');
    addOutput('const db2 = new DatabaseConnection();');
    addOutput('console.log(db1 === db2); // true - same instance');
    addOutput('');
    
    // Simulate @Component decorator
    addOutput('// @Component adds metadata and functionality');
    addOutput('@Component({ selector: "app-user", template: "<div>User</div>" })');
    addOutput('class UserComponent {');
    addOutput('  render() { /* renders template */ }');
    addOutput('}');
  };

  // Simulate method decorators
  const demonstrateMethodDecorators = () => {
    clearOutput();
    addOutput('=== METHOD DECORATORS DEMO ===');
    addOutput('');
    
    // Simulate @Log decorator
    addOutput('// @Log decorator logs method calls');
    addOutput('class UserService {');
    addOutput('  @Log');
    addOutput('  getUser(id: string) {');
    addOutput('    return { id, name: `User ${id}` };');
    addOutput('  }');
    addOutput('}');
    addOutput('');
    addOutput('service.getUser("123");');
    addOutput('// Output: Calling getUser with arguments: ["123"]');
    addOutput('// Output: getUser returned: { id: "123", name: "User 123" }');
    addOutput('');
    
    // Simulate @Retry decorator
    addOutput('// @Retry decorator retries failed operations');
    addOutput('@Retry(3)');
    addOutput('async fetchUser(id: string) {');
    addOutput('  // May fail and retry up to 3 times');
    addOutput('  throw new Error("Network error");');
    addOutput('}');
    addOutput('');
    addOutput('// Output: Attempt 1 failed: Network error');
    addOutput('// Output: Attempt 2 failed: Network error'); 
    addOutput('// Output: Attempt 3 failed: Network error');
    addOutput('// Error: fetchUser failed after 3 attempts');
    addOutput('');
    
    // Simulate @Cached decorator
    addOutput('// @Cached decorator caches method results');
    addOutput('@Cached(5000) // Cache for 5 seconds');
    addOutput('expensiveCalculation(input: number) {');
    addOutput('  return input * Math.random();');
    addOutput('}');
    addOutput('');
    addOutput('// First call: Cache miss, performs calculation');
    addOutput('// Second call: Cache hit, returns cached result');
  };

  // Simulate property decorators
  const demonstratePropertyDecorators = () => {
    clearOutput();
    addOutput('=== PROPERTY DECORATORS DEMO ===');
    addOutput('');
    
    addOutput('// Property decorators add validation and behavior');
    addOutput('class User {');
    addOutput('  @Required');
    addOutput('  @MinLength(3)');
    addOutput('  name: string;');
    addOutput('');
    addOutput('  @Email');
    addOutput('  email: string;');
    addOutput('');
    addOutput('  @Range(18, 120)');
    addOutput('  age: number;');
    addOutput('');
    addOutput('  @ReadOnly');
    addOutput('  id: string;');
    addOutput('}');
    addOutput('');
    addOutput('const user = new User();');
    addOutput('user.name = "Jo"; // Error: name must be at least 3 characters');
    addOutput('user.email = "invalid"; // Error: email must be valid');
    addOutput('user.age = 150; // Error: age must be between 18 and 120');
    addOutput('user.id = "123"; // Works first time');
    addOutput('user.id = "456"; // Error: Cannot set readonly property');
  };

  // Simulate parameter decorators
  const demonstrateParameterDecorators = () => {
    clearOutput();
    addOutput('=== PARAMETER DECORATORS DEMO ===');
    addOutput('');
    
    addOutput('// Parameter decorators validate method parameters');
    addOutput('class UserService {');
    addOutput('  @ValidateParams');
    addOutput('  createUser(');
    addOutput('    @Required @MinLength(3) name: string,');
    addOutput('    @Required @EmailParam email: string,');
    addOutput('    @Range(18, 120) age: number');
    addOutput('  ) {');
    addOutput('    return { name, email, age };');
    addOutput('  }');
    addOutput('}');
    addOutput('');
    addOutput('service.createUser("Jo", "invalid", 150);');
    addOutput('// Error: Parameter 0 must be at least 3 characters');
    addOutput('// Error: Parameter 1 must be valid email');
    addOutput('// Error: Parameter 2 must be between 18 and 120');
  };

  // Simulate user input validation
  const validateUserInput = () => {
    clearOutput();
    addOutput('=== USER INPUT VALIDATION ===');
    addOutput('');
    
    const errors: string[] = [];
    
    // Simulate property decorators validation
    if (!userInput.name) {
      errors.push('Name is required');
    } else if (userInput.name.length < 3) {
      errors.push('Name must be at least 3 characters long');
    }
    
    if (!userInput.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInput.email)) {
      errors.push('Email must be a valid email address');
    }
    
    if (!userInput.age) {
      errors.push('Age is required');
    } else {
      const age = parseInt(userInput.age);
      if (isNaN(age) || age < 18 || age > 120) {
        errors.push('Age must be between 18 and 120');
      }
    }
    
    if (errors.length > 0) {
      addOutput('❌ Validation Errors:');
      errors.forEach(error => addOutput(`  - ${error}`));
    } else {
      addOutput('✅ Validation Passed!');
      addOutput(`Creating user: ${userInput.name} (${userInput.email}, age ${userInput.age})`);
    }
  };

  // Real-time validation as user types
  useEffect(() => {
    if (userInput.name || userInput.email || userInput.age) {
      validateUserInput();
    }
  }, [userInput]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          TypeScript Decorators Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Interactive demonstration of TypeScript decorators including class, method, property, and parameter decorators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Decorator Examples</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={demonstrateClassDecorators}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Class Decorators
            </button>
            <button
              onClick={demonstrateMethodDecorators}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Method Decorators
            </button>
            <button
              onClick={demonstratePropertyDecorators}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Property Decorators
            </button>
            <button
              onClick={demonstrateParameterDecorators}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Parameter Decorators
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 pt-4">
            Interactive Validation Demo
          </h2>
          <p className="text-gray-600 text-sm">
            Try the property decorators in action! Enter values to see real-time validation.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (@Required @MinLength(3))
              </label>
              <input
                type="text"
                value={userInput.name}
                onChange={(e) => setUserInput(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (@Required @Email)
              </label>
              <input
                type="email"
                value={userInput.email}
                onChange={(e) => setUserInput(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (@Range(18, 120))
              </label>
              <input
                type="number"
                value={userInput.age}
                onChange={(e) => setUserInput(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your age"
                min="18"
                max="120"
              />
            </div>
          </div>

          <button
            onClick={clearOutput}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Output
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Output Console</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500">
                Click a decorator example button to see the output...
              </div>
            ) : (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Class Decorators</h3>
          <p className="text-sm text-blue-600">
            Applied to class constructors. Can modify or replace class definitions.
          </p>
          <div className="mt-2 text-xs text-blue-500">
            Examples: @Logged, @Singleton, @Component
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Method Decorators</h3>
          <p className="text-sm text-green-600">
            Applied to method declarations. Can observe, modify, or replace methods.
          </p>
          <div className="mt-2 text-xs text-green-500">
            Examples: @Log, @Retry, @Cached, @RateLimit
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Property Decorators</h3>
          <p className="text-sm text-purple-600">
            Applied to property declarations. Add validation and behavior to properties.
          </p>
          <div className="mt-2 text-xs text-purple-500">
            Examples: @Required, @MinLength, @Email, @ReadOnly
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">Parameter Decorators</h3>
          <p className="text-sm text-orange-600">
            Applied to method parameters. Validate and transform parameter values.
          </p>
          <div className="mt-2 text-xs text-orange-500">
            Examples: @Required, @ValidateType, @Transform
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📝 Note</h3>
        <p className="text-sm text-yellow-700">
          Decorators are an experimental feature in TypeScript. Enable them by setting 
          <code className="bg-yellow-100 px-1 rounded">"experimentalDecorators": true</code> 
          and <code className="bg-yellow-100 px-1 rounded">"emitDecoratorMetadata": true</code> 
          in your tsconfig.json.
        </p>
      </div>
    </div>
  );
};

export default DecoratorDemo;