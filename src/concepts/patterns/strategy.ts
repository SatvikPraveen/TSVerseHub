// File: concepts/patterns/strategy.ts

/**
 * STRATEGY PATTERN
 * 
 * The Strategy pattern defines a family of algorithms, encapsulates each one,
 * and makes them interchangeable. Strategy lets the algorithm vary independently
 * from clients that use it.
 */

// ===== BASIC STRATEGY PATTERN =====

export interface Strategy {
  execute(a: number, b: number): number;
}

export class AddStrategy implements Strategy {
  execute(a: number, b: number): number {
    return a + b;
  }
}

export class SubtractStrategy implements Strategy {
  execute(a: number, b: number): number {
    return a - b;
  }
}

export class MultiplyStrategy implements Strategy {
  execute(a: number, b: number): number {
    return a * b;
  }
}

export class DivideStrategy implements Strategy {
  execute(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}

export class Calculator {
  private strategy: Strategy;

  constructor(strategy: Strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  calculate(a: number, b: number): number {
    return this.strategy.execute(a, b);
  }
}

// ===== PAYMENT STRATEGY PATTERN =====

export interface PaymentStrategy {
  pay(amount: number): { success: boolean; transactionId: string; message: string };
  validatePaymentDetails(): boolean;
}

export class CreditCardStrategy implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private expiryDate: string,
    private cvv: string,
    private cardHolderName: string
  ) {}

  validatePaymentDetails(): boolean {
    // Simple validation - in real app would be more comprehensive
    return this.cardNumber.length === 16 && 
           this.cvv.length === 3 && 
           this.expiryDate.length === 5 &&
           this.cardHolderName.length > 0;
  }

  pay(amount: number): { success: boolean; transactionId: string; message: string } {
    if (!this.validatePaymentDetails()) {
      return { success: false, transactionId: '', message: 'Invalid card details' };
    }

    // Simulate payment processing
    const transactionId = `CC-${Date.now()}`;
    console.log(`Processing credit card payment of ${amount}`);
    console.log(`Card: ****${this.cardNumber.slice(-4)}`);
    
    return {
      success: true,
      transactionId,
      message: `Payment of ${amount} processed successfully via credit card`
    };
  }
}

export class PayPalStrategy implements PaymentStrategy {
  constructor(private email: string, private password: string) {}

  validatePaymentDetails(): boolean {
    return this.email.includes('@') && this.password.length >= 6;
  }

  pay(amount: number): { success: boolean; transactionId: string; message: string } {
    if (!this.validatePaymentDetails()) {
      return { success: false, transactionId: '', message: 'Invalid PayPal credentials' };
    }

    const transactionId = `PP-${Date.now()}`;
    console.log(`Processing PayPal payment of ${amount} for ${this.email}`);
    
    return {
      success: true,
      transactionId,
      message: `Payment of ${amount} processed successfully via PayPal`
    };
  }
}

export class BankTransferStrategy implements PaymentStrategy {
  constructor(
    private accountNumber: string,
    private routingNumber: string,
    private bankName: string
  ) {}

  validatePaymentDetails(): boolean {
    return this.accountNumber.length >= 8 && 
           this.routingNumber.length === 9 &&
           this.bankName.length > 0;
  }

  pay(amount: number): { success: boolean; transactionId: string; message: string } {
    if (!this.validatePaymentDetails()) {
      return { success: false, transactionId: '', message: 'Invalid bank details' };
    }

    const transactionId = `BT-${Date.now()}`;
    console.log(`Processing bank transfer of ${amount} to ${this.bankName}`);
    console.log(`Account: ****${this.accountNumber.slice(-4)}`);
    
    return {
      success: true,
      transactionId,
      message: `Payment of ${amount} processed successfully via bank transfer`
    };
  }
}

export class CryptocurrencyStrategy implements PaymentStrategy {
  constructor(
    private walletAddress: string,
    private currency: 'BTC' | 'ETH' | 'ADA'
  ) {}

