/* File: src/concepts/basics/index.ts */

import { variables } from './variables';
import { functions } from './functions';
import { typeAliases } from './type-aliases';
import { interfacesVsTypes } from './interfaces-vs-types';
import { enums } from './enums';
import { exercises } from './exercises';

export interface ConceptSection {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  prerequisites?: string[];
  topics: ConceptTopic[];
}

export interface ConceptTopic {
  id: string;
  title: string;
  description: string;
  codeExample: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes?: string[];
  bestPractices?: string[];
  relatedTopics?: string[];
}

export interface ConceptExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  solution: string;
  testCases: Array<{
    input: any;
    expected: any;
    description: string;
  }>;
  hints: string[];
}

export const basicsSection: ConceptSection = {
  id: 'typescript-basics',
  title: 'TypeScript Fundamentals',
  description: 'Master the core concepts of TypeScript including types, interfaces, and basic syntax',
  difficulty: 'beginner',
  estimatedTime: 120, // 2 hours
  prerequisites: ['javascript-basics'],
  topics: [
    variables,
    functions,
    typeAliases,
    interfacesVsTypes,
    enums
  ]
};

// Export all individual topics for direct access
export {
  variables,
  functions,
  typeAliases,
  interfacesVsTypes,
  enums,
  exercises
};

// Helper function to get all topics
export const getAllBasicsTopics = (): ConceptTopic[] => {
  return basicsSection.topics;
};

// Helper function to get topic by id
export const getTopicById = (topicId: string): ConceptTopic | undefined => {
  return basicsSection.topics.find(topic => topic.id === topicId);
};

// Helper function to get exercises
export const getBasicsExercises = (): ConceptExercise[] => {
  return exercises;
};

// Learning path for basics
export const basicsLearningPath = [
  {
    step: 1,
    topic: 'variables',
    title: 'Variables and Basic Types',
    description: 'Learn about TypeScript\'s type system and variable declarations',
    estimatedTime: 20
  },
  {
    step: 2,
    topic: 'functions',
    title: 'Functions and Parameters',
    description: 'Understand function typing, parameters, and return types',
    estimatedTime: 25
  },
  {
    step: 3,
    topic: 'type-aliases',
    title: 'Type Aliases',
    description: 'Create reusable type definitions with type aliases',
    estimatedTime: 15
  },
  {
    step: 4,
    topic: 'interfaces-vs-types',
    title: 'Interfaces vs Types',
    description: 'Learn the differences between interfaces and type aliases',
    estimatedTime: 30
  },
  {
    step: 5,
    topic: 'enums',
    title: 'Enumerations',
    description: 'Work with enums for defining named constants',
    estimatedTime: 20
  },
  {
    step: 6,
    topic: 'exercises',
    title: 'Practice Exercises',
    description: 'Apply your knowledge with hands-on exercises',
    estimatedTime: 30
  }
];

// Assessment questions for the basics section
export const basicsAssessment = [
  {
    id: 'basics-q1',
    question: 'What is the correct way to declare a variable with a specific type in TypeScript?',
    options: [
      'let name: string = "John";',
      'let name = string("John");',
      'let string name = "John";',
      'let name as string = "John";'
    ],
    correctAnswer: 0,
    explanation: 'In TypeScript, you use a colon (:) followed by the type name to specify the type of a variable.'
  },
  {
    id: 'basics-q2',
    question: 'Which of the following is NOT a primitive type in TypeScript?',
    options: ['string', 'number', 'boolean', 'object'],
    correctAnswer: 3,
    explanation: 'While "object" exists in TypeScript, it\'s not considered a primitive type. The primitive types are string, number, boolean, null, undefined, symbol, and bigint.'
  },
  {
    id: 'basics-q3',
    question: 'How do you define an optional parameter in a TypeScript function?',
    options: [
      'function greet(name: string, age: number?) { }',
      'function greet(name: string, age?: number) { }',
      'function greet(name: string, optional age: number) { }',
      'function greet(name: string, age: number | undefined) { }'
    ],
    correctAnswer: 1,
    explanation: 'Optional parameters are denoted by placing a question mark (?) after the parameter name and before the colon.'
  }
];

// Common TypeScript patterns in basics
export const commonPatterns = {
  typeGuards: {
    title: 'Type Guards',
    description: 'Functions that help narrow down types at runtime',
    example: `
function isString(value: any): value is string {
  return typeof value === 'string';
}

function processValue(value: string | number) {
  if (isString(value)) {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  } else {
    // TypeScript knows value is number here
    console.log(value.toFixed(2));
  }
}
    `
  },
  
  unionTypes: {
    title: 'Union Types',
    description: 'Allow a value to be one of several types',
    example: `
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

function handleStatus(status: Status) {
  switch (status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Success!';
    case 'error':
      return 'Error occurred';
  }
}
    `
  },
  
  optionalChaining: {
    title: 'Optional Chaining',
    description: 'Safely access nested properties that might not exist',
    example: `
interface User {
  name: string;
  address?: {
    street: string;
    city: string;
  };
}

function getCity(user: User): string | undefined {
  return user.address?.city;
}
    `
  }
};

// Default export
export default basicsSection;