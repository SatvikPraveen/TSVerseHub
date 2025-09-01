// File: mini-projects/decorator-driven-di/demo.tsx

import React, { useState, useEffect } from 'react';
import { Container, container } from './Container';
import { 
  Inject, 
  Injectable, 
  LazyInject, 
  TOKENS, 
  PostConstruct, 
  AutoBind,
  callPostConstruct 
} from './Inject';

// Example services with dependency injection

interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

@Injectable(TOKENS.LOGGER)
class Logger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
}

interface IConfig {
  get(key: string): string;
  apiUrl: string;
  environment: string;
}

@Injectable(TOKENS.CONFIG)
class Config implements IConfig {
  private settings = new Map([
    ['apiUrl', 'https://api.example.com'],
    ['environment', 'development'],
    ['timeout', '5000'],
    ['retries', '3']
  ]);

  get(key: string): string {
    return this.settings.get(key) || '';
  }

  get apiUrl(): string {
    return this.get('apiUrl');
  }

  get environment(): string {
    return this.get('environment');
  }
}

interface IUserService {
  getUsers(): Promise<User[]>;
  createUser(user: Partial<User>): Promise<User>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable(TOKENS.USER_SERVICE)
class UserService implements IUserService {
  private users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  constructor(
    @Inject(TOKENS.LOGGER) private logger: ILogger,
    @Inject(TOKENS.CONFIG) private config: IConfig
  ) {}

  @PostConstruct
  initialize(): void {
    this.logger.log(`UserService initialized with config: ${this.config.environment}`);
  }

  async getUsers(): Promise<User[]> {
    this.logger.log('Fetching users');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.users];
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      name: userData.name || 'Unknown',
      email: userData.email || 'unknown@example.com'
    };
    
    this.users.push(user);
    this.logger.log(`User created: ${user.name}`);
    return user;
  }
}

@Injectable(TOKENS.AUTH_SERVICE)
class AuthService {
  constructor(
    @Inject(TOKENS.LOGGER) private logger: ILogger,
    @Inject(TOKENS.CONFIG) private config: IConfig
  ) {}

  @PostConstruct
  initialize(): void {
    this.logger.log('AuthService initialized');
  }

  @AutoBind
  async login(username: string, password: string): Promise<boolean> {
    this.logger.log(`Login attempt for: ${username}`);
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    return username === 'admin' && password === 'password';
  }

  @AutoBind
  async logout(): Promise<void> {
    this.logger.log('User logged out');
  }
}

// React component using dependency injection
interface DIComponentProps {
  container: Container;
}

const DIComponent: React.FC<DIComponentProps> = ({ container }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Resolve services from container
  const userService = container.resolve<IUserService>(TOKENS.USER_SERVICE);
  const authService = container.resolve<AuthService>(TOKENS.AUTH_SERVICE);
  const logger = container.resolve<ILogger>(TOKENS.LOGGER);

  useEffect(() => {
    // Call post-construct methods
    callPostConstruct(userService);
    callPostConstruct(authService);
    
    // Override logger to capture logs for display
    const originalLog = logger.log;
    const originalError = logger.error;
    
    logger.log = (message: string) => {
      originalLog.call(logger, message);
      setLogs(prev => [...prev.slice(-9), `[LOG] ${message}`]);
    };
    
    logger.error = (message: string) => {
      originalError.call(logger, message);
      setLogs(prev => [...prev.slice(-9), `[ERROR] ${message}`]);
    };

    loadUsers();
  }, [userService, authService, logger]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userData = await userService.getUsers();
      setUsers(userData);
    } catch (error) {
      logger.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsLoading(true);
    try {
      await userService.createUser({
        name: newUserName,
        email: newUserEmail
      });
      setNewUserName('');
      setNewUserEmail('');
      await loadUsers();
    } catch (error) {
      logger.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await authService.login(loginForm.username, loginForm.password);
      if (success) {
        setIsAuthenticated(true);
        setLoginForm({ username: '', password: '' });
      } else {
        logger.error('Invalid credentials');
      }
    } catch (error) {
      logger.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Decorator-Driven Dependency Injection Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating TypeScript decorators for dependency injection with service registration and resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username (try "admin")
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (try "password")
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-green-600 mb-4">✓ Authenticated successfully!</p>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          <form onSubmit={handleCreateUser} className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="User name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="User email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Users:</h3>
            {isLoading && users.length === 0 ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <ul className="space-y-2">
                {users.map(user => (
                  <li key={user.id} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Service Registration Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Registered Services</h2>
          <div className="space-y-2">
            {container.getServiceInfo().map((info, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">
                  {String(info.token).replace('Symbol(', '').replace(')', '')}
                </span>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded ${info.singleton ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {info.singleton ? 'Singleton' : 'Transient'}
                  </span>
                  {info.hasInstance && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Instantiated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Service Logs</h2>
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main demo component with container setup
const DependencyInjectionDemo: React.FC = () => {
  const [diContainer] = useState(() => {
    // Setup the container with services
    container.clear();
    
    // Register services
    container.registerSingletonClass(TOKENS.LOGGER, Logger);
    container.registerSingletonClass(TOKENS.CONFIG, Config);
    container.registerClass(TOKENS.USER_SERVICE, UserService);
    container.registerClass(TOKENS.AUTH_SERVICE, AuthService);
    
    return container;
  });

  return <DIComponent container={diContainer} />;
};

export default DependencyInjectionDemo;