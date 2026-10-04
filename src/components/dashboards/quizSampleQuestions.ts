/* File: src/components/dashboards/quizSampleQuestions.ts */

import type { QuizQuestion } from './QuizWidget';

// Sample quiz data for demonstration
export const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the correct way to define a TypeScript interface?',
    difficulty: 'beginner',
    concept: 'Interfaces',
    options: [
      {
        id: 'a1',
        text: 'interface User { name: string; age: number; }',
        isCorrect: true,
        explanation: 'This is the correct syntax for defining an interface in TypeScript.'
      },
      {
        id: 'a2',
        text: 'Interface User { name: string; age: number; }',
        isCorrect: false,
        explanation: 'The interface keyword should be lowercase.'
      },
      {
        id: 'a3',
        text: 'interface User = { name: string; age: number; }',
        isCorrect: false,
        explanation: 'Interfaces use curly braces directly, not with an equals sign.'
      },
      {
        id: 'a4',
        text: 'interface User ( name: string; age: number; )',
        isCorrect: false,
        explanation: 'Interfaces use curly braces, not parentheses.'
      }
    ],
    explanation: 'TypeScript interfaces define the structure of objects using the interface keyword followed by the interface name and properties in curly braces.'
  },
  {
    id: 'q2',
    question: 'Which TypeScript utility type makes all properties optional?',
    difficulty: 'intermediate',
    concept: 'Utility Types',
    options: [
      {
        id: 'b1',
        text: 'Partial<T>',
        isCorrect: true,
        explanation: 'Partial<T> makes all properties of type T optional.'
      },
      {
        id: 'b2',
        text: 'Required<T>',
        isCorrect: false,
        explanation: 'Required<T> makes all properties required, not optional.'
      },
      {
        id: 'b3',
        text: 'Pick<T, K>',
        isCorrect: false,
        explanation: 'Pick<T, K> selects specific properties from T.'
      },
      {
        id: 'b4',
        text: 'Omit<T, K>',
        isCorrect: false,
        explanation: 'Omit<T, K> excludes specific properties from T.'
      }
    ],
    codeExample: `interface User {
  name: string;
  email: string;
  age: number;
}

type PartialUser = Partial<User>;
// Result: { name?: string; email?: string; age?: number; }`,
    explanation: 'Partial<T> is a built-in utility type that constructs a type with all properties of T set to optional.'
  },
  {
    id: 'q3',
    question: 'What does the "never" type represent in TypeScript?',
    difficulty: 'advanced',
    concept: 'Advanced Types',
    options: [
      {
        id: 'c1',
        text: 'A type that represents values that never occur',
        isCorrect: true,
        explanation: 'The never type represents values that never occur, such as functions that always throw or never return.'
      },
      {
        id: 'c2',
        text: 'A type that can be any value',
        isCorrect: false,
        explanation: 'That describes the "any" type, not "never".'
      },
      {
        id: 'c3',
        text: 'A type that represents null or undefined',
        isCorrect: false,
        explanation: 'Null and undefined have their own types in TypeScript.'
      },
      {
        id: 'c4',
        text: 'A type that represents empty objects',
        isCorrect: false,
        explanation: 'Empty objects would be represented by {} or object types.'
      }
    ],
    codeExample: `function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // This function never returns
  }
}`,
    explanation: 'The never type is used for functions that never return normally (always throw or have infinite loops) and for unreachable code branches.'
  }
];