  validatePaymentDetails(): boolean {
    // Basic wallet address validation
    return this.walletAddress.length >= 26 && this.walletAddress.length <= 42;
  }

  pay(amount: number): { success: boolean; transactionId: string; message: string } {
    if (!this.validatePaymentDetails()) {
      return { success: false, transactionId: '', message: 'Invalid wallet address' };
    }

    const transactionId = `CRYPTO-${this.currency}-${Date.now()}`;
    console.log(`Processing ${this.currency} payment of ${amount}`);
    console.log(`Wallet: ${this.walletAddress.slice(0, 8)}...${this.walletAddress.slice(-8)}`);
    
    return {
      success: true,
      transactionId,
      message: `Payment of ${amount} processed successfully via ${this.currency}`
    };
  }
}

export class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number): { success: boolean; transactionId: string; message: string } {
    console.log(`Processing payment of ${amount}...`);
    return this.strategy.pay(amount);
  }
}

// ===== SORTING STRATEGY PATTERN =====

export interface SortStrategy<T> {
  sort(data: T[]): T[];
  name: string;
}

export class BubbleSortStrategy<T> implements SortStrategy<T> {
  name = 'Bubble Sort';

  sort(data: T[]): T[] {
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

export class QuickSortStrategy<T> implements SortStrategy<T> {
  name = 'Quick Sort';

  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];
    
    const arr = [...data];
    return this.quickSort(arr, 0, arr.length - 1);
  }

  private quickSort(arr: T[], low: number, high: number): T[] {
    if (low < high) {
      const pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
    return arr;
  }

  private partition(arr: T[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
}

export class MergeSortStrategy<T> implements SortStrategy<T> {
  name = 'Merge Sort';

  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];
    
    const arr = [...data];
    this.mergeSort(arr, 0, arr.length - 1);
    return arr;
  }

  private mergeSort(arr: T[], left: number, right: number): void {
    if (left < right) {
      const middle = Math.floor((left + right) / 2);
      
      this.mergeSort(arr, left, middle);
      this.mergeSort(arr, middle + 1, right);
      this.merge(arr, left, middle, right);
    }
  }

  private merge(arr: T[], left: number, middle: number, right: number): void {
    const leftArray = arr.slice(left, middle + 1);
    const rightArray = arr.slice(middle + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArray.length && j < rightArray.length) {
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }
      k++;
    }
    
    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      i++;
      k++;
    }
    
    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      j++;
      k++;
    }
  }
}

export class NativeSortStrategy<T> implements SortStrategy<T> {
  name = 'Native Sort';

  sort(data: T[]): T[] {
    return [...data].sort();
  }
}

export class SortContext<T> {
  private strategy: SortStrategy<T>;

  constructor(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  executeSort(data: T[]): { sorted: T[]; strategy: string; time: number } {
    const startTime = performance.now();
    const sorted = this.strategy.sort(data);
    const endTime = performance.now();
    
    return {
      sorted,
      strategy: this.strategy.name,
      time: endTime - startTime
    };
  }
}

// ===== COMPRESSION STRATEGY PATTERN =====

export interface CompressionStrategy {
  compress(data: string): string;
  decompress(compressedData: string): string;
  name: string;
  ratio: number;
}

export class ZipCompressionStrategy implements CompressionStrategy {
  name = 'ZIP';
  ratio = 0.6;

  compress(data: string): string {
    // Simulate ZIP compression
    const compressed = btoa(data).replace(/=/g, '');
    console.log(`ZIP: Compressed ${data.length} bytes to ${compressed.length} bytes`);
    return `ZIP:${compressed}`;
  }

  decompress(compressedData: string): string {
    if (!compressedData.startsWith('ZIP:')) {
      throw new Error('Invalid ZIP format');
    }
    
    const compressed = compressedData.substring(4);
    return atob(compressed + '='.repeat((4 - compressed.length % 4) % 4));
  }
}

export class GzipCompressionStrategy implements CompressionStrategy {
  name = 'GZIP';
  ratio = 0.7;

