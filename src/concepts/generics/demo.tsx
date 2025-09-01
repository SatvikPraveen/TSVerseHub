// File location: src/data/concepts/generics/demo.tsx

import React, { useState, useCallback, useEffect } from 'react';

// Generic utility types for the demo
type Result<T, E = string> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Generic data structures
class GenericStack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Generic API client
class ApiClient {
  async request<T>(endpoint: string): Promise<Result<T>> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        '/users': [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        '/posts': [
          { id: 1, title: 'TypeScript Generics', content: 'Learning about generics...' },
          { id: 2, title: 'React Hooks', content: 'Modern React patterns...' }
        ]
      } as Record<string, any>;

      const data = mockData[endpoint] || [];
      return { success: true, data: data as T };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Generic form validation
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

class FormValidator<T extends Record<string, any>> {
  private rules: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>> = {};

  addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>): this {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field]!.push(rule as ValidationRule<T[keyof T]>);
    return this;
  }

  validate(data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, rules] of Object.entries(this.rules) as [keyof T, ValidationRule<T[keyof T]>[]][]) {
      if (rules) {
        for (const rule of rules) {
          if (!rule.validate(data[field])) {
            errors[field] = rule.message;
            break;
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Demo data types
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const GenericsDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'stack' | 'api' | 'validation'>('stack');
  const [stackItems, setStackItems] = useState<GenericStack<string>>(new GenericStack<string>());
  const [stackInput, setStackInput] = useState('');
  const [apiData, setApiData] = useState<{ users: User[]; posts: Post[] }>({ users: [], posts: [] });
  const [apiLoading, setApiLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [validationResult, setValidationResult] = useState<string>('');

  const apiClient = new ApiClient();

  // Stack demo functions
  const pushToStack = useCallback(() => {
    if (stackInput.trim()) {
      const newStack = new GenericStack<string>();
      const currentItems = stackItems.toArray();
      currentItems.forEach(item => newStack.push(item));
      newStack.push(stackInput.trim());
      setStackItems(newStack);
      setStackInput('');
    }
  }, [stackInput, stackItems]);

  const popFromStack = useCallback(() => {
    const newStack = new GenericStack<string>();
    const currentItems = stackItems.toArray();
    currentItems.slice(0, -1).forEach(item => newStack.push(item));
    setStackItems(newStack);
  }, [stackItems]);

  // API demo functions
  const fetchData = useCallback(async () => {
    setApiLoading(true);
    try {
      const [usersResult, postsResult] = await Promise.all([
        apiClient.request<User[]>('/users'),
        apiClient.request<Post[]>('/posts')
      ]);

      const users = usersResult.success ? usersResult.data : [];
      const posts = postsResult.success ? postsResult.data : [];

      setApiData({ users, posts });
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Form validation demo
  const validator = new FormValidator<FormData>()
    .addRule('name', {
      validate: (value: string) => value.length >= 2,
      message: 'Name must be at least 2 characters'
    })
    .addRule('email', {
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    })
    .addRule('message', {
      validate: (value: string) => value.length >= 10,
      message: 'Message must be at least 10 characters'
    });

  const validateForm = useCallback(() => {
    const result = validator.validate(formData);
    setFormErrors(result.errors);
    setValidationResult(result.isValid ? 'Form is valid!' : 'Form has errors');
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">TypeScript Generics Demo</h2>
        <p className="text-gray-600 mb-6">
          Interactive examples demonstrating the power and flexibility of TypeScript generics in real-world scenarios.
        </p>

        {/* Demo Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveDemo('stack')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeDemo === 'stack'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Generic Stack
          </button>
          <button
            onClick={() => setActiveDemo('api')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeDemo === 'api'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Generic API Client
          </button>
          <button
            onClick={() => setActiveDemo('validation')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeDemo === 'validation'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Generic Validation
          </button>
        </div>
      </div>

      {/* Stack Demo */}
      {activeDemo === 'stack' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Generic Stack&lt;string&gt;</h3>
          <p className="text-gray-600 mb-4">
            Demonstrates a type-safe generic stack data structure that works with any type.
          </p>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="Enter a string to push"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && pushToStack()}
              />
              <button
                onClick={pushToStack}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Push
              </button>
              <button
                onClick={popFromStack}
                disabled={stackItems.isEmpty()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Pop
              </button>
            </div>

            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">Stack Contents (size: {stackItems.size()})</h4>
              {stackItems.isEmpty() ? (
                <p className="text-gray-500">Stack is empty</p>
              ) : (
                <div className="space-y-1">
                  {stackItems.toArray().map((item, index) => (
                    <div
                      key={index}
                      className={`px-2 py-1 bg-blue-100 rounded text-sm ${
                        index === stackItems.size() - 1 ? 'bg-blue-200 font-medium' : ''
                      }`}
                    >
                      {index === stackItems.size() - 1 && '→ '}{item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm bg-gray-100 p-3 rounded">
              <strong>Type Safety:</strong> The stack ensures type safety at compile time. 
              Try changing the generic parameter to &lt;number&gt; to see how it affects the allowed operations.
            </div>
          </div>
        </div>
      )}

      {/* API Demo */}
      {activeDemo === 'api' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Generic API Client</h3>
          <p className="text-gray-600 mb-4">
            Shows how generics provide type safety for API responses while maintaining flexibility.
          </p>

          <div className="space-y-4">
            <button
              onClick={fetchData}
              disabled={apiLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              {apiLoading ? 'Fetching...' : 'Fetch Data'}
            </button>

            {apiData.users.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium mb-2">Users (Result&lt;User[]&gt;)</h4>
                  <div className="space-y-2">
                    {apiData.users.map(user => (
                      <div key={user.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium mb-2">Posts (Result&lt;Post[]&gt;)</h4>
                  <div className="space-y-2">
                    {apiData.posts.map(post => (
                      <div key={post.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-gray-600">{post.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm bg-gray-100 p-3 rounded">
              <strong>Type Safety:</strong> The API client uses generics to ensure the response data 
              is typed correctly. TypeScript knows the structure of User and Post objects at compile time.
            </div>
          </div>
        </div>
      )}

      {/* Validation Demo */}
      {activeDemo === 'validation' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Generic Form Validation</h3>
          <p className="text-gray-600 mb-4">
            Demonstrates type-safe form validation using generic constraints and utility types.
          </p>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-3">Contact Form</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormField('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => updateFormField('message', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.message
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.message && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">Validation Result</h4>
              <p className={`text-sm ${
                validationResult.includes('valid') ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResult}
              </p>
            </div>

            <div className="text-sm bg-gray-100 p-3 rounded">
              <strong>Type Safety:</strong> The validator uses generics to ensure rules match field types. 
              FormValidator&lt;T&gt; knows about all fields in T and provides compile-time safety.
            </div>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Key Generic Patterns Demonstrated</h3>
        <div className="grid gap-4 text-sm">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">Generic Classes</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`class GenericStack<T> {
  private items: T[] = [];
  
  push(item: T): void { /* ... */ }
  pop(): T | undefined { /* ... */ }
  peek(): T | undefined { /* ... */ }
}`}
            </pre>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">Generic Functions with Result Types</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`type Result<T, E = string> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

async request<T>(endpoint: string): Promise<Result<T>>`}
            </pre>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">Generic Constraints</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`class FormValidator<T extends Record<string, any>> {
  addRule<K extends keyof T>(
    field: K, 
    rule: ValidationRule<T[K]>
  ): this
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericsDemo;