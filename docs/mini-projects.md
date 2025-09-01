# TypeScript Mini Projects
**File Location:** `docs/mini-projects.md`

This guide contains practical mini-projects to help you practice TypeScript concepts and build real-world applications.

## Table of Contents
1. [Task Manager CLI](#task-manager-cli)
2. [Type-Safe HTTP Client](#type-safe-http-client)
3. [Generic Data Store](#generic-data-store)
4. [Event Emitter System](#event-emitter-system)
5. [Form Validation Library](#form-validation-library)
6. [Simple ORM](#simple-orm)
7. [State Management Library](#state-management-library)
8. [File Parser Utilities](#file-parser-utilities)

## Task Manager CLI

Build a command-line task manager with TypeScript to practice interfaces, enums, and classes.

### Project Structure

```typescript
// types.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TaskFilter {
  completed?: boolean;
  priority?: Priority;
  tag?: string;
  dueBefore?: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}
```

### Task Manager Class

```typescript
// task-manager.ts
import { Task, Priority, TaskFilter, CreateTaskInput } from './types';
import { v4 as uuidv4 } from 'uuid';

export class TaskManager {
  private tasks: Task[] = [];

  createTask(input: CreateTaskInput): Task {
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority ?? Priority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: input.dueDate,
      tags: input.tags ?? []
    };

    this.tasks.push(task);
    return task;
  }

  getTasks(filter?: TaskFilter): Task[] {
    let filteredTasks = [...this.tasks];

    if (filter) {
      if (filter.completed !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.completed === filter.completed);
      }

      if (filter.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
      }

      if (filter.tag) {
        filteredTasks = filteredTasks.filter(task => task.tags.includes(filter.tag!));
      }

      if (filter.dueBefore) {
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate <= filter.dueBefore!
        );
      }
    }

    return filteredTasks.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    return this.tasks.length < initialLength;
  }

  completeTask(id: string): Task | null {
    return this.updateTask(id, { completed: true });
  }

  getTaskById(id: string): Task | null {
    return this.tasks.find(task => task.id === id) ?? null;
  }

  getTaskStats(): {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: Record<Priority, number>;
  } {
    const now = new Date();
    const stats = {
      total: this.tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      byPriority: {
        [Priority.LOW]: 0,
        [Priority.MEDIUM]: 0,
        [Priority.HIGH]: 0,
        [Priority.URGENT]: 0
      }
    };

    this.tasks.forEach(task => {
      if (task.completed) {
        stats.completed++;
      } else {
        stats.pending++;
        if (task.dueDate && task.dueDate < now) {
          stats.overdue++;
        }
      }
      stats.byPriority[task.priority]++;
    });

    return stats;
  }
}
```

### CLI Interface

```typescript
// cli.ts
import * as readline from 'readline';
import { TaskManager } from './task-manager';
import { Priority } from './types';

export class TaskCLI {
  private taskManager = new TaskManager();
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async start(): Promise<void> {
    console.log('Welcome to TaskManager CLI!');
    console.log('Commands: add, list, complete, delete, stats, help, exit');
    
    while (true) {
      const command = await this.prompt('> ');
      const [action, ...args] = command.trim().split(' ');

      try {
        switch (action.toLowerCase()) {
          case 'add':
            await this.addTask();
            break;
          case 'list':
            this.listTasks(args[0]);
            break;
          case 'complete':
            this.completeTask(args[0]);
            break;
          case 'delete':
            this.deleteTask(args[0]);
            break;
          case 'stats':
            this.showStats();
            break;
          case 'help':
            this.showHelp();
            break;
          case 'exit':
            this.rl.close();
            return;
          default:
            console.log('Unknown command. Type "help" for available commands.');
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }

      console.log(); // Empty line for readability
    }
  }

  private async addTask(): Promise<void> {
    const title = await this.prompt('Task title: ');
    const description = await this.prompt('Description (optional): ');
    const priorityStr = await this.prompt('Priority (low/medium/high/urgent): ');
    const dueDateStr = await this.prompt('Due date (YYYY-MM-DD, optional): ');
    const tagsStr = await this.prompt('Tags (comma-separated, optional): ');

    const priority = this.parsePriority(priorityStr);
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const task = this.taskManager.createTask({
      title,
      description: description || undefined,
      priority,
      dueDate,
      tags
    });

    console.log(`✅ Task created: ${task.title} (ID: ${task.id.slice(0, 8)})`);
  }

  private listTasks(filter?: string): void {
    const tasks = this.taskManager.getTasks();
    
    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    console.log('\n📋 Tasks:');
    console.log('─'.repeat(80));

    tasks.forEach(task => {
      const status = task.completed ? '✅' : '⏳';
      const priority = this.formatPriority(task.priority);
      const dueDate = task.dueDate ? ` (Due: ${task.dueDate.toDateString()})` : '';
      const tags = task.tags.length > 0 ? ` #${task.tags.join(' #')}` : '';
      
      console.log(`${status} [${task.id.slice(0, 8)}] ${task.title}${dueDate}`);
      console.log(`   Priority: ${priority}${tags}`);
      if (task.description) {
        console.log(`   ${task.description}`);
      }
      console.log('');
    });
  }

  private completeTask(taskId?: string): void {
    if (!taskId) {
      console.log('Please provide a task ID');
      return;
    }

    const task = this.taskManager.completeTask(taskId);
    if (task) {
      console.log(`✅ Task completed: ${task.title}`);
    } else {
      console.log('Task not found');
    }
  }

  private deleteTask(taskId?: string): void {
    if (!taskId) {
      console.log('Please provide a task ID');
      return;
    }

    const deleted = this.taskManager.deleteTask(taskId);
    if (deleted) {
      console.log('🗑️  Task deleted');
    } else {
      console.log('Task not found');
    }
  }

  private showStats(): void {
    const stats = this.taskManager.getTaskStats();
    
    console.log('\n📊 Task Statistics:');
    console.log('─'.repeat(30));
    console.log(`Total tasks: ${stats.total}`);
    console.log(`Completed: ${stats.completed}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Overdue: ${stats.overdue}`);
    console.log('\nBy Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count}`);
    });
  }

  private showHelp(): void {
    console.log('\n📚 Available Commands:');
    console.log('─'.repeat(40));
    console.log('add        - Add a new task');
    console.log('list       - List all tasks');
    console.log('complete <id> - Mark task as completed');
    console.log('delete <id>   - Delete a task');
    console.log('stats      - Show task statistics');
    console.log('help       - Show this help message');
    console.log('exit       - Exit the application');
  }

  private parsePriority(priorityStr: string): Priority {
    const priority = priorityStr.toLowerCase() as Priority;
    return Object.values(Priority).includes(priority) ? priority : Priority.MEDIUM;
  }

  private formatPriority(priority: Priority): string {
    const icons = {
      [Priority.LOW]: '🟢 Low',
      [Priority.MEDIUM]: '🟡 Medium',
      [Priority.HIGH]: '🟠 High',
      [Priority.URGENT]: '🔴 Urgent'
    };
    return icons[priority];
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// main.ts
const cli = new TaskCLI();
cli.start().catch(console.error);
```

## Type-Safe HTTP Client

Build a type-safe HTTP client using generics and advanced types.

```typescript
// http-client.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

type RequestInterceptor = (config: RequestConfig & { url: string }) => RequestConfig & { url: string };
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T>;

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {};
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST' }, data);
  }

  async put<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT' }, data);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  private async request<T>(
    url: string,
    config: RequestConfig = {},
    data?: any
  ): Promise<ApiResponse<T>> {
    let requestConfig = {
      method: config.method || 'GET' as HttpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...config.headers
      },
      timeout: config.timeout || 5000,
      retries: config.retries || 0,
      url: this.baseURL + url
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    const fetchOptions: RequestInit = {
      method: requestConfig.method,
      headers: requestConfig.headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    let lastError: Error;
    let attempts = 0;
    const maxAttempts = requestConfig.retries + 1;

    while (attempts < maxAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);

        const response = await fetch(requestConfig.url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let responseData: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text() as unknown as T;
        }

        let apiResponse: ApiResponse<T> = {
          data: responseData,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          apiResponse = interceptor(apiResponse);
        }

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        if (attempts < maxAttempts) {
          await this.delay(Math.pow(2, attempts) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// api-client.ts - Example usage with typed endpoints
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export class ApiClient {
  private http: HttpClient;

  constructor(baseURL: string) {
    this.http = new HttpClient(baseURL);
    
    // Add authentication interceptor
    this.http.addRequestInterceptor((config) => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return config;
    });

    // Add logging interceptor
    this.http.addResponseInterceptor((response) => {
      console.log(`API Response: ${response.status}`, response.data);
      return response;
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.http.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.http.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.http.post<User, CreateUserRequest>('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.http.put<User, Partial<CreateUserRequest>>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.http.delete(`/users/${id}`);
  }

  // Post endpoints
  async getPosts(userId?: number): Promise<Post[]> {
    const url = userId ? `/posts?userId=${userId}` : '/posts';
    const response = await this.http.get<Post[]>(url);
    return response.data;
  }

  async getPost(id: number): Promise<Post> {
    const response = await this.http.get<Post>(`/posts/${id}`);
    return response.data;
  }
}
```

## Generic Data Store

Create a generic in-memory data store with TypeScript.

```typescript
// data-store.ts
interface Entity {
  id: string | number;
}

type FilterFn<T> = (item: T) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type UpdateFn<T> = (item: T) => Partial<T>;

interface QueryOptions<T> {
  filter?: FilterFn<T>;
  sort?: SortFn<T>;
  limit?: number;
  offset?: number;
}

interface StoreEvents<T> {
  created: (item: T) => void;
  updated: (item: T, oldItem: T) => void;
  deleted: (id: string | number) => void;
}

export class DataStore<T extends Entity> {
  private data = new Map<string | number, T>();
  private listeners: Partial<StoreEvents<T>> = {};

  // Basic CRUD operations
  create(item: T): T {
    if (this.data.has(item.id)) {
      throw new Error(`Item with ID ${item.id} already exists`);
    }
    
    this.data.set(item.id, { ...item });
    this.emit('created', item);
    return item;
  }

  findById(id: string | number): T | undefined {
    return this.data.get(id);
  }

  findAll(options: QueryOptions<T> = {}): T[] {
    let results = Array.from(this.data.values());

    // Apply filter
    if (options.filter) {
      results = results.filter(options.filter);
    }

    // Apply sort
    if (options.sort) {
      results.sort(options.sort);
    }

    // Apply pagination
    if (options.offset) {
      results = results.slice(options.offset);
    }
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  findOne(filter: FilterFn<T>): T | undefined {
    return Array.from(this.data.values()).find(filter);
  }

  update(id: string | number, updateData: Partial<T>): T | undefined {
    const existingItem = this.data.get(id);
    if (!existingItem) {
      return undefined;
    }

    const updatedItem = { ...existingItem, ...updateData };
    this.data.set(id, updatedItem);
    this.emit('updated', updatedItem, existingItem);
    return updatedItem;
  }

  updateMany(filter: FilterFn<T>, updateFn: UpdateFn<T>): T[] {
    const updatedItems: T[] = [];
    
    for (const [id, item] of this.data) {
      if (filter(item)) {
        const updateData = updateFn(item);
        const updatedItem = { ...item, ...updateData };
        this.data.set(id, updatedItem);
        updatedItems.push(updatedItem);
        this.emit('updated', updatedItem, item);
      }
    }
    
    return updatedItems;
  }

  delete(id: string | number): boolean {
    const existed = this.data.delete(id);
    if (existed) {
      this.emit('deleted', id);
    }
    return existed;
  }

  deleteMany(filter: FilterFn<T>): number {
    let deleteCount = 0;
    
    for (const [id, item] of this.data) {
      if (filter(item)) {
        this.data.delete(id);
        this.emit('deleted', id);
        deleteCount++;
      }
    }
    
    return deleteCount;
  }

  count(filter?: FilterFn<T>): number {
    if (!filter) {
      return this.data.size;
    }
    
    return Array.from(this.data.values()).filter(filter).length;
  }

  clear(): void {
    this.data.clear();
  }

  // Event handling
  on<K extends keyof StoreEvents<T>>(event: K, listener: StoreEvents<T>[K]): void {
    this.listeners[event] = listener;
  }

  off<K extends keyof StoreEvents<T>>(event: K): void {
    delete this.listeners[event];
  }

  private emit<K extends keyof StoreEvents<T>>(event: K, ...args: Parameters<NonNullable<StoreEvents<T>[K]>>): void {
    const listener = this.listeners[event];
    if (listener) {
      (listener as any)(...args);
    }
  }

  // Utility methods
  exists(id: string | number): boolean {
    return this.data.has(id);
  }

  isEmpty(): boolean {
    return this.data.size === 0;
  }

  toArray(): T[] {
    return Array.from(this.data.values());
  }

  toJSON(): Record<string | number, T> {
    return Object.fromEntries(this.data);
  }

  fromJSON(data: Record<string | number, T>): void {
    this.clear();
    Object.entries(data).forEach(([id, item]) => {
      this.data.set(id, item);
    });
  }
}

// Example usage
interface User extends Entity {
  id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
}

const userStore = new DataStore<User>();

// Add event listeners
userStore.on('created', (user) => {
  console.log(`User created: ${user.name}`);
});

userStore.on('updated', (newUser, oldUser) => {
  console.log(`User updated: ${oldUser.name} -> ${newUser.name}`);
});

// Create users
userStore.create({
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
  active: true
});

userStore.create({
  id: '2',
  name: 'Bob',
  email: 'bob@example.com',
  age: 25,
  active: false
});

// Query examples
const activeUsers = userStore.findAll({
  filter: (user) => user.active,
  sort: (a, b) => a.name.localeCompare(b.name)
});

const youngUsers = userStore.findAll({
  filter: (user) => user.age < 30,
  limit: 10
});

// Update examples
userStore.update('1', { age: 31 });
userStore.updateMany(
  (user) => !user.active,
  (user) => ({ active: true })
);
```

## Event Emitter System

Build a type-safe event emitter system.

```typescript
// event-emitter.ts
type EventMap = Record<string, any[]>;
type EventListener<T extends any[]> = (...args: T) => void | Promise<void>;
type EventListenerMap<T extends EventMap> = {
  [K in keyof T]: EventListener<T[K]>;
};

interface ListenerOptions {
  once?: boolean;
  priority?: number;
}

interface ListenerInfo<T extends any[]> {
  listener: EventListener<T>;
  once: boolean;
  priority: number;
}

export class TypedEventEmitter<T extends EventMap> {
  private listeners = new Map<keyof T, ListenerInfo<any>[]>();
  private maxListeners = 10;

  // Add listener
  on<K extends keyof T>(
    event: K,
    listener: EventListenerMap<T>[K],
    options: ListenerOptions = {}
  ): this {
    return this.addListener(event, listener, options);
  }

  // Add one-time listener
  once<K extends keyof T>(
    event: K,
    listener: EventListenerMap<T>[K]
  ): this {
    return this.addListener(event, listener, { once: true });
  }

  // Remove listener
  off<K extends keyof T>(
    event: K,
    listener: EventListenerMap<T>[K]
  ): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.findIndex(info => info.listener === listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
        if (eventListeners.length === 0) {
          this.listeners.delete(event);
        }
      }
    }
    return this;
  }

  // Emit event
  async emit<K extends keyof T>(event: K, ...args: T[K]): Promise<boolean> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      return false;
    }

    const sortedListeners = [...eventListeners].sort((a, b) => b.priority - a.priority);
    const onceListeners: EventListener<T[K]>[] = [];

    for (const { listener, once } of sortedListeners) {
      try {
        await listener(...args);
        if (once) {
          onceListeners.push(listener);
        }
      } catch (error) {
        this.handleError(error, event, args);
      }
    }

    // Remove once listeners
    onceListeners.forEach(listener => this.off(event, listener as EventListenerMap<T>[K]));

    return true;
  }

  // Emit synchronously
  emitSync<K extends keyof T>(event: K, ...args: T[K]): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      return false;
    }

    const sortedListeners = [...eventListeners].sort((a, b) => b.priority - a.priority);
    const onceListeners: EventListener<T[K]>[] = [];

    for (const { listener, once } of sortedListeners) {
      try {
        listener(...args);
        if (once) {
          onceListeners.push(listener);
        }
      } catch (error) {
        this.handleError(error, event, args);
      }
    }

    // Remove once listeners
    onceListeners.forEach(listener => this.off(event, listener as EventListenerMap<T>[K]));

    return true;
  }

  // Remove all listeners for an event
  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  // Get listener count
  listenerCount<K extends keyof T>(event: K): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  // Get all events
  eventNames(): (keyof T)[] {
    return Array.from(this.listeners.keys());
  }

  // Set max listeners
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  // Get max listeners
  getMaxListeners(): number {
    return this.maxListeners;
  }

  private addListener<K extends keyof T>(
    event: K,
    listener: EventListenerMap<T>[K],
    options: ListenerOptions
  ): this {
    const listenerInfo: ListenerInfo<T[K]> = {
      listener,
      once: options.once || false,
      priority: options.priority || 0
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;
    
    if (eventListeners.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${String(event)}`);
    }

    eventListeners.push(listenerInfo);
    return this;
  }

  private handleError<K extends keyof T>(error: any, event: K, args: T[K]): void {
    if (this.listenerCount('error' as K) > 0) {
      this.emitSync('error' as K, error, event, args);
    } else {
      console.error('Unhandled event emitter error:', error);
    }
  }
}

// Example usage
interface AppEvents {
  userLogin: [userId: string, timestamp: Date];
  userLogout: [userId: string];
  dataUpdated: [tableName: string, recordId: string];
  error: [error: Error, event?: string, args?: any[]];
}

const eventEmitter = new TypedEventEmitter<AppEvents>();

// Add listeners with different priorities
eventEmitter.on('userLogin', (userId, timestamp) => {
  console.log(`High priority: User ${userId} logged in at ${timestamp}`);
}, { priority: 10 });

eventEmitter.on('userLogin', (userId) => {
  console.log(`Low priority: Logging user ${userId} activity`);
}, { priority: 1 });

// One-time listener
eventEmitter.once('userLogout', (userId) => {
  console.log(`User ${userId} logged out - this will only run once`);
});

// Error handling
eventEmitter.on('error', (error, event, args) => {
  console.error(`Error in event ${event}:`, error);
});

// Emit events
await eventEmitter.emit('userLogin', 'user123', new Date());
eventEmitter.emitSync('dataUpdated', 'users', 'user123');
```

## Form Validation Library

Build a comprehensive form validation library with TypeScript.

```typescript
// validation.ts
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

type ValidatorFn<T = any> = (value: T) => ValidationResult | Promise<ValidationResult>;

interface FieldConfig<T = any> {
  required?: boolean;
  validators?: ValidatorFn<T>[];
  transform?: (value: any) => T;
  dependencies?: string[];
}

interface FormSchema {
  [fieldName: string]: FieldConfig;
}

interface FormData {
  [fieldName: string]: any;
}

interface FormErrors {
  [fieldName: string]: string[];
}

interface FormValidationResult {
  isValid: boolean;
  errors: FormErrors;
  data: FormData;
}

// Built-in validators
export class Validators {
  static required(): ValidatorFn {
    return (value: any): ValidationResult => ({
      isValid: value != null && value !== '' && (!Array.isArray(value) || value.length > 0),
      errors: value == null || value === '' || (Array.isArray(value) && value.length === 0) 
        ? ['This field is required'] 
        : []
    });
  }

  static minLength(min: number): ValidatorFn<string> {
    return (value: string): ValidationResult => ({
      isValid: !value || value.length >= min,
      errors: value && value.length < min 
        ? [`Must be at least ${min} characters long`] 
        : []
    });
  }

  static maxLength(max: number): ValidatorFn<string> {
    return (value: string): ValidationResult => ({
      isValid: !value || value.length <= max,
      errors: value && value.length > max 
        ? [`Must be no more than ${max} characters long`] 
        : []
    });
  }

  static pattern(regex: RegExp, message?: string): ValidatorFn<string> {
    return (value: string): ValidationResult => ({
      isValid: !value || regex.test(value),
      errors: value && !regex.test(value) 
        ? [message || 'Invalid format'] 
        : []
    });
  }

  static email(): ValidatorFn<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Validators.pattern(emailRegex, 'Invalid email address');
  }

  static min(min: number): ValidatorFn<number> {
    return (value: number): ValidationResult => ({
      isValid: value == null || value >= min,
      errors: value != null && value < min 
        ? [`Must be at least ${min}`] 
        : []
    });
  }

  static max(max: number): ValidatorFn<number> {
    return (value: number): ValidationResult => ({
      isValid: value == null || value <= max,
      errors: value != null && value > max 
        ? [`Must be no more than ${max}`] 
        : []
    });
  }

  static oneOf<T>(validValues: T[]): ValidatorFn<T> {
    return (value: T): ValidationResult => ({
      isValid: validValues.includes(value),
      errors: !validValues.includes(value) 
        ? [`Must be one of: ${validValues.join(', ')}`] 
        : []
    });
  }

  static custom<T>(validator: (value: T) => boolean | string): ValidatorFn<T> {
    return (value: T): ValidationResult => {
      const result = validator(value);
      if (typeof result === 'boolean') {
        return {
          isValid: result,
          errors: result ? [] : ['Invalid value']
        };
      } else {
        return {
          isValid: false,
          errors: [result]
        };
      }
    };
  }

  static async(asyncValidator: (value: any) => Promise<boolean | string>): ValidatorFn {
    return async (value: any): Promise<ValidationResult> => {
      try {
        const result = await asyncValidator(value);
        if (typeof result === 'boolean') {
          return {
            isValid: result,
            errors: result ? [] : ['Invalid value']
          };
        } else {
          return {
            isValid: false,
            errors: [result]
          };
        }
      } catch (error) {
        return {
          isValid: false,
          errors: ['Validation error occurred']
        };
      }
    };
  }
}

export class FormValidator {
  private schema: FormSchema;

  constructor(schema: FormSchema) {
    this.schema = schema;
  }

  async validate(data: FormData): Promise<FormValidationResult> {
    const errors: FormErrors = {};
    const transformedData: FormData = {};
    let isValid = true;

    // Transform and validate each field
    for (const [fieldName, config] of Object.entries(this.schema)) {
      const fieldValue = data[fieldName];
      
      // Transform value if transformer is provided
      const transformedValue = config.transform ? config.transform(fieldValue) : fieldValue;
      transformedData[fieldName] = transformedValue;

      const fieldErrors: string[] = [];

      // Required validation
      if (config.required) {
        const requiredResult = Validators.required()(transformedValue);
        if (!requiredResult.isValid) {
          fieldErrors.push(...requiredResult.errors);
        }
      }

      // Custom validators
      if (config.validators && config.validators.length > 0) {
        for (const validator of config.validators) {
          try {
            const result = await validator(transformedValue);
            if (!result.isValid) {
              fieldErrors.push(...result.errors);
            }
          } catch (error) {
            fieldErrors.push('Validation error occurred');
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    }

    // Validate field dependencies
    for (const [fieldName, config] of Object.entries(this.schema)) {
      if (config.dependencies) {
        const dependencyErrors = this.validateDependencies(
          fieldName,
          config.dependencies,
          transformedData
        );
        if (dependencyErrors.length > 0) {
          errors[fieldName] = [...(errors[fieldName] || []), ...dependencyErrors];
          isValid = false;
        }
      }
    }

    return {
      isValid,
      errors,
      data: transformedData
    };
  }

  private validateDependencies(
    fieldName: string,
    dependencies: string[],
    data: FormData
  ): string[] {
    const errors: string[] = [];
    const fieldValue = data[fieldName];

    for (const dependency of dependencies) {
      const dependencyValue = data[dependency];
      
      // If field has a value but dependency doesn't, it's invalid
      if (fieldValue && !dependencyValue) {
        errors.push(`${fieldName} requires ${dependency} to be filled`);
      }
    }

    return errors;
  }

  validateField(fieldName: string, value: any): Promise<ValidationResult> {
    const config = this.schema[fieldName];
    if (!config) {
      return Promise.resolve({ isValid: true, errors: [] });
    }

    return this.validateSingleField(value, config);
  }

  private async validateSingleField(value: any, config: FieldConfig): Promise<ValidationResult> {
    const transformedValue = config.transform ? config.transform(value) : value;
    const errors: string[] = [];

    // Required validation
    if (config.required) {
      const requiredResult = Validators.required()(transformedValue);
      if (!requiredResult.isValid) {
        errors.push(...requiredResult.errors);
      }
    }

    // Custom validators
    if (config.validators && config.validators.length > 0) {
      for (const validator of config.validators) {
        try {
          const result = await validator(transformedValue);
          if (!result.isValid) {
            errors.push(...result.errors);
          }
        } catch (error) {
          errors.push('Validation error occurred');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Example usage
interface UserRegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  newsletter: boolean;
}

const registrationSchema: FormSchema = {
  email: {
    required: true,
    validators: [
      Validators.email(),
      Validators.async(async (email: string) => {
        // Simulate API call to check if email exists
        await new Promise(resolve => setTimeout(resolve, 100));
        return email !== 'taken@example.com' || 'Email is already taken';
      })
    ]
  },
  password: {
    required: true,
    validators: [
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers')
    ]
  },
  confirmPassword: {
    required: true,
    validators: [
      Validators.custom((value: string, data: any) => {
        return value === data.password || 'Passwords do not match';
      })
    ],
    dependencies: ['password']
  },
  age: {
    required: true,
    transform: (value: string) => parseInt(value, 10),
    validators: [
      Validators.min(18),
      Validators.max(120)
    ]
  },
  newsletter: {
    transform: (value: any) => Boolean(value)
  }
};

const validator = new FormValidator(registrationSchema);

// Validate form
const formData = {
  email: 'user@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  age: '25',
  newsletter: 'true'
};

validator.validate(formData).then(result => {
  if (result.isValid) {
    console.log('Form is valid:', result.data);
  } else {
    console.log('Form errors:', result.errors);
  }
});
```

## Simple ORM

Build a simple Object-Relational Mapping library.

```typescript
// orm.ts
interface TableSchema {
  [columnName: string]: {
    type: 'string' | 'number' | 'boolean' | 'date';
    primaryKey?: boolean;
    required?: boolean;
    unique?: boolean;
    default?: any;
    references?: {
      table: string;
      column: string;
    };
  };
}

interface QueryCondition {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: any;
}

interface JoinCondition {
  type: 'INNER' | 'LEFT' | 'RIGHT';
  table: string;
  on: {
    left: string;
    right: string;
  };
}

interface QueryOptions {
  where?: QueryCondition[];
  orderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  }[];
  limit?: number;
  offset?: number;
  joins?: JoinCondition[];
}

abstract class Database {
  abstract query(sql: string, params?: any[]): Promise<any[]>;
  abstract execute(sql: string, params?: any[]): Promise<any>;
}

// In-memory database implementation for demo
class MemoryDatabase extends Database {
  private tables = new Map<string, any[]>();

  async query(sql: string, params?: any[]): Promise<any[]> {
    // This is a simplified implementation for demo purposes
    console.log('Executing query:', sql, params);
    
    // Parse basic SELECT statements
    if (sql.startsWith('SELECT')) {
      const tableName = this.extractTableName(sql);
      return this.tables.get(tableName) || [];
    }
    
    return [];
  }

  async execute(sql: string, params?: any[]): Promise<any> {
    console.log('Executing:', sql, params);
    
    if (sql.startsWith('INSERT')) {
      const tableName = this.extractTableName(sql);
      const table = this.tables.get(tableName) || [];
      
      // Simplified insert - in real implementation would parse SQL properly
      if (params) {
        table.push(params[0]);
        this.tables.set(tableName, table);
      }
    }
    
    return { affectedRows: 1 };
  }

  private extractTableName(sql: string): string {
    // Simplified table name extraction
    const match = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    return match ? match[1] : '';
  }
}

export class Model {
  private static database: Database;
  private static tableName: string;
  private static schema: TableSchema;
  
  protected data: Record<string, any> = {};
  protected isNewRecord = true;

  constructor(data?: Record<string, any>) {
    if (data) {
      this.data = { ...data };
      this.isNewRecord = !this.getPrimaryKeyValue();
    }
  }

  static setDatabase(db: Database): void {
    this.database = db;
  }

  static setTableName(name: string): void {
    this.tableName = name;
  }

  static setSchema(schema: TableSchema): void {
    this.schema = schema;
  }

  // Static query methods
  static async find<T extends Model>(this: new() => T, id: any): Promise<T | null> {
    const primaryKey = this.getPrimaryKeyColumn();
    const results = await this.where([{
      column: primaryKey,
      operator: '=',
      value: id
    }]);
    
    return results[0] || null;
  }

  static async findAll<T extends Model>(
    this: new() => T,
    options?: QueryOptions
  ): Promise<T[]> {
    const sql = this.buildSelectQuery(options);
    const params = this.buildQueryParams(options);
    
    const results = await this.database.query(sql, params);
    return results.map(row => new this(row));
  }

  static async where<T extends Model>(
    this: new() => T,
    conditions: QueryCondition[]
  ): Promise<T[]> {
    return this.findAll({ where: conditions });
  }

  static async create<T extends Model>(
    this: new() => T,
    data: Record<string, any>
  ): Promise<T> {
    const instance = new this(data);
    await instance.save();
    return instance;
  }

  static async updateAll(
    conditions: QueryCondition[],
    updates: Record<string, any>
  ): Promise<number> {
    const sql = this.buildUpdateQuery(conditions);
    const params = [...Object.values(updates), ...this.buildQueryParams({ where: conditions })];
    
    const result = await this.database.execute(sql, params);
    return result.affectedRows;
  }

  static async deleteAll(conditions: QueryCondition[]): Promise<number> {
    const sql = this.buildDeleteQuery(conditions);
    const params = this.buildQueryParams({ where: conditions });
    
    const result = await this.database.execute(sql, params);
    return result.affectedRows;
  }

  // Instance methods
  async save(): Promise<this> {
    this.validate();
    this.setDefaults();
    
    if (this.isNewRecord) {
      await this.insert();
    } else {
      await this.update();
    }
    
    return this;
  }

  async delete(): Promise<boolean> {
    if (this.isNewRecord) {
      throw new Error('Cannot delete a new record');
    }
    
    const primaryKey = (this.constructor as typeof Model).getPrimaryKeyColumn();
    const primaryKeyValue = this.data[primaryKey];
    
    const sql = `DELETE FROM ${(this.constructor as typeof Model).tableName} WHERE ${primaryKey} = ?`;
    const result = await (this.constructor as typeof Model).database.execute(sql, [primaryKeyValue]);
    
    return result.affectedRows > 0;
  }

  async reload(): Promise<this> {
    if (this.isNewRecord) {
      throw new Error('Cannot reload a new record');
    }
    
    const primaryKeyValue = this.getPrimaryKeyValue();
    const fresh = await (this.constructor as typeof Model).find(primaryKeyValue);
    
    if (fresh) {
      this.data = { ...fresh.data };
    }
    
    return this;
  }

  // Getters and setters
  get<T>(column: string): T {
    return this.data[column];
  }

  set(column: string, value: any): this {
    this.data[column] = value;
    return this;
  }

  toJSON(): Record<string, any> {
    return { ...this.data };
  }

  // Private methods
  private async insert(): Promise<void> {
    const columns = Object.keys(this.data);
    const values = Object.values(this.data);
    const placeholders = values.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${(this.constructor as typeof Model).tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    await (this.constructor as typeof Model).database.execute(sql, values);
    this.isNewRecord = false;
  }

  private async update(): Promise<void> {
    const primaryKey = (this.constructor as typeof Model).getPrimaryKeyColumn();
    const primaryKeyValue = this.data[primaryKey];
    
    const updates = Object.entries(this.data)
      .filter(([key]) => key !== primaryKey)
      .map(([key]) => `${key} = ?`);
    
    const values = Object.entries(this.data)
      .filter(([key]) => key !== primaryKey)
      .map(([, value]) => value);
    
    values.push(primaryKeyValue);
    
    const sql = `UPDATE ${(this.constructor as typeof Model).tableName} SET ${updates.join(', ')} WHERE ${primaryKey} = ?`;
    
    await (this.constructor as typeof Model).database.execute(sql, values);
  }

  private validate(): void {
    const schema = (this.constructor as typeof Model).schema;
    
    for (const [column, config] of Object.entries(schema)) {
      const value = this.data[column];
      
      if (config.required && (value === undefined || value === null)) {
        throw new Error(`${column} is required`);
      }
      
      if (value !== undefined && value !== null) {
        this.validateType(column, value, config.type);
      }
    }
  }

  private validateType(column: string, value: any, expectedType: string): void {
    let isValid = false;
    
    switch (expectedType) {
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = typeof value === 'boolean';
        break;
      case 'date':
        isValid = value instanceof Date || !isNaN(Date.parse(value));
        break;
    }
    
    if (!isValid) {
      throw new Error(`${column} must be of type ${expectedType}`);
    }
  }

  private setDefaults(): void {
    const schema = (this.constructor as typeof Model).schema;
    
    for (const [column, config] of Object.entries(schema)) {
      if (this.data[column] === undefined && config.default !== undefined) {
        this.data[column] = typeof config.default === 'function' 
          ? config.default() 
          : config.default;
      }
    }
  }

  private getPrimaryKeyValue(): any {
    const primaryKey = (this.constructor as typeof Model).getPrimaryKeyColumn();
    return this.data[primaryKey];
  }

  // Static helper methods
  private static getPrimaryKeyColumn(): string {
    const primaryKeyEntry = Object.entries(this.schema).find(([, config]) => config.primaryKey);
    return primaryKeyEntry ? primaryKeyEntry[0] : 'id';
  }

  private static buildSelectQuery(options?: QueryOptions): string {
    let sql = `SELECT * FROM ${this.tableName}`;
    
    if (options?.joins) {
      for (const join of options.joins) {
        sql += ` ${join.type} JOIN ${join.table} ON ${join.on.left} = ${join.on.right}`;
      }
    }
    
    if (options?.where && options.where.length > 0) {
      const whereClause = options.where
        .map(condition => `${condition.column} ${condition.operator} ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    
    if (options?.orderBy && options.orderBy.length > 0) {
      const orderClause = options.orderBy
        .map(order => `${order.column} ${order.direction}`)
        .join(', ');
      sql += ` ORDER BY ${orderClause}`;
    }
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }
    
    return sql;
  }

  private static buildUpdateQuery(conditions: QueryCondition[]): string {
    const updates = Object.keys(this.schema)
      .filter(column => !this.schema[column].primaryKey)
      .map(column => `${column} = ?`);
    
    let sql = `UPDATE ${this.tableName} SET ${updates.join(', ')}`;
    
    if (conditions.length > 0) {
      const whereClause = conditions
        .map(condition => `${condition.column} ${condition.operator} ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    
    return sql;
  }

  private static buildDeleteQuery(conditions: QueryCondition[]): string {
    let sql = `DELETE FROM ${this.tableName}`;
    
    if (conditions.length > 0) {
      const whereClause = conditions
        .map(condition => `${condition.column} ${condition.operator} ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    
    return sql;
  }

  private static buildQueryParams(options?: QueryOptions): any[] {
    const params: any[] = [];
    
    if (options?.where) {
      params.push(...options.where.map(condition => condition.value));
    }
    
    return params;
  }
}

// Example usage
class User extends Model {
  static {
    this.setTableName('users');
    this.setSchema({
      id: { type: 'number', primaryKey: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true, unique: true },
      age: { type: 'number' },
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() }
    });
  }

  get name(): string {
    return this.get<string>('name');
  }

  set name(value: string) {
    this.set('name', value);
  }

  get email(): string {
    return this.get<string>('email');
  }

  set email(value: string) {
    this.set('email', value);
  }

  get age(): number {
    return this.get<number>('age');
  }

  set age(value: number) {
    this.set('age', value);
  }
}

// Setup database
const db = new MemoryDatabase();
Model.setDatabase(db);

// Usage examples
async function examples() {
  // Create a new user
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  });

  console.log('Created user:', user.toJSON());

  // Find user by ID
  const foundUser = await User.find(user.get('id'));
  console.log('Found user:', foundUser?.toJSON());

  // Find users with conditions
  const adults = await User.where([
    { column: 'age', operator: '>=', value: 18 }
  ]);

  console.log('Adult users:', adults.map(u => u.toJSON()));

  // Update user
  user.name = 'John Smith';
  user.age = 31;
  await user.save();

  console.log('Updated user:', user.toJSON());
}
```

## State Management Library

Create a Redux-like state management library with TypeScript.

```typescript
// state-manager.ts
type Listener<T> = (state: T) => void;
type Unsubscribe = () => void;

interface Action {
  type: string;
  payload?: any;
}

type Reducer<T> = (state: T, action: Action) => T;
type Middleware<T> = (store: Store<T>) => (next: Dispatch) => (action: Action) => any;
type Dispatch = (action: Action) => any;

interface Store<T> {
  getState(): T;
  dispatch(action: Action): any;
  subscribe(listener: Listener<T>): Unsubscribe;
  replaceReducer(nextReducer: Reducer<T>): void;
}

export function createStore<T>(
  reducer: Reducer<T>,
  initialState: T,
  enhancer?: (createStore: typeof createStoreInternal) => typeof createStoreInternal
): Store<T> {
  if (enhancer) {
    return enhancer(createStoreInternal)(reducer, initialState);
  }

  return createStoreInternal(reducer, initialState);
}

function createStoreInternal<T>(reducer: Reducer<T>, initialState: T): Store<T> {
  let state = initialState;
  let listeners: Listener<T>[] = [];
  let isDispatching = false;

  function getState(): T {
    if (isDispatching) {
      throw new Error('Cannot get state while dispatching');
    }
    return state;
  }

  function dispatch(action: Action): Action {
    if (isDispatching) {
      throw new Error('Cannot dispatch while dispatching');
    }

    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }

    listeners.forEach(listener => listener(state));
    return action;
  }

  function subscribe(listener: Listener<T>): Unsubscribe {
    if (isDispatching) {
      throw new Error('Cannot subscribe while dispatching');
    }

    listeners.push(listener);

    return () => {
      if (isDispatching) {
        throw new Error('Cannot unsubscribe while dispatching');
      }
      
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  function replaceReducer(nextReducer: Reducer<T>): void {
    reducer = nextReducer;
    dispatch({ type: '@@REPLACE' });
  }

  // Initialize the store
  dispatch({ type: '@@INIT' });

  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer
  };
}

// Middleware
export function applyMiddleware<T>(...middlewares: Middleware<T>[]) {
  return (createStore: typeof createStoreInternal) => 
    (reducer: Reducer<T>, initialState: T): Store<T> => {
      const store = createStore(reducer, initialState);
      let dispatch = store.dispatch;

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action: Action) => dispatch(action)
      };

      const chain = middlewares.map(middleware => middleware({
        ...store,
        dispatch: middlewareAPI.dispatch
      }));

      dispatch = chain.reduceRight((next, middleware) => middleware(next), store.dispatch);

      return {
        ...store,
        dispatch
      };
    };
}

// Built-in middleware
export const loggerMiddleware: Middleware<any> = store => next => action => {
  console.group(`Action: ${action.type}`);
  console.log('Previous state:', store.getState());
  console.log('Action:', action);
  
  const result = next(action);
  
  console.log('Next state:', store.getState());
  console.groupEnd();
  
  return result;
};

export const thunkMiddleware: Middleware<any> = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  
  return next(action);
};

// Utility functions for reducers
export function combineReducers<T>(reducers: { [K in keyof T]: Reducer<T[K]> }): Reducer<T> {
  const reducerKeys = Object.keys(reducers) as (keyof T)[];

  return (state: T, action: Action): T => {
    let hasChanged = false;
    const nextState = {} as T;

    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

// Action creators
export interface ActionCreator<P = any> {
  (payload: P): Action;
  type: string;
}

export function createAction<P = undefined>(type: string): ActionCreator<P> {
  const actionCreator = (payload: P) => ({ type, payload });
  actionCreator.type = type;
  return actionCreator;
}

// Async action creators (thunks)
export type ThunkAction<T> = (dispatch: Dispatch, getState: () => T) => any;

export function createAsyncAction<T, P = any>(
  actionCreator: (payload: P) => ThunkAction<T>
) {
  return actionCreator;
}

// Selectors
export type Selector<T, R> = (state: T) => R;

export function createSelector<T, R1, Result>(
  selector1: Selector<T, R1>,
  combiner: (res1: R1) => Result
): Selector<T, Result>;

export function createSelector<T, R1, R2, Result>(
  selector1: Selector<T, R1>,
  selector2: Selector<T, R2>,
  combiner: (res1: R1, res2: R2) => Result
): Selector<T, Result>;

export function createSelector<T, R1, R2, R3, Result>(
  selector1: Selector<T, R1>,
  selector2: Selector<T, R2>,
  selector3: Selector<T, R3>,
  combiner: (res1: R1, res2: R2, res3: R3) => Result
): Selector<T, Result>;

export function createSelector(...args: any[]): any {
  const selectors = args.slice(0, -1);
  const combiner = args[args.length - 1];
  
  let lastArgs: any[] | undefined;
  let lastResult: any;

  return (state: any) => {
    const currentArgs = selectors.map((selector: any) => selector(state));
    
    if (lastArgs && currentArgs.every((arg, index) => arg === lastArgs![index])) {
      return lastResult;
    }
    
    lastArgs = currentArgs;
    lastResult = combiner(...currentArgs);
    return lastResult;
  };
}

// Example usage
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'completed' | 'active';
  loading: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface AppState {
  todos: TodoState;
  user: {
    name: string;
    email: string;
  };
}

// Action creators
const addTodo = createAction<{ text: string }>('ADD_TODO');
const toggleTodo = createAction<{ id: string }>('TOGGLE_TODO');
const setFilter = createAction<{ filter: 'all' | 'completed' | 'active' }>('SET_FILTER');
const setLoading = createAction<{ loading: boolean }>('SET_LOADING');

// Async action creator
const fetchTodos = createAsyncAction<AppState>(() => 
  async (dispatch, getState) => {
    dispatch(setLoading({ loading: true }));
    
    try {
      // Simulate API call
      const todos = await new Promise<Todo[]>(resolve => {
        setTimeout(() => {
          resolve([
            { id: '1', text: 'Learn TypeScript', completed: false, createdAt: new Date() },
            { id: '2', text: 'Build an app', completed: true, createdAt: new Date() }
          ]);
        }, 1000);
      });
      
      // Dispatch multiple actions
      todos.forEach(todo => {
        dispatch(addTodo({ text: todo.text }));
      });
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      dispatch(setLoading({ loading: false }));
    }
  }
);

// Reducers
const todosReducer: Reducer<TodoState> = (
  state = { todos: [], filter: 'all', loading: false },
  action
) => {
  switch (action.type) {
    case addTodo.type:
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now().toString(),
            text: action.payload.text,
            completed: false,
            createdAt: new Date()
          }
        ]
      };
    
    case toggleTodo.type:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case setFilter.type:
      return {
        ...state,
        filter: action.payload.filter
      };
    
    case setLoading.type:
      return {
        ...state,
        loading: action.payload.loading
      };
    
    default:
      return state;
  }
};