  compress(data: string): string {
    // Simulate GZIP compression
    const compressed = data.split('').reverse().join('').substring(0, Math.floor(data.length * this.ratio));
    console.log(`GZIP: Compressed ${data.length} bytes to ${compressed.length} bytes`);
    return `GZIP:${btoa(compressed)}`;
  }

  decompress(compressedData: string): string {
    if (!compressedData.startsWith('GZIP:')) {
      throw new Error('Invalid GZIP format');
    }
    
    const compressed = compressedData.substring(5);
    return atob(compressed).split('').reverse().join('');
  }
}

export class LZ77CompressionStrategy implements CompressionStrategy {
  name = 'LZ77';
  ratio = 0.5;

  compress(data: string): string {
    // Simulate LZ77 compression (very simplified)
    const compressed = data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
    console.log(`LZ77: Compressed ${data.length} bytes to ${compressed.length} bytes`);
    return `LZ77:${btoa(compressed)}`;
  }

  decompress(compressedData: string): string {
    if (!compressedData.startsWith('LZ77:')) {
      throw new Error('Invalid LZ77 format');
    }
    
    const compressed = atob(compressedData.substring(5));
    return compressed.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.substring(1));
      return char.repeat(count);
    });
  }
}

export class CompressionContext {
  private strategy: CompressionStrategy;

  constructor(strategy: CompressionStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CompressionStrategy): void {
    this.strategy = strategy;
  }

  compress(data: string): { compressed: string; originalSize: number; compressedSize: number; ratio: number; algorithm: string } {
    const compressed = this.strategy.compress(data);
    
    return {
      compressed,
      originalSize: data.length,
      compressedSize: compressed.length,
      ratio: compressed.length / data.length,
      algorithm: this.strategy.name
    };
  }

  decompress(compressedData: string): string {
    return this.strategy.decompress(compressedData);
  }
}

// ===== VALIDATION STRATEGY PATTERN =====

export interface ValidationStrategy<T> {
  validate(value: T): { isValid: boolean; errors: string[] };
  name: string;
}

export class EmailValidationStrategy implements ValidationStrategy<string> {
  name = 'Email Validation';

