// File: concepts/namespaces-modules/module-augmentation.ts

/**
 * MODULE AUGMENTATION IN TYPESCRIPT
 * 
 * Module augmentation allows you to extend existing modules with new
 * declarations. This is useful for adding functionality to third-party
 * libraries or extending built-in types.
 */

// ===== AUGMENTING BUILT-IN TYPES =====

// Augment the global Array interface
declare global {
  interface Array<T> {
    // Add utility methods to arrays
    first(): T | undefined;
    last(): T | undefined;
    isEmpty(): boolean;
    contains(item: T): boolean;
    removeItem(item: T): T[];
    insertAt(index: number, item: T): T[];
    chunk(size: number): T[][];
    flatten<U>(this: U[][]): U[];
    unique(keyFn?: (item: T) => any): T[];
    groupBy<K>(keyFn: (item: T) => K): Record<string, T[]>;
    sortBy(keyFn: (item: T) => any): T[];
    findLast(predicate: (item: T) => boolean): T | undefined;
    partition(predicate: (item: T) => boolean): [T[], T[]];
  }
}

// Implement the augmented Array methods
Array.prototype.first = function<T>(this: T[]): T | undefined {
  return this[0];
};

Array.prototype.last = function<T>(this: T[]): T | undefined {
  return this[this.length - 1];
};

Array.prototype.isEmpty = function<T>(this: T[]): boolean {
  return this.length === 0;
};

Array.prototype.contains = function<T>(this: T[], item: T): boolean {
  return this.includes(item);
};

Array.prototype.removeItem = function<T>(this: T[], item: T): T[] {
  return this.filter(x => x !== item);
};

Array.prototype.insertAt = function<T>(this: T[], index: number, item: T): T[] {
  const result = [...this];
  result.splice(index, 0, item);
  return result;
};

Array.prototype.chunk = function<T>(this: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < this.length; i += size) {
    chunks.push(this.slice(i, i + size));
  }
  return chunks;
};

Array.prototype.flatten = function<U>(this: U[][]): U[] {
  return this.reduce((acc, val) => acc.concat(val), []);
};

Array.prototype.unique = function<T>(this: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(this)];
  }
  const seen = new Set();
  return this.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