const userReducer: Reducer<AppState['user']> = (
  state = { name: '', email: '' },
  action
) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Root reducer
const rootReducer = combineReducers<AppState>({
  todos: todosReducer,
  user: userReducer
});

// Selectors
const selectTodos = (state: AppState) => state.todos.todos;
const selectFilter = (state: AppState) => state.todos.filter;
const selectLoading = (state: AppState) => state.todos.loading;

const selectFilteredTodos = createSelector(
  selectTodos,
  selectFilter,
  (todos, filter) => {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'active':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
);

const selectTodoStats = createSelector(
  selectTodos,
  (todos) => ({
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length
  })
);

// Create store
const store = createStore(
  rootReducer,
  {
    todos: { todos: [], filter: 'all', loading: false },
    user: { name: 'John Doe', email: 'john@example.com' }
  },
  applyMiddleware(loggerMiddleware, thunkMiddleware)
);

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log('State updated:', state);
});

// Dispatch actions
store.dispatch(addTodo({ text: 'Learn Redux' }));
store.dispatch(addTodo({ text: 'Build something awesome' }));
store.dispatch(toggleTodo({ id: '1' }));
store.dispatch(setFilter({ filter: 'completed' }));

// Dispatch async action
store.dispatch(fetchTodos());

// Use selectors
console.log('Filtered todos:', selectFilteredTodos(store.getState()));
console.log('Todo stats:', selectTodoStats(store.getState()));
```
## File Parser Utilities

Build utilities for parsing different file formats with TypeScript.

```typescript
// file-parser.ts
interface ParseResult<T> {
  data: T;
  errors: string[];
  warnings: string[];
}

