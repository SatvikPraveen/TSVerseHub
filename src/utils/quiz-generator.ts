/* File: src/utils/quiz-generator.ts */

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concept: string;
  codeExample?: string;
  points: number;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizConfig {
  totalQuestions: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  concepts?: string[];
  includeCodeExamples?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  timeLimit?: number; // in minutes
}

interface GeneratedQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  config: QuizConfig;
  totalPoints: number;
  estimatedTime: number;
  createdAt: Date;
}

class QuizGenerator {
  private questionBank: QuizQuestion[] = [
    // TypeScript Basics Questions
    {
      id: 'basic-001',
      question: 'What is the correct way to declare a variable with a specific type in TypeScript?',
      options: [
        {
          id: 'a',
          text: 'let name: string = "John";',
          isCorrect: true,
          explanation: 'This is the correct syntax using type annotation with colon (:)'
        },
        {
          id: 'b',
          text: 'let name = string("John");',
          isCorrect: false,
          explanation: 'This is not valid TypeScript syntax'
        },
        {
          id: 'c',
          text: 'let string name = "John";',
          isCorrect: false,
          explanation: 'Type comes after the variable name in TypeScript'
        },
        {
          id: 'd',
          text: 'let name as string = "John";',
          isCorrect: false,
          explanation: 'The "as" keyword is for type assertions, not declarations'
        }
      ],
      difficulty: 'beginner',
      concept: 'Variables and Types',
      points: 5
    },
    
    {
      id: 'basic-002',
      question: 'Which of these is NOT a primitive type in TypeScript?',
      options: [
        {
          id: 'a',
          text: 'string',
          isCorrect: false,
          explanation: 'string is a primitive type'
        },
        {
          id: 'b',
          text: 'number',
          isCorrect: false,
          explanation: 'number is a primitive type'
        },
        {
          id: 'c',
          text: 'boolean',
          isCorrect: false,
          explanation: 'boolean is a primitive type'
        },
        {
          id: 'd',
          text: 'object',
          isCorrect: true,
          explanation: 'object is not considered a primitive type in TypeScript'
        }
      ],
      difficulty: 'beginner',
      concept: 'Primitive Types',
      points: 5
    },

    {
      id: 'basic-003',
      question: 'How do you define an optional parameter in a TypeScript function?',
      options: [
        {
          id: 'a',
          text: 'function greet(name: string, age: number?) { }',
          isCorrect: false,
          explanation: 'The ? should come before the colon, not after the type'
        },
        {
          id: 'b',
          text: 'function greet(name: string, age?: number) { }',
          isCorrect: true,
          explanation: 'Correct! Optional parameters use ? after the parameter name'
        },
        {
          id: 'c',
          text: 'function greet(name: string, optional age: number) { }',
          isCorrect: false,
          explanation: 'The optional keyword does not exist in TypeScript'
        },
        {
          id: 'd',
          text: 'function greet(name: string, age: number | undefined) { }',
          isCorrect: false,
          explanation: 'While this works, it\'s not the conventional way to define optional parameters'
        }
      ],
      difficulty: 'beginner',
      concept: 'Functions',
      points: 5
    },

    {
      id: 'interface-001',
      question: 'What is the main difference between interfaces and type aliases in TypeScript?',
      options: [
        {
          id: 'a',
          text: 'Interfaces are faster at runtime',
          isCorrect: false,
          explanation: 'Both are compile-time constructs and don\'t exist at runtime'
        },
        {
          id: 'b',
          text: 'Interfaces can be extended, type aliases cannot',
          isCorrect: false,
          explanation: 'Type aliases can use intersections (&) for similar functionality'
        },
        {
          id: 'c',
          text: 'Interfaces support declaration merging, type aliases do not',
          isCorrect: true,
          explanation: 'Interfaces can be reopened and merged, type aliases cannot'
        },
        {
          id: 'd',
          text: 'Type aliases are newer than interfaces',
          isCorrect: false,
          explanation: 'Both have been in TypeScript for a long time'
        }
      ],
      difficulty: 'intermediate',
      concept: 'Interfaces vs Types',
      points: 10
    },

    {
      id: 'union-001',
      question: 'What does the following type represent: string | number | boolean?',
      codeExample: 'type MixedType = string | number | boolean;',
      options: [
        {
          id: 'a',
          text: 'A type that can be string AND number AND boolean simultaneously',
          isCorrect: false,
          explanation: 'That would be an intersection type using &'
        },
        {
          id: 'b',
          text: 'A type that can be string OR number OR boolean',
          isCorrect: true,
          explanation: 'Union types use | to allow multiple possible types'
        },
        {
          id: 'c',
          text: 'A type that converts between string, number, and boolean',
          isCorrect: false,
          explanation: 'Types don\'t perform conversions'
        },
        {
          id: 'd',
          text: 'An invalid type definition',
          isCorrect: false,
          explanation: 'This is a valid union type'
        }
      ],
      difficulty: 'intermediate',
      concept: 'Union Types',
      points: 10
    },

    {
      id: 'enum-001',
      question: 'What is the value of Color.Green in this enum?',
      codeExample: `enum Color {
  Red,
  Green,
  Blue
}`,
      options: [
        {
          id: 'a',
          text: '0',
          isCorrect: false,
          explanation: 'Red would be 0'
        },
        {
          id: 'b',
          text: '1',
          isCorrect: true,
          explanation: 'Numeric enums auto-increment from 0, so Green is 1'
        },
        {
          id: 'c',
          text: '2',
          isCorrect: false,
          explanation: 'Blue would be 2'
        },
        {
          id: 'd',
          text: '"Green"',
          isCorrect: false,
          explanation: 'This is a numeric enum, not a string enum'
        }
      ],
      difficulty: 'beginner',
      concept: 'Enums',
      points: 5
    },

    {
      id: 'generic-001',
      question: 'What does the T represent in this generic function?',
      codeExample: `function identity<T>(arg: T): T {
  return arg;
}`,
      options: [
        {
          id: 'a',
          text: 'A placeholder for any specific type',
          isCorrect: true,
          explanation: 'T is a type parameter that represents any type'
        },
        {
          id: 'b',
          text: 'Always represents the string type',
          isCorrect: false,
          explanation: 'T can represent any type, not just string'
        },
        {
          id: 'c',
          text: 'A built-in TypeScript type',
          isCorrect: false,
          explanation: 'T is just a convention for type parameters'
        },
        {
          id: 'd',
          text: 'An error in the code',
          isCorrect: false,
          explanation: 'This is valid generic syntax'
        }
      ],
      difficulty: 'intermediate',
      concept: 'Generics',
      points: 10
    },

    {
      id: 'advanced-001',
      question: 'What does the keyof operator do in TypeScript?',
      codeExample: `type Person = { name: string; age: number; };
type PersonKeys = keyof Person;`,
      options: [
        {
          id: 'a',
          text: 'Creates a union of all property names of a type',
          isCorrect: true,
          explanation: 'keyof creates a union type of all property names (keys)'
        },
        {
          id: 'b',
          text: 'Gets the values of all properties',
          isCorrect: false,
          explanation: 'keyof gets property names, not values'
        },
        {
          id: 'c',
          text: 'Counts the number of properties',
          isCorrect: false,
          explanation: 'keyof returns property names as types'
        },
        {
          id: 'd',
          text: 'Removes all properties from a type',
          isCorrect: false,
          explanation: 'keyof doesn\'t remove properties'
        }
      ],
      difficulty: 'advanced',
      concept: 'Advanced Types',
      points: 15
    }
  ];