Array.prototype.groupBy = function<T, K>(this: T[], keyFn: (item: T) => K): Record<string, T[]> {
  return this.reduce((groups, item) => {
    const key = String(keyFn(item));
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

Array.prototype.sortBy = function<T>(this: T[], keyFn: (item: T) => any): T[] {
  return [...this].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
};

Array.prototype.findLast = function<T>(this: T[], predicate: (item: T) => boolean): T | undefined {
  for (let i = this.length - 1; i >= 0; i--) {
    if (predicate(this[i])) {
      return this[i];
    }
  }
  return undefined;
};

Array.prototype.partition = function<T>(this: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of this) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
};

// ===== AUGMENTING STRING =====

declare global {
  interface String {
    capitalize(): string;
    camelCase(): string;
    kebabCase(): string;
    snakeCase(): string;
    truncate(length: number, suffix?: string): string;
    removeWhitespace(): string;
    isEmail(): boolean;
    isUrl(): boolean;
    countWords(): number;
    reverse(): string;
    isPalindrome(): boolean;
    toTitleCase(): string;
    stripHtml(): string;
    formatTemplate(data: Record<string, any>): string;
  }
}

String.prototype.capitalize = function(): string {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

String.prototype.camelCase = function(): string {
  return this.toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
};

String.prototype.kebabCase = function(): string {
  return this.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

String.prototype.snakeCase = function(): string {
  return this.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

String.prototype.truncate = function(length: number, suffix = '...'): string {
  if (this.length <= length) return this.toString();
  return this.substr(0, length) + suffix;
};

String.prototype.removeWhitespace = function(): string {
  return this.replace(/\s+/g, '');
};

String.prototype.isEmail = function(): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(this.toString());
};

String.prototype.isUrl = function(): boolean {
  try {
    new URL(this.toString());
    return true;
  } catch {
    return false;
  }
};

String.prototype.countWords = function(): number {
  return this.trim().split(/\s+/).filter(word => word.length > 0).length;
};

String.prototype.reverse = function(): string {
  return this.split('').reverse().join('');
};

String.prototype.isPalindrome = function(): boolean {
  const cleaned = this.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
};

String.prototype.toTitleCase = function(): string {
  return this.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

String.prototype.stripHtml = function(): string {
  return this.replace(/<[^>]*>/g, '');
};

String.prototype.formatTemplate = function(data: Record<string, any>): string {
  return this.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
};

// ===== AUGMENTING DATE =====

declare global {
  interface Date {
    addDays(days: number): Date;
    addHours(hours: number): Date;
    addMinutes(minutes: number): Date;
    format(format: string): string;
    isToday(): boolean;
    isYesterday(): boolean;
    isTomorrow(): boolean;
    isWeekend(): boolean;
    getWeekNumber(): number;
    clone(): Date;
    startOfDay(): Date;
    endOfDay(): Date;
    diffInDays(other: Date): number;
    diffInHours(other: Date): number;
    isBefore(other: Date): boolean;
    isAfter(other: Date): boolean;
    isSameDay(other: Date): boolean;
  }
}

Date.prototype.addDays = function(days: number): Date {
  const result = this.clone();
  result.setDate(result.getDate() + days);
  return result;
};

Date.prototype.addHours = function(hours: number): Date {
  const result = this.clone();
  result.setHours(result.getHours() + hours);
  return result;
};

Date.prototype.addMinutes = function(minutes: number): Date {
  const result = this.clone();
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

Date.prototype.format = function(format: string): string {
  const map: Record<string, string> = {
    'YYYY': this.getFullYear().toString(),
    'MM': String(this.getMonth() + 1).padStart(2, '0'),
    'DD': String(this.getDate()).padStart(2, '0'),
    'HH': String(this.getHours()).padStart(2, '0'),
    'mm': String(this.getMinutes()).padStart(2, '0'),
    'ss': String(this.getSeconds()).padStart(2, '0'),
  };

  let result = format;
  for (const [key, value] of Object.entries(map)) {
    result = result.replace(key, value);
  }
  return result;
};

Date.prototype.isToday = function(): boolean {
  return this.isSameDay(new Date());
};

Date.prototype.isYesterday = function(): boolean {
  return this.isSameDay(new Date().addDays(-1));
};

Date.prototype.isTomorrow = function(): boolean {
  return this.isSameDay(new Date().addDays(1));
};

Date.prototype.isWeekend = function(): boolean {
  const day = this.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

Date.prototype.getWeekNumber = function(): number {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

Date.prototype.clone = function(): Date {
  return new Date(this.getTime());
};

Date.prototype.startOfDay = function(): Date {
  const result = this.clone();
  result.setHours(0, 0, 0, 0);
  return result;
};

Date.prototype.endOfDay = function(): Date {
  const result = this.clone();
  result.setHours(23, 59, 59, 999);
  return result;
};

Date.prototype.diffInDays = function(other: Date): number {
  const diffTime = Math.abs(this.getTime() - other.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Date.prototype.diffInHours = function(other: Date): number {
  const diffTime = Math.abs(this.getTime() - other.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

Date.prototype.isBefore = function(other: Date): boolean {
  return this.getTime() < other.getTime();
};

Date.prototype.isAfter = function(other: Date): boolean {
  return this.getTime() > other.getTime();
};

Date.prototype.isSameDay = function(other: Date): boolean {
  return this.toDateString() === other.toDateString();
};

// ===== AUGMENTING NUMBER =====

declare global {
  interface Number {
    toFixedNumber(digits: number): number;
    clamp(min: number, max: number): number;
    isEven(): boolean;
    isOdd(): boolean;
    isPrime(): boolean;
    toPercent(): string;
    toCurrency(currency?: string, locale?: string): string;
    toBytes(): string;
    factorial(): number;
    gcd(other: number): number;
    lcm(other: number): number;
    isPowerOf(base: number): boolean;
  }
}

Number.prototype.toFixedNumber = function(digits: number): number {
  return parseFloat(this.toFixed(digits));
};

Number.prototype.clamp = function(min: number, max: number): number {
  return Math.min(Math.max(this as number, min), max);
};

Number.prototype.isEven = function(): boolean {
  return (this as number) % 2 === 0;
};

Number.prototype.isOdd = function(): boolean {
  return (this as number) % 2 !== 0;
};

Number.prototype.isPrime = function(): boolean {
  const num = this as number;
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

Number.prototype.toPercent = function(): string {
  return `${((this as number) * 100).toFixed(2)}%`;
};

Number.prototype.toCurrency = function(currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(this as number);
};

Number.prototype.toBytes = function(): string {
  const bytes = this as number;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

Number.prototype.factorial = function(): number {
  const num = this as number;
  if (num < 0) return NaN;
  if (num === 0 || num === 1) return 1;
  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }
  return result;
};

Number.prototype.gcd = function(other: number): number {
  const a = Math.abs(this as number);
  const b = Math.abs(other);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

Number.prototype.lcm = function(other: number): number {
  return Math.abs((this as number) * other) / this.gcd(other);
};

Number.prototype.isPowerOf = function(base: number): boolean {
  const num = this as number;
  if (num <= 0 || base <= 1) return false;
  return Number.isInteger(Math.log(num) / Math.log(base));
};

// ===== AUGMENTING THIRD-PARTY MODULE (EXAMPLE) =====

// Example: Augmenting a hypothetical Express.js Request interface
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
    requestId: string;
    startTime: number;
    ip: string;
    userAgent: string;
  }

  interface Response {
    success(data?: any): Response;
    error(message: string, code?: number): Response;
    paginate(data: any[], page: number, limit: number, total: number): Response;
  }
}

// ===== AUGMENTING JSON =====

declare global {
  interface JSON {
    tryParse<T>(text: string, fallback?: T): T | undefined;
    deepClone<T>(obj: T): T;
    isValidJson(text: string): boolean;
  }
}

JSON.tryParse = function<T>(text: string, fallback?: T): T | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

JSON.deepClone = function<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
};

JSON.isValidJson = function(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

// ===== AUGMENTING CONSOLE =====

declare global {
  interface Console {
    success(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    debug(message?: any, ...optionalParams: any[]): void;
    table(data: any): void;
    time(label: string): void;
    timeEnd(label: string): void;
    group(label?: string): void;
    groupCollapsed(label?: string): void;
    groupEnd(): void;
  }
}

console.success = function(message?: any, ...optionalParams: any[]): void {
  console.log(`✅ ${message}`, ...optionalParams);
};

// ===== USAGE EXAMPLES =====

export function demonstrateAugmentations() {
  console.log('=== Module Augmentation Examples ===\n');

  // Array augmentations
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  console.log('Array first():', numbers.first());
  console.log('Array last():', numbers.last());
  console.log('Array chunk(3):', numbers.chunk(3));
  
  const people = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 25 },
  ];
  console.log('Array groupBy age:', people.groupBy(p => p.age));

  // String augmentations
  const text = 'hello world';
  console.log('String capitalize():', text.capitalize());
  console.log('String camelCase():', text.camelCase());
  console.log('String kebabCase():', 'HelloWorld'.kebabCase());
  console.log('String isEmail():', 'test@example.com'.isEmail());

  // Date augmentations
  const date = new Date();
  console.log('Date format():', date.format('YYYY-MM-DD HH:mm:ss'));
  console.log('Date isToday():', date.isToday());
  console.log('Date addDays(7):', date.addDays(7).format('YYYY-MM-DD'));

  // Number augmentations
  const num = 42;
  console.log('Number isEven():', num.isEven());
  console.log('Number factorial():', (5).factorial());
  console.log('Number toCurrency():', (99.99).toCurrency());
  console.log('Number isPrime():', (17).isPrime());

  // JSON augmentations
  const invalidJson = '{"invalid": json}';
  console.log('JSON tryParse():', JSON.tryParse(invalidJson, { fallback: true }));

  console.success('All augmentation examples completed!');
}

// ===== EXPORTING FOR USE =====

export {
  // Export types for external modules to use
  demonstrateAugmentations,
};

export default {
  demonstrateAugmentations,
};