interface ParserOptions {
  skipEmptyLines?: boolean;
  trimWhitespace?: boolean;
  encoding?: 'utf8' | 'utf16le' | 'latin1';
}

abstract class FileParser<T> {
  protected options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      skipEmptyLines: true,
      trimWhitespace: true,
      encoding: 'utf8',
      ...options
    };
  }

  abstract parse(content: string): ParseResult<T>;

  async parseFile(filePath: string): Promise<ParseResult<T>> {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, { encoding: this.options.encoding });
      return this.parse(content);
    } catch (error) {
      return {
        data: [] as unknown as T,
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  protected processLine(line: string): string {
    if (this.options.trimWhitespace) {
      line = line.trim();
    }
    return line;
  }

  protected shouldSkipLine(line: string): boolean {
    return this.options.skipEmptyLines && line.trim() === '';
  }
}

// CSV Parser
interface CSVRow {
  [key: string]: string;
}

interface CSVData {
  headers: string[];
  rows: CSVRow[];
}

class CSVParser extends FileParser<CSVData> {
  private delimiter: string;
  private quote: string;
  private escape: string;

  constructor(options: ParserOptions & {
    delimiter?: string;
    quote?: string;
    escape?: string;
  } = {}) {
    super(options);
    this.delimiter = options.delimiter || ',';
    this.quote = options.quote || '"';
    this.escape = options.escape || '"';
  }

  parse(content: string): ParseResult<CSVData> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = content.split('\n').filter(line => !this.shouldSkipLine(line));

    if (lines.length === 0) {
      return {
        data: { headers: [], rows: [] },
        errors: ['Empty CSV content'],
        warnings
      };
    }

    try {
      const headers = this.parseLine(lines[0]);
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseLine(lines[i]);
          
          if (values.length !== headers.length) {
            warnings.push(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
          }

          const row: CSVRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          rows.push(row);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
      }

      return {
        data: { headers, rows },
        errors,
        warnings
      };
    } catch (error) {
      return {
        data: { headers: [], rows: [] },
        errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings
      };
    }
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === this.quote) {
        if (inQuotes && line[i + 1] === this.quote) {
          // Escaped quote
          current += this.quote;
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === this.delimiter && !inQuotes) {
        result.push(this.processLine(current));
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(this.processLine(current));
    return result;
  }
}

// JSON Parser
class JSONParser<T = any> extends FileParser<T> {
  private schema?: (obj: any) => obj is T;

  constructor(options: ParserOptions & {
    schema?: (obj: any) => obj is T;
  } = {}) {
    super(options);
    this.schema = options.schema;
  }

  parse(content: string): ParseResult<T> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = JSON.parse(content);

      if (this.schema && !this.schema(data)) {
        errors.push('Data does not match expected schema');
        return { data: {} as T, errors, warnings };
      }

      return { data, errors, warnings };
    } catch (error) {
      return {
        data: {} as T,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`],
        warnings
      };
    }
  }
}

// XML Parser (simplified)
interface XMLNode {
  tag: string;
  attributes: Record<string, string>;
  children: (XMLNode | string)[];
  text?: string;
}

class XMLParser extends FileParser<XMLNode | null> {
  parse(content: string): ParseResult<XMLNode | null> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const root = this.parseXML(content.trim());
      return { data: root, errors, warnings };
    } catch (error) {
      return {
        data: null,
        errors: [`XML Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings
      };
    }
  }

  private parseXML(xml: string): XMLNode | null {
    // Simplified XML parser - in production, use DOMParser or xml2js
    const tagRegex = /<(\/?[\w-]+)([^>]*)>/g;
    const stack: XMLNode[] = [];
    let current: XMLNode | null = null;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(xml)) !== null) {
      const [fullMatch, tagName, attributesStr] = match;
      const isClosing = tagName.startsWith('/');
      const cleanTagName = isClosing ? tagName.slice(1) : tagName;
      const isSelfClosing = attributesStr.endsWith('/');

      // Add text content before this tag
      if (match.index > lastIndex && current) {
        const textContent = xml.slice(lastIndex, match.index).trim();
        if (textContent) {
          current.children.push(textContent);
        }
      }

      if (isClosing) {
        // Closing tag
        if (stack.length > 0 && stack[stack.length - 1].tag === cleanTagName) {
          current = stack.pop() || null;
        }
      } else {
        // Opening tag
        const node: XMLNode = {
          tag: cleanTagName,
          attributes: this.parseAttributes(attributesStr),
          children: []
        };

        if (current) {
          current.children.push(node);
        }

        if (!isSelfClosing) {
          stack.push(current || node);
          current = node;
        }

        if (!current && !isSelfClosing) {
          current = node;
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    return stack.length > 0 ? stack[0] : current;
  }

  private parseAttributes(attributesStr: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }
}

// Log Parser
interface LogEntry {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata?: Record<string, any>;
}

class LogParser extends FileParser<LogEntry[]> {
  private logPattern: RegExp;

  constructor(options: ParserOptions & {
    logPattern?: RegExp;
  } = {}) {
    super(options);
    // Default pattern: [TIMESTAMP] LEVEL: MESSAGE
    this.logPattern = options.logPattern || 
      /^\[([^\]]+)\]\s+(\w+):\s+(.+)$/;
  }

  parse(content: string): ParseResult<LogEntry[]> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const entries: LogEntry[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = this.processLine(lines[i]);
      
      if (this.shouldSkipLine(line)) {
        continue;
      }

      try {
        const entry = this.parseLine(line, i + 1);
        if (entry) {
          entries.push(entry);
        }
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    return { data: entries, errors, warnings };
  }

  private parseLine(line: string, lineNumber: number): LogEntry | null {
    const match = line.match(this.logPattern);
    
    if (!match) {
      throw new Error(`Invalid log format`);
    }

    const [, timestampStr, levelStr, message] = match;
    
    const timestamp = new Date(timestampStr);
    if (isNaN(timestamp.getTime())) {
      throw new Error(`Invalid timestamp: ${timestampStr}`);
    }

    const level = levelStr.toUpperCase() as LogEntry['level'];
    if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(level)) {
      throw new Error(`Invalid log level: ${levelStr}`);
    }

    // Try to parse JSON metadata if present
    let metadata: Record<string, any> | undefined;
    const jsonMatch = message.match(/\{.*\}$/);
    if (jsonMatch) {
      try {
        metadata = JSON.parse(jsonMatch[0]);
      } catch {
        // Ignore JSON parse errors for metadata
      }
    }

    return {
      timestamp,
      level,
      message: metadata ? message.replace(/\s*\{.*\}$/, '') : message,
      metadata
    };
  }
}

