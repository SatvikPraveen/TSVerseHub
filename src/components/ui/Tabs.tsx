/* File: src/components/ui/Tabs.tsx */

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// Tab Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline' | 'cards';
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

// Main Tabs Component
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  keepMounted?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  keepMounted = false,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : internalValue;

  const setActiveTab = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue: TabsContextValue = {
    activeTab,
    setActiveTab,
    orientation,
    variant,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={`
          ${orientation === 'vertical' ? 'flex gap-6' : ''}
          ${className}
        `}
        data-size={size}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tab List Component
interface TabListProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const TabList: React.FC<TabListProps> = ({
  children,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const { orientation, variant } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const baseClasses = 'flex';
  const orientationClasses = orientation === 'vertical' 
    ? 'flex-col space-y-1 min-w-[200px]' 
    : 'space-x-1';

  const variantClasses = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'p-1 bg-gray-100 dark:bg-gray-800 rounded-lg',
    underline: 'border-b border-gray-200 dark:border-gray-700',
    cards: 'border-b border-gray-200 dark:border-gray-700',
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const tabs = listRef.current?.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
    if (!tabs || tabs.length === 0) return;

    const currentIndex = Array.from(tabs).findIndex(tab => tab.getAttribute('data-state') === 'active');
    let nextIndex = currentIndex;

    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    switch (event.key) {
      case prevKey:
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case nextKey:
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      nextTab.click();
      nextTab.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={`
        ${baseClasses}
        ${orientationClasses}
        ${variant !== 'pills' ? variantClasses[variant] : ''}
        ${className}
      `}
    >
      {variant === 'pills' && (
        <div className={`${variantClasses.pills} ${baseClasses} ${orientationClasses}`}>
          {children}
        </div>
      )}
      {variant !== 'pills' && children}
    </div>
  );
};

// Individual Tab Component
interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  disabled = false,
  className = '',
  icon,
}) => {
  const { activeTab, setActiveTab, variant, orientation } = useTabsContext();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const baseClasses = `
    relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantClasses = {
    default: `
      border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600
      ${isActive 
        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
      }
    `,
    pills: `
      rounded-md
      ${isActive 
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-900/50'
      }
    `,
    underline: `
      border-b-2 border-transparent
      ${isActive 
        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `,
    cards: `
      border border-gray-200 dark:border-gray-700 rounded-t-lg -mb-px
      ${isActive 
        ? 'bg-white dark:bg-gray-900 border-b-white dark:border-b-gray-900 text-gray-900 dark:text-white' 
        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    `,
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// Tab Panels Container
interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export const TabPanels: React.FC<TabPanelsProps> = ({
  children,
  className = '',
}) => {
  const { orientation } = useTabsContext();

  return (
    <div 
      className={`
        ${orientation === 'vertical' ? 'flex-1' : 'mt-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Individual Tab Panel
interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = '',
  forceMount = false,
}) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg
        ${!isActive ? 'hidden' : ''}
        ${isActive ? 'animate-fade-in' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Compound Component with sub-components
const CompoundTabs = Object.assign(Tabs, {
  List: TabList,
  Tab: Tab,
  Panels: TabPanels,
  Panel: TabPanel,
});

export default CompoundTabs;

// Example Usage Component
export const TabsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('typescript-basics');

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">TypeScript Learning Tabs</h2>
      
      {/* Basic Tabs */}
      <Tabs defaultValue="basics" className="mb-8">
        <TabList aria-label="TypeScript concepts">
          <Tab value="basics">Basics</Tab>
          <Tab value="advanced">Advanced Types</Tab>
          <Tab value="generics">Generics</Tab>
          <Tab value="decorators" disabled>Decorators (Coming Soon)</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="basics">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">TypeScript Basics</h3>
              <p>Learn about variables, types, interfaces, and more fundamental concepts.</p>
            </div>
          </TabPanel>
          <TabPanel value="advanced">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Advanced Types</h3>
              <p>Dive into union types, intersection types, mapped types, and conditional types.</p>
            </div>
          </TabPanel>
          <TabPanel value="generics">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Generics</h3>
              <p>Master generic types, constraints, and advanced generic patterns.</p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Pills Variant */}
      <Tabs variant="pills" defaultValue="code" className="mb-8">
        <TabList aria-label="Code examples">
          <Tab value="code" icon={<span>💻</span>}>Code</Tab>
          <Tab value="output" icon={<span>📤</span>}>Output</Tab>
          <Tab value="tests" icon={<span>🧪</span>}>Tests</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="code">
            <pre className="bg-gray-900 text-white p-4 rounded-lg">
              <code>{`interface User {\n  name: string;\n  age: number;\n}`}</code>
            </pre>
          </TabPanel>
          <TabPanel value="output">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200">✓ Compilation successful</p>
            </div>
          </TabPanel>
          <TabPanel value="tests">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">Running tests...</p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Vertical Tabs */}
      <Tabs orientation="vertical" variant="underline" defaultValue="variables">
        <TabList aria-label="TypeScript topics">
          <Tab value="variables">Variables & Types</Tab>
          <Tab value="functions">Functions</Tab>
          <Tab value="classes">Classes</Tab>
          <Tab value="interfaces">Interfaces</Tab>
          <Tab value="modules">Modules</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="variables">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Variables & Types</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Learn about TypeScript's type system and variable declarations.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <code>let message: string = "Hello, TypeScript!";</code>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="functions">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Functions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore function types, optional parameters, and overloads.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <code>function greet(name: string): string {"{"} return `Hello, ${name}!`; {"}"}</code>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="classes">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Classes</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Understand TypeScript classes, inheritance, and access modifiers.
              </p>
            </div>
          </TabPanel>
          <TabPanel value="interfaces">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Interfaces</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Define contracts with interfaces and type aliases.
              </p>
            </div>
          </TabPanel>
          <TabPanel value="modules">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Modules</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Organize your code with modules and namespaces.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};