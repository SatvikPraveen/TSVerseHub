// File: concepts/patterns/demo.tsx

import React, { useState, useEffect, useCallback } from 'react';

const DesignPatternsDemo: React.FC = () => {
  const [activePattern, setActivePattern] = useState<'singleton' | 'factory' | 'observer' | 'strategy'>('singleton');
  const [output, setOutput] = useState<string[]>([]);
  const [codeExample, setCodeExample] = useState('');

  const addOutput = (message: string) => {
    setOutput(prev => [...prev, message]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  // Mock implementations for demonstration
  const mockPatterns = {
    // Singleton Pattern Mock
    Singleton: {
      instance: null as any,
      getInstance() {
        if (!this.instance) {
          this.instance = { id: Date.now(), data: 'Singleton Data' };
        }
        return this.instance;
      }
    },

    // Factory Pattern Mock
    VehicleFactory: {
      createVehicle(type: string) {
        switch (type) {
          case 'car':
            return { type: 'car', wheels: 4, start: () => 'Car started' };
          case 'motorcycle':
            return { type: 'motorcycle', wheels: 2, start: () => 'Motorcycle roared to life' };
          case 'truck':
            return { type: 'truck', wheels: 8, start: () => 'Truck engine started' };
          default:
            throw new Error(`Unknown vehicle type: ${type}`);
        }
      }
    },

    // Observer Pattern Mock
    EventEmitter: {
      events: new Map() as Map<string, Function[]>,
      on(event: string, callback: Function) {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
      },
      emit(event: string, data: any) {
        const callbacks = this.events.get(event) || [];
        callbacks.forEach(callback => callback(data));
      }
    },

    // Strategy Pattern Mock
    PaymentProcessor: {
      strategy: null as any,
      setStrategy(strategy: any) {
        this.strategy = strategy;
      },
      processPayment(amount: number) {
        if (!this.strategy) {
          throw new Error('No payment strategy set');
        }
        return this.strategy.pay(amount);
      }
    },

    // Payment Strategies Mock
    CreditCardStrategy: {
      pay(amount: number) {
        return `Processed $${amount} via Credit Card (****1234)`;
      }
    },
    PayPalStrategy: {
      pay(amount: number) {
        return `Processed $${amount} via PayPal (user@example.com)`;
      }
    },
    CryptoStrategy: {
      pay(amount: number) {
        return `Processed $${amount} via Bitcoin (1A1zP1eP5QGefi...)`;
      }
    }
  };

  const demonstrateSingleton = useCallback(() => {
    clearOutput();
    addOutput('=== SINGLETON PATTERN DEMONSTRATION ===');
    addOutput('');
    addOutput('Creating first instance...');
    
    const instance1 = mockPatterns.Singleton.getInstance();
    addOutput(`Instance 1 ID: ${instance1.id}`);
    addOutput(`Instance 1 Data: ${instance1.data}`);
    addOutput('');
    
    addOutput('Creating second instance...');
    const instance2 = mockPatterns.Singleton.getInstance();
    addOutput(`Instance 2 ID: ${instance2.id}`);
    addOutput(`Instance 2 Data: ${instance2.data}`);
    addOutput('');
    
    addOutput(`Same instance? ${instance1 === instance2}`);
    addOutput('');
    addOutput('✅ Singleton ensures only one instance exists globally');

    setCodeExample(`// Singleton Pattern Implementation
class Singleton {
  private static instance: Singleton | null = null;
  private data: string;

  private constructor() {
    this.data = 'Singleton Data';
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public getData(): string {
    return this.data;
  }
}

// Usage
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true`);
  }, []);

  const demonstrateFactory = useCallback(() => {
    clearOutput();
    addOutput('=== FACTORY PATTERN DEMONSTRATION ===');
    addOutput('');
    
    const vehicles = ['car', 'motorcycle', 'truck'];
    
    vehicles.forEach(vehicleType => {
      try {
        addOutput(`Creating ${vehicleType}...`);
        const vehicle = mockPatterns.VehicleFactory.createVehicle(vehicleType);
        addOutput(`✅ Created ${vehicle.type} with ${vehicle.wheels} wheels`);
        addOutput(`🚗 ${vehicle.start()}`);
        addOutput('');
      } catch (error) {
        addOutput(`❌ Error: ${error.message}`);
      }
    });

    addOutput('✅ Factory pattern encapsulates object creation logic');

    setCodeExample(`// Factory Pattern Implementation
interface Vehicle {
  type: string;
  wheels: number;
  start(): string;
}

class Car implements Vehicle {
  type = 'car';
  wheels = 4;
  start() { return 'Car started'; }
}

class Motorcycle implements Vehicle {
  type = 'motorcycle';
  wheels = 2;
  start() { return 'Motorcycle roared to life'; }
}

class VehicleFactory {
  static createVehicle(type: string): Vehicle {
    switch (type) {
      case 'car': return new Car();
      case 'motorcycle': return new Motorcycle();
      default: throw new Error(\`Unknown type: \${type}\`);
    }
  }
}

// Usage
const car = VehicleFactory.createVehicle('car');
const bike = VehicleFactory.createVehicle('motorcycle');`);
  }, []);

  const demonstrateObserver = useCallback(() => {
    clearOutput();
    addOutput('=== OBSERVER PATTERN DEMONSTRATION ===');
    addOutput('');
    
    // Set up observers
    const emailService = (data: any) => {
      addOutput(`📧 Email Service: Sending welcome email to ${data.name}`);
    };
    
    const analyticsService = (data: any) => {
      addOutput(`📊 Analytics Service: Tracking user signup - ${data.email}`);
    };
    
    const notificationService = (data: any) => {
      addOutput(`🔔 Notification Service: Push notification sent to ${data.name}`);
    };

    // Register observers
    addOutput('Registering observers...');
    mockPatterns.EventEmitter.on('user:created', emailService);
    mockPatterns.EventEmitter.on('user:created', analyticsService);
    mockPatterns.EventEmitter.on('user:created', notificationService);
    addOutput('✅ 3 observers registered for "user:created" event');
    addOutput('');
    
    // Emit event
    addOutput('Creating new user...');
    const userData = { name: 'John Doe', email: 'john@example.com' };
    mockPatterns.EventEmitter.emit('user:created', userData);
    addOutput('');
    addOutput('✅ All observers notified automatically!');

    setCodeExample(`// Observer Pattern Implementation
interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

class EmailService implements Observer {
  update(userData: any): void {
    console.log(\`Sending email to \${userData.email}\`);
  }
}

// Usage
const subject = new Subject();
const emailService = new EmailService();
subject.attach(emailService);
subject.notify({ email: 'user@example.com' });`);
  }, []);

  const demonstrateStrategy = useCallback(() => {
    clearOutput();
    addOutput('=== STRATEGY PATTERN DEMONSTRATION ===');
    addOutput('');
    
    const amount = 99.99;
    const strategies = [
      { name: 'Credit Card', strategy: mockPatterns.CreditCardStrategy },
      { name: 'PayPal', strategy: mockPatterns.PayPalStrategy },
      { name: 'Cryptocurrency', strategy: mockPatterns.CryptoStrategy }
    ];

    strategies.forEach(({ name, strategy }) => {
      addOutput(`Setting payment method to ${name}...`);
      mockPatterns.PaymentProcessor.setStrategy(strategy);
      
      const result = mockPatterns.PaymentProcessor.processPayment(amount);
      addOutput(`💳 ${result}`);
      addOutput('');
    });

    addOutput('✅ Strategy pattern allows switching algorithms at runtime');

    setCodeExample(`// Strategy Pattern Implementation
interface PaymentStrategy {
  pay(amount: number): string;
}

class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return \`Paid $\${amount} with Credit Card\`;
  }
}

class PayPalStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return \`Paid $\${amount} with PayPal\`;
  }
}

class PaymentProcessor {
  private strategy: PaymentStrategy;

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number): string {
    return this.strategy.pay(amount);
  }
}

// Usage
const processor = new PaymentProcessor();
processor.setStrategy(new CreditCardStrategy());
processor.processPayment(100); // Uses credit card

processor.setStrategy(new PayPalStrategy());
processor.processPayment(100); // Uses PayPal`);
  }, []);

  // Auto-run demo on pattern change
  useEffect(() => {
    switch (activePattern) {
      case 'singleton': demonstrateSingleton(); break;
      case 'factory': demonstrateFactory(); break;
      case 'observer': demonstrateObserver(); break;
      case 'strategy': demonstrateStrategy(); break;
    }
  }, [activePattern, demonstrateSingleton, demonstrateFactory, demonstrateObserver, demonstrateStrategy]);

  const patternButtons = [
    { key: 'singleton' as const, label: 'Singleton', color: 'bg-blue-500', icon: '🔒' },
    { key: 'factory' as const, label: 'Factory', color: 'bg-green-500', icon: '🏭' },
    { key: 'observer' as const, label: 'Observer', color: 'bg-purple-500', icon: '👁️' },
    { key: 'strategy' as const, label: 'Strategy', color: 'bg-orange-500', icon: '🎯' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎨 Design Patterns Interactive Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Explore fundamental design patterns with TypeScript implementations. 
          Each pattern solves common software design problems with proven solutions.
        </p>
      </div>

      {/* Pattern Selection */}
      <div className="flex flex-wrap gap-3 mb-6">
        {patternButtons.map(({ key, label, color, icon }) => (
          <button
            key={key}
            onClick={() => setActivePattern(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all ${
              activePattern === key 
                ? `${color} shadow-md transform scale-105` 
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Output */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🖥️</span> Demo Output
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div>Select a pattern to see it in action...</div>
                </div>
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

        {/* Code Example */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>💻</span> Implementation Code
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            <pre className="text-sm">
              <code className="language-typescript">{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Pattern Information Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔒</span>
            <h3 className="font-semibold text-blue-800">Singleton</h3>
          </div>
          <p className="text-sm text-blue-700 mb-2">
            Ensures only one instance of a class exists globally.
          </p>
          <div className="text-xs text-blue-600">
            <strong>Use cases:</strong> Database connections, logging, caching
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏭</span>
            <h3 className="font-semibold text-green-800">Factory</h3>
          </div>
          <p className="text-sm text-green-700 mb-2">
            Creates objects without specifying their exact classes.
          </p>
          <div className="text-xs text-green-600">
            <strong>Use cases:</strong> UI components, database drivers, parsers
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👁️</span>
            <h3 className="font-semibold text-purple-800">Observer</h3>
          </div>
          <p className="text-sm text-purple-700 mb-2">
            Defines one-to-many dependency between objects.
          </p>
          <div className="text-xs text-purple-600">
            <strong>Use cases:</strong> Event systems, MVC, notifications
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-orange-800">Strategy</h3>
          </div>
          <p className="text-sm text-orange-700 mb-2">
            Defines family of algorithms and makes them interchangeable.
          </p>
          <div className="text-xs text-orange-600">
            <strong>Use cases:</strong> Payment methods, sorting, validation
          </div>
        </div>
      </div>

      {/* Real-world Applications */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
          <span>🌟</span> Real-world Applications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">Frontend Development:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li><strong>Singleton:</strong> Redux store, API clients</li>
              <li><strong>Factory:</strong> React component factories</li>
              <li><strong>Observer:</strong> State management, event listeners</li>
              <li><strong>Strategy:</strong> Form validation, theme switching</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">Backend Development:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li><strong>Singleton:</strong> Database connections, loggers</li>
              <li><strong>Factory:</strong> HTTP clients, service creation</li>
              <li><strong>Observer:</strong> Webhooks, message queues</li>
              <li><strong>Strategy:</strong> Payment processing, algorithms</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Tips */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <span>💡</span> Pro Tips
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>• Pattern Selection:</strong> Choose patterns based on the problem, not personal preference</p>
          <p><strong>• TypeScript Benefits:</strong> Strong typing makes patterns more robust and self-documenting</p>
          <p><strong>• SOLID Principles:</strong> Good patterns naturally follow SOLID design principles</p>
          <p><strong>• Testing:</strong> Well-implemented patterns make code easier to test and mock</p>
        </div>
      </div>
    </div>
  );
};

export default DesignPatternsDemo;