// Configuration Parser
interface ConfigSection {
  [key: string]: string | ConfigSection;
}

class INIParser extends FileParser<Record<string, ConfigSection>> {
  parse(content: string): ParseResult<Record<string, ConfigSection>> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Record<string, ConfigSection> = {};
    const lines = content.split('\n');
    
    let currentSection = 'default';
    config[currentSection] = {};

    for (let i = 0; i < lines.length; i++) {
      const line = this.processLine(lines[i]);
      
      if (this.shouldSkipLine(line) || line.startsWith('#') || line.startsWith(';')) {
        continue;
      }

      try {
        if (line.startsWith('[') && line.endsWith(']')) {
          // Section header
          currentSection = line.slice(1, -1);
          config[currentSection] = {};
        } else if (line.includes('=')) {
          // Key-value pair
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          
          if (!config[currentSection]) {
            config[currentSection] = {};
          }
          
          config[currentSection][key.trim()] = value;
        } else {
          warnings.push(`Line ${i + 1}: Unrecognized format: ${line}`);
        }
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    return { data: config, errors, warnings };
  }
}

// Factory for parsers
type ParserType = 'csv' | 'json' | 'xml' | 'log' | 'ini';

class ParserFactory {
  static create<T = any>(type: ParserType, options?: any): FileParser<T> {
    switch (type) {
      case 'csv':
        return new CSVParser(options) as unknown as FileParser<T>;
      case 'json':
        return new JSONParser<T>(options);
      case 'xml':
        return new XMLParser(options) as unknown as FileParser<T>;
      case 'log':
        return new LogParser(options) as unknown as FileParser<T>;
      case 'ini':
        return new INIParser(options) as unknown as FileParser<T>;
      default:
        throw new Error(`Unsupported parser type: ${type}`);
    }
  }