  /**
   * Generate a quiz based on the provided configuration
   */
  generateQuiz(config: QuizConfig): GeneratedQuiz {
    let availableQuestions = [...this.questionBank];

    // Filter by difficulty
    if (config.difficulty && config.difficulty !== 'mixed') {
      availableQuestions = availableQuestions.filter(q => q.difficulty === config.difficulty);
    }

    // Filter by concepts
    if (config.concepts && config.concepts.length > 0) {
      availableQuestions = availableQuestions.filter(q => 
        config.concepts!.some(concept => 
          q.concept.toLowerCase().includes(concept.toLowerCase())
        )
      );
    }

    // Filter by code examples if requested
    if (config.includeCodeExamples === false) {
      availableQuestions = availableQuestions.filter(q => !q.codeExample);
    } else if (config.includeCodeExamples === true) {
      availableQuestions = availableQuestions.filter(q => q.codeExample);
    }

    // Randomize question order if requested
    if (config.randomizeQuestions) {
      availableQuestions = this.shuffleArray(availableQuestions);
    }

    // Select the required number of questions
    const selectedQuestions = availableQuestions.slice(0, config.totalQuestions);

    // Randomize options within each question if requested
    if (config.randomizeOptions) {
      selectedQuestions.forEach(question => {
        question.options = this.shuffleArray([...question.options]);
      });
    }

    const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);
    const estimatedTime = Math.ceil(selectedQuestions.length * 1.5); // 1.5 minutes per question

