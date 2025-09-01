// File location: src/data/concepts/advanced-types/index.ts

import { conditionalTypesContent } from './conditional-types';
import { mappedTypesContent } from './mapped-types';
import { templateLiteralsContent } from './template-literals';
import { typeGuardsContent } from './type-guards';
import { unionIntersectionContent } from './union-intersection';
import { inferKeywordContent } from './infer-keyword';
import { AdvancedTypesDemo } from './demo';
import { advancedTypesExercises } from './exercises';

export interface ConceptSection {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  content: any;
}

export interface ConceptModule {
  id: string;
  title: string;
  description: string;
  sections: ConceptSection[];
  demo?: React.ComponentType;
  exercises?: any[];
  tags: string[];
  totalEstimatedTime: number;
}

export const advancedTypesModule: ConceptModule = {
  id: 'advanced-types',
  title: 'Advanced Types',
  description: 'Master TypeScript\'s most powerful type system features including conditional types, mapped types, template literals, type guards, unions, intersections, and the infer keyword.',
  
  sections: [
    {
      id: 'conditional-types',
      title: 'Conditional Types',
      description: 'Learn to create types that select between different types based on conditions, enabling powerful type-level logic and transformations.',
      difficulty: 'intermediate',
      estimatedTime: 45,
      prerequisites: ['basic-types', 'interfaces', 'generics'],
      learningObjectives: [
        'Understand the T extends U ? X : Y syntax',
        'Create distributive conditional types',
        'Use conditional types for type narrowing',
        'Build utility types with conditional logic',
        'Handle never types in conditional contexts'
      ],
      content: conditionalTypesContent
    },
    
    {
      id: 'mapped-types', 
      title: 'Mapped Types',
      description: 'Transform object types systematically using mapped type syntax to create new types based on existing ones.',
      difficulty: 'intermediate',
      estimatedTime: 40,
      prerequisites: ['basic-types', 'interfaces', 'keyof-operator'],
      learningObjectives: [
        'Master the [P in K]: T syntax for mapped types',
        'Use modifiers (+readonly, -readonly, +?, -?) effectively',
        'Implement key remapping with the as clause',
        'Combine mapped types with template literals',
        'Create recursive mapped types for deep transformations'
      ],
      content: mappedTypesContent
    },

    {
      id: 'template-literals',
      title: 'Template Literal Types',
      description: 'Harness the power of template literal types for string manipulation and pattern matching at the type level.',
      difficulty: 'advanced',
      estimatedTime: 35,
      prerequisites: ['basic-types', 'literal-types', 'union-types'],
      learningObjectives: [
        'Use template literal syntax in type definitions',
        'Leverage intrinsic string manipulation utilities',
        'Parse and extract information from string types',
        'Build type-safe APIs with template literals',
        'Combine template literals with conditional types'
      ],
      content: templateLiteralsContent
    },

    {
      id: 'type-guards',
      title: 'Type Guards',
      description: 'Implement runtime type checking that integrates with TypeScript\'s type system for safe type narrowing.',
      difficulty: 'intermediate',
      estimatedTime: 50,
      prerequisites: ['union-types', 'discriminated-unions', 'typeof-instanceof'],
      learningObjectives: [
        'Create user-defined type guard functions',
        'Use built-in type guards effectively',
        'Implement assertion functions for type checking',
        'Work with discriminated unions and type guards',
        'Build composable type guard systems'
      ],
      content: typeGuardsContent
    },

    {
      id: 'union-intersection',
      title: 'Union and Intersection Types',
      description: 'Master the combination and separation of types using union (|) and intersection (&) operators for flexible type compositions.',
      difficulty: 'intermediate',
      estimatedTime: 45,
      prerequisites: ['basic-types', 'interfaces', 'type-narrowing'],
      learningObjectives: [
        'Understand union type distribution in conditional types',
        'Create and work with discriminated unions',
        'Use intersection types for type composition',
        'Handle branded types and nominal typing',
        'Implement advanced union manipulation utilities'
      ],
      content: unionIntersectionContent
    },

    {
      id: 'infer-keyword',
      title: 'The infer Keyword',
      description: 'Unlock advanced type-level programming with the infer keyword for extracting and manipulating types within conditional types.',
      difficulty: 'advanced',
      estimatedTime: 55,
      prerequisites: ['conditional-types', 'generics', 'utility-types'],
      learningObjectives: [
        'Understand how infer works in conditional types',
        'Extract function return types and parameters',
        'Parse complex type structures recursively',
        'Build sophisticated utility types with infer',
        'Handle multiple infer variables and constraints'
      ],
      content: inferKeywordContent
    }
  ],

  demo: AdvancedTypesDemo,
  exercises: advancedTypesExercises,
  
  tags: [
    'conditional-types',
    'mapped-types', 
    'template-literals',
    'type-guards',
    'union-types',
    'intersection-types',
    'infer-keyword',
    'utility-types',
    'type-level-programming',
    'advanced-patterns'
  ],

  totalEstimatedTime: 270 // Sum of all section times
};

// Re-export all content for easy access
export {
  conditionalTypesContent,
  mappedTypesContent,
  templateLiteralsContent,
  typeGuardsContent,
  unionIntersectionContent,
  inferKeywordContent,
  AdvancedTypesDemo,
  advancedTypesExercises
};

// Helper functions for working with the module
export const getSection = (sectionId: string): ConceptSection | undefined => {
  return advancedTypesModule.sections.find(section => section.id === sectionId);
};

export const getSectionsByDifficulty = (difficulty: ConceptSection['difficulty']): ConceptSection[] => {
  return advancedTypesModule.sections.filter(section => section.difficulty === difficulty);
};

export const getPrerequisites = (): string[] => {
  const allPrereqs = advancedTypesModule.sections.flatMap(section => section.prerequisites);
  return [...new Set(allPrereqs)];
};

export const getLearningObjectives = (): string[] => {
  return advancedTypesModule.sections.flatMap(section => section.learningObjectives);
};

export const getModuleProgress = (completedSections: string[]): {
  completed: number;
  total: number;
  percentage: number;
  nextSection?: ConceptSection;
} => {
  const total = advancedTypesModule.sections.length;
  const completed = completedSections.length;
  const percentage = Math.round((completed / total) * 100);
  
  const nextSection = advancedTypesModule.sections.find(
    section => !completedSections.includes(section.id)
  );

  return {
    completed,
    total,
    percentage,
    nextSection
  };
};

export const getEstimatedTimeRemaining = (completedSections: string[]): number => {
  const remainingSections = advancedTypesModule.sections.filter(
    section => !completedSections.includes(section.id)
  );
  return remainingSections.reduce((total, section) => total + section.estimatedTime, 0);
};

export default advancedTypesModule;