  static detectType(filename: string): ParserType | null {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'log':
        return 'log';
      case 'ini':
      case 'conf':
        return 'ini';
      default:
        return null;
    }
  }
}

// Usage examples
async function parseFiles() {
  // Parse CSV
  const csvParser = new CSVParser({
    delimiter: ',',
    skipEmptyLines: true
  });
  
  const csvResult = await csvParser.parseFile('data.csv');
  console.log('CSV Data:', csvResult.data);
  console.log('CSV Errors:', csvResult.errors);

  // Parse JSON with schema validation
  interface UserData {
    id: number;
    name: string;
    email: string;
  }

  const isUserData = (obj: any): obj is UserData[] => {
    return Array.isArray(obj) && obj.every(item => 
      typeof item === 'object' && 
      typeof item.id === 'number' &&
      typeof item.name === 'string' &&
      typeof item.email === 'string'
    );
  };

  const jsonParser = new JSONParser<UserData[]>({
    schema: isUserData
  });

  const jsonResult = await jsonParser.parseFile('users.json');
  console.log('JSON Data:', jsonResult.data);

  // Parse logs
  const logParser = new LogParser({
    logPattern: /^\[([^\]]+)\]\s+(\w+):\s+(.+)$/
  });

  const logResult = await logParser.parseFile('app.log');
  console.log('Log Entries:', logResult.data.length);

  // Auto-detect and parse
  const filename = 'config.ini';
  const detectedType = ParserFactory.detectType(filename);
  
  if (detectedType) {
    const parser = ParserFactory.create(detectedType);
    const result = await parser.parseFile(filename);
    console.log(`Parsed ${detectedType} file:`, result.data);
  }
}