    return {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateQuizTitle(config),
      questions: selectedQuestions,
      config,
      totalPoints,
      estimatedTime,
      createdAt: new Date()
    };
  }

  /**
   * Generate quiz by specific topic
   */
  generateTopicQuiz(topic: string, questionCount: number = 5): GeneratedQuiz {
    return this.generateQuiz({
      totalQuestions: questionCount,
      concepts: [topic],
      difficulty: 'mixed',
      randomizeQuestions: true,
      randomizeOptions: true
    });
  }

  /**
   * Generate a skill assessment quiz
   */
  generateSkillAssessment(): GeneratedQuiz {
    return this.generateQuiz({
      totalQuestions: 15,
      difficulty: 'mixed',
      includeCodeExamples: true,
      randomizeQuestions: true,
      randomizeOptions: true,
      timeLimit: 20
    });
  }

  /**
   * Generate a quick practice quiz
   */
  generateQuickPractice(difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): GeneratedQuiz {
    return this.generateQuiz({
      totalQuestions: 5,
      difficulty,
      randomizeQuestions: true,
      randomizeOptions: true,
      timeLimit: 10
    });
  }

  /**
   * Add a new question to the question bank
   */
  addQuestion(question: QuizQuestion): void {
    this.questionBank.push(question);
  }

  /**
   * Get all available concepts
   */
  getAvailableConcepts(): string[] {
    const concepts = new Set(this.questionBank.map(q => q.concept));
    return Array.from(concepts).sort();
  }

  /**
   * Get questions by difficulty level
   */
  getQuestionsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): QuizQuestion[] {
    return this.questionBank.filter(q => q.difficulty === difficulty);
  }

  /**
   * Validate a quiz answer
   */
  validateAnswer(questionId: string, selectedOptionId: string): {
    isCorrect: boolean;
    correctAnswerId?: string;
    explanation?: string;
    points: number;
  } {
    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    const correctOption = question.options.find(opt => opt.isCorrect);

    if (!selectedOption) {
      throw new Error('Selected option not found');
    }

    return {
      isCorrect: selectedOption.isCorrect,
      correctAnswerId: correctOption?.id,
      explanation: selectedOption.explanation || question.explanation,
      points: selectedOption.isCorrect ? question.points : 0
    };
  }

  /**
   * Calculate quiz score
   */
  calculateScore(quizId: string, answers: Array<{questionId: string, selectedOptionId: string}>): {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
    results: Array<{
      questionId: string;
      isCorrect: boolean;
      points: number;
      explanation?: string;
    }>;
  } {
    const results = answers.map(answer => {
      const validation = this.validateAnswer(answer.questionId, answer.selectedOptionId);
      return {
        questionId: answer.questionId,
        isCorrect: validation.isCorrect,
        points: validation.points,
        explanation: validation.explanation
      };
    });

    const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const maxPoints = answers.reduce((sum, answer) => {
      const question = this.questionBank.find(q => q.id === answer.questionId);
      return sum + (question?.points || 0);
    }, 0);

    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    return {
      totalPoints,
      maxPoints,
      percentage,
      correctAnswers,
      totalQuestions: answers.length,
      results
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateQuizTitle(config: QuizConfig): string {
    let title = 'TypeScript Quiz';
    
    if (config.concepts && config.concepts.length === 1) {
      title = `${config.concepts[0]} Quiz`;
    } else if (config.concepts && config.concepts.length > 1) {
      title = `${config.concepts.join(' & ')} Quiz`;
    }

    if (config.difficulty && config.difficulty !== 'mixed') {
      title += ` (${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)})`;
    }

    if (config.timeLimit) {
      title += ` - ${config.timeLimit} min`;
    }

    return title;
  }
}

// Export singleton instance
export const quizGenerator = new QuizGenerator();

// Export types
export type {
  QuizQuestion,
  QuizOption,
  QuizConfig,
  GeneratedQuiz
};

export default quizGenerator;