  validate(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else {
      if (!email.includes('@')) {
        errors.push('Email must contain @ symbol');
      }
      if (!email.includes('.')) {
        errors.push('Email must contain a domain');
      }
      if (email.length < 5) {
        errors.push('Email is too short');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email format is invalid');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

export class PasswordValidationStrategy implements ValidationStrategy<string> {
  name = 'Password Validation';

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one digit');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

export class PhoneValidationStrategy implements ValidationStrategy<string> {
  name = 'Phone Validation';

  validate(phone: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Phone number is required');
    } else {
      const cleaned = phone.replace(/[^\d]/g, '');
      
      if (cleaned.length < 10) {
        errors.push('Phone number must have at least 10 digits');
      }
      if (cleaned.length > 15) {
        errors.push('Phone number cannot have more than 15 digits');
      }
      if (!/^[\d\s\-\(\)\+\.]+$/.test(phone)) {
        errors.push('Phone number contains invalid characters');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

export class ValidationContext<T> {
  private strategies: ValidationStrategy<T>[] = [];

  addStrategy(strategy: ValidationStrategy<T>): void {
    this.strategies.push(strategy);
  }

  removeStrategy(strategy: ValidationStrategy<T>): void {
    const index = this.strategies.indexOf(strategy);
    if (index > -1) {
      this.strategies.splice(index, 1);
    }
  }

  validate(value: T): { isValid: boolean; errors: string[]; results: Array<{ strategy: string; isValid: boolean; errors: string[] }> } {
    const results: Array<{ strategy: string; isValid: boolean; errors: string[] }> = [];
    const allErrors: string[] = [];
    
    for (const strategy of this.strategies) {
      const result = strategy.validate(value);
      results.push({
        strategy: strategy.name,
        isValid: result.isValid,
        errors: result.errors
      });
      
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      results
    };
  }
}

// ===== USAGE EXAMPLES =====

console.log('=== Strategy Pattern Examples ===');

// Calculator Strategy
const calculator = new Calculator(new AddStrategy());
console.log('Addition:', calculator.calculate(10, 5));

calculator.setStrategy(new MultiplyStrategy());
console.log('Multiplication:', calculator.calculate(10, 5));

calculator.setStrategy(new DivideStrategy());
console.log('Division:', calculator.calculate(10, 5));

// Payment Strategy
const paymentProcessor = new PaymentProcessor(
  new CreditCardStrategy('1234567812345678', '12/25', '123', 'John Doe')
);

let result = paymentProcessor.processPayment(99.99);
console.log('Credit Card Payment:', result);

paymentProcessor.setPaymentStrategy(
  new PayPalStrategy('user@example.com', 'password123')
);

result = paymentProcessor.processPayment(49.99);
console.log('PayPal Payment:', result);

paymentProcessor.setPaymentStrategy(
  new CryptocurrencyStrategy('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC')
);

result = paymentProcessor.processPayment(0.001);
console.log('Cryptocurrency Payment:', result);

// Sorting Strategy
const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorter = new SortContext(new BubbleSortStrategy<number>());

let sortResult = sorter.executeSort(numbers);
console.log(`${sortResult.strategy}:`, sortResult.sorted, `(${sortResult.time.toFixed(2)}ms)`);

sorter.setStrategy(new QuickSortStrategy<number>());
sortResult = sorter.executeSort(numbers);
console.log(`${sortResult.strategy}:`, sortResult.sorted, `(${sortResult.time.toFixed(2)}ms)`);

sorter.setStrategy(new NativeSortStrategy<number>());
sortResult = sorter.executeSort(numbers);
console.log(`${sortResult.strategy}:`, sortResult.sorted, `(${sortResult.time.toFixed(2)}ms)`);

// Compression Strategy
const text = 'This is a sample text that we will compress using different algorithms';
const compressor = new CompressionContext(new ZipCompressionStrategy());

let compressionResult = compressor.compress(text);
console.log(`${compressionResult.algorithm} Compression:`, compressionResult);

const decompressed = compressor.decompress(compressionResult.compressed);
console.log('Decompressed:', decompressed);

compressor.setStrategy(new GzipCompressionStrategy());
compressionResult = compressor.compress(text);
console.log(`${compressionResult.algorithm} Compression:`, compressionResult);

// Validation Strategy
const emailValidator = new ValidationContext<string>();
emailValidator.addStrategy(new EmailValidationStrategy());

const emailResult = emailValidator.validate('user@example.com');
console.log('Email validation:', emailResult);

const invalidEmailResult = emailValidator.validate('invalid-email');
console.log('Invalid email validation:', invalidEmailResult);

const passwordValidator = new ValidationContext<string>();
passwordValidator.addStrategy(new PasswordValidationStrategy());

const passwordResult = passwordValidator.validate('MySecureP@ssw0rd');
console.log('Password validation:', passwordResult);

const weakPasswordResult = passwordValidator.validate('123');
console.log('Weak password validation:', weakPasswordResult);

export default {
  Calculator,
  AddStrategy,
  SubtractStrategy,
  MultiplyStrategy,
  DivideStrategy,
  PaymentProcessor,
  CreditCardStrategy,
  PayPalStrategy,
  BankTransferStrategy,
  CryptocurrencyStrategy,
  SortContext,
  BubbleSortStrategy,
  QuickSortStrategy,
  MergeSortStrategy,
  NativeSortStrategy,
  CompressionContext,
  ZipCompressionStrategy,
  GzipCompressionStrategy,
  LZ77CompressionStrategy,
  ValidationContext,
  EmailValidationStrategy,
  PasswordValidationStrategy,
  PhoneValidationStrategy,
};