// Batch file processor
class BatchFileProcessor {
  private parsers: Map<string, FileParser<any>> = new Map();

  registerParser(extension: string, parser: FileParser<any>): void {
    this.parsers.set(extension.toLowerCase(), parser);
  }

  async processDirectory(directoryPath: string): Promise<Map<string, ParseResult<any>>> {
    const fs = await import('fs');
    const path = await import('path');
    const results = new Map<string, ParseResult<any>>();

    try {
      const files = fs.readdirSync(directoryPath);
      
      for (const filename of files) {
        const filePath = path.join(directoryPath, filename);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const extension = path.extname(filename).slice(1).toLowerCase();
          const parser = this.parsers.get(extension);
          
          if (parser) {
            try {
              const result = await parser.parseFile(filePath);
              results.set(filename, result);
            } catch (error) {
              results.set(filename, {
                data: null,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                warnings: []
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Directory processing error:', error);
    }

    return results;
  }
}

// Example batch processing
const processor = new BatchFileProcessor();
processor.registerParser('csv', new CSVParser());
processor.registerParser('json', new JSONParser());
processor.registerParser('log', new LogParser());

// Process all supported files in a directory
// processor.processDirectory('./data').then(results => {
//   results.forEach((result, filename) => {
//     console.log(`${filename}:`, result.errors.length === 0 ? 'Success' : 'Errors found');
//   });
// });
```

## Conclusion

These mini-projects demonstrate practical applications of TypeScript's advanced features:

1. **Task Manager CLI** - Interfaces, enums, classes, and CLI interaction
2. **Type-Safe HTTP Client** - Generics, interceptors, and error handling
3. **Generic Data Store** - Generic constraints, event systems, and CRUD operations
4. **Event Emitter System** - Advanced generics and type-safe event handling
5. **Form Validation Library** - Async validation, functional programming, and type safety
6. **Simple ORM** - Abstract classes, static methods, and database patterns
7. **State Management Library** - Complex type systems, middleware patterns, and selectors
8. **File Parser Utilities** - Abstract classes, factory patterns, and file I/O

Each project builds upon TypeScript concepts while solving real-world problems. Use these as starting points for larger applications or as learning exercises to master TypeScript's advanced features.

### Next Steps

- Extend these projects with additional features
- Add comprehensive unit tests using Jest or Vitest
- Integrate with real databases or APIs
- Build user interfaces for the CLI applications
- Deploy applications using Docker or cloud platforms
- Contribute to open-source TypeScript projects

The key to mastering TypeScript is practice with real projects that challenge you to use its type system effectively while building maintainable, scalable code.
