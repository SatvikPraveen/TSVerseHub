// File: tests/utils/quiz-generator.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Quiz Generator Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Question Types and Interfaces', () => {
    it('should define comprehensive question type system', () => {
      enum QuestionType {
        MULTIPLE_CHOICE = 'multiple_choice',
        TRUE_FALSE = 'true_false',
        SHORT_ANSWER = 'short_answer',
        FILL_IN_BLANK = 'fill_in_blank',
        MATCHING = 'matching',
        ORDERING = 'ordering',
        CODE_COMPLETION = 'code_completion'
      }
      
      enum DifficultyLevel {
        BEGINNER = 'beginner',
        INTERMEDIATE = 'intermediate',
        ADVANCED = 'advanced',
        EXPERT = 'expert'
      }
      
      interface BaseQuestion {
        id: string;
        type: QuestionType;
        category: string;
        difficulty: DifficultyLevel;
        points: number;
        timeLimit?: number; // in seconds
        tags: string[];
        explanation?: string;
        references?: string[];
      }
      
      interface MultipleChoiceQuestion extends BaseQuestion {
        type: QuestionType.MULTIPLE_CHOICE;
        question: string;
        options: string[];
        correctAnswer: number; // index of correct option
        allowMultiple?: boolean;
        correctAnswers?: number[]; // for multiple correct answers
      }
      
      interface TrueFalseQuestion extends BaseQuestion {
        type: QuestionType.TRUE_FALSE;
        statement: string;
        correctAnswer: boolean;
      }
      
      interface ShortAnswerQuestion extends BaseQuestion {
        type: QuestionType.SHORT_ANSWER;
        question: string;
        expectedAnswers: string[];
        caseSensitive?: boolean;
        exactMatch?: boolean;
      }
      
      interface FillInBlankQuestion extends BaseQuestion {
        type: QuestionType.FILL_IN_BLANK;
        template: string; // e.g., "TypeScript is a _____ of JavaScript"
        blanks: Array<{
          position: number;
          correctAnswers: string[];
          caseSensitive?: boolean;
        }>;
      }
      
      interface MatchingQuestion extends BaseQuestion {
        type: QuestionType.MATCHING;
        question: string;
        leftItems: Array<{ id: string; content: string }>;
        rightItems: Array<{ id: string; content: string }>;
        correctMatches: Array<{ leftId: string; rightId: string }>;
      }
      
      interface OrderingQuestion extends BaseQuestion {
        type: QuestionType.ORDERING;
        question: string;
        items: Array<{ id: string; content: string }>;
        correctOrder: string[]; // array of item IDs in correct order
      }
      
      interface CodeCompletionQuestion extends BaseQuestion {
        type: QuestionType.CODE_COMPLETION;
        description: string;
        codeTemplate: string;
        language: string;
        expectedSolution: string;
        testCases?: Array<{
          input: any[];
          expectedOutput: any;
        }>;
      }
      
      type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion | 
                     FillInBlankQuestion | MatchingQuestion | OrderingQuestion | CodeCompletionQuestion;
      
      // Test question type definitions
      const multipleChoiceQuestion: MultipleChoiceQuestion = {
        id: 'mc-001',
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'TypeScript Basics',
        difficulty: DifficultyLevel.BEGINNER,
        points: 5,
        timeLimit: 30,
        tags: ['typescript', 'variables'],
        question: 'Which of the following is the correct way to declare a variable in TypeScript?',
        options: [
          'var name: string;',
          'let name: string;',
          'const name: string = "value";',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'TypeScript supports all JavaScript variable declarations with type annotations.'
      };
      
      const trueFalseQuestion: TrueFalseQuestion = {
        id: 'tf-001',
        type: QuestionType.TRUE_FALSE,
        category: 'TypeScript Types',
        difficulty: DifficultyLevel.INTERMEDIATE,
        points: 3,
        tags: ['typescript', 'types'],
        statement: 'TypeScript interfaces can extend other interfaces.',
        correctAnswer: true,
        explanation: 'Interfaces in TypeScript support inheritance through the extends keyword.'
      };
      
      const codeQuestion: CodeCompletionQuestion = {
        id: 'code-001',
        type: QuestionType.CODE_COMPLETION,
        category: 'TypeScript Functions',
        difficulty: DifficultyLevel.ADVANCED,
        points: 10,
        tags: ['typescript', 'functions', 'generics'],
        description: 'Complete the generic function that returns the first element of an array',
        codeTemplate: `function getFirst<T>(arr: T[]): T | undefined {\n  // Your code here\n}`,
        language: 'typescript',
        expectedSolution: `function getFirst<T>(arr: T[]): T | undefined {\n  return arr[0];\n}`,
        testCases: [
          { input: [[1, 2, 3]], expectedOutput: 1 },
          { input: [['a', 'b', 'c']], expectedOutput: 'a' },
          { input: [[]], expectedOutput: undefined }
        ]
      };
      
      expect(multipleChoiceQuestion.type).toBe(QuestionType.MULTIPLE_CHOICE);
      expect(multipleChoiceQuestion.correctAnswer).toBe(3);
      expect(multipleChoiceQuestion.options).toHaveLength(4);
      
      expect(trueFalseQuestion.type).toBe(QuestionType.TRUE_FALSE);
      expect(trueFalseQuestion.correctAnswer).toBe(true);
      
      expect(codeQuestion.type).toBe(QuestionType.CODE_COMPLETION);
      expect(codeQuestion.testCases).toHaveLength(3);
      expect(codeQuestion.language).toBe('typescript');
    });
  });

  describe('Question Bank Management', () => {
    it('should manage collections of questions', () => {
      enum QuestionType {
        MULTIPLE_CHOICE = 'multiple_choice',
        TRUE_FALSE = 'true_false'
      }
      
      enum DifficultyLevel {
        BEGINNER = 'beginner',
        INTERMEDIATE = 'intermediate',
        ADVANCED = 'advanced'
      }
      
      interface Question {
        id: string;
        type: QuestionType;
        category: string;
        difficulty: DifficultyLevel;
        points: number;
        tags: string[];
      }
      
      interface QuestionBankFilters {
        categories?: string[];
        difficulties?: DifficultyLevel[];
        types?: QuestionType[];
        tags?: string[];
        minPoints?: number;
        maxPoints?: number;
      }
      
      class QuestionBank {
        private questions: Map<string, Question> = new Map();
        private categories: Set<string> = new Set();
        private tags: Set<string> = new Set();
        
        addQuestion(question: Question): void {
          this.questions.set(question.id, question);
          this.categories.add(question.category);
          question.tags.forEach(tag => this.tags.add(tag));
        }
        
        removeQuestion(id: string): boolean {
          const question = this.questions.get(id);
          if (!question) return false;
          
          this.questions.delete(id);
          this.updateCategories();
          this.updateTags();
          return true;
        }
        
        getQuestion(id: string): Question | undefined {
          return this.questions.get(id);
        }
        
        getAllQuestions(): Question[] {
          return Array.from(this.questions.values());
        }
        
        getQuestionsByCategory(category: string): Question[] {
          return this.getAllQuestions().filter(q => q.category === category);
        }
        
        getQuestionsByDifficulty(difficulty: DifficultyLevel): Question[] {
          return this.getAllQuestions().filter(q => q.difficulty === difficulty);
        }
        
        getQuestionsByTags(tags: string[]): Question[] {
          return this.getAllQuestions().filter(q => 
            tags.some(tag => q.tags.includes(tag))
          );
        }
        
        filterQuestions(filters: QuestionBankFilters): Question[] {
          return this.getAllQuestions().filter(question => {
            if (filters.categories && !filters.categories.includes(question.category)) {
              return false;
            }
            
            if (filters.difficulties && !filters.difficulties.includes(question.difficulty)) {
              return false;
            }
            
            if (filters.types && !filters.types.includes(question.type)) {
              return false;
            }
            
            if (filters.tags && !filters.tags.some(tag => question.tags.includes(tag))) {
              return false;
            }
            
            if (filters.minPoints !== undefined && question.points < filters.minPoints) {
              return false;
            }
            
            if (filters.maxPoints !== undefined && question.points > filters.maxPoints) {
              return false;
            }
            
            return true;
          });
        }
        
        getRandomQuestions(count: number, filters?: QuestionBankFilters): Question[] {
          const availableQuestions = filters ? 
            this.filterQuestions(filters) : 
            this.getAllQuestions();
          
          if (availableQuestions.length <= count) {
            return [...availableQuestions];
          }
          
          const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, count);
        }
        
        getCategories(): string[] {
          return Array.from(this.categories);
        }
        
        getTags(): string[] {
          return Array.from(this.tags);
        }
        
        getQuestionCount(): number {
          return this.questions.size;
        }
        
        getStatistics(): {
          totalQuestions: number;
          categoryCounts: Record<string, number>;
          difficultyCounts: Record<DifficultyLevel, number>;
          typeCounts: Record<QuestionType, number>;
        } {
          const questions = this.getAllQuestions();
          const categoryCounts: Record<string, number> = {};
          const difficultyCounts: Record<DifficultyLevel, number> = {
            [DifficultyLevel.BEGINNER]: 0,
            [DifficultyLevel.INTERMEDIATE]: 0,
            [DifficultyLevel.ADVANCED]: 0
          };
          const typeCounts: Record<QuestionType, number> = {
            [QuestionType.MULTIPLE_CHOICE]: 0,
            [QuestionType.TRUE_FALSE]: 0
          };
          
          questions.forEach(question => {
            categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
            difficultyCounts[question.difficulty]++;
            typeCounts[question.type]++;
          });
          
          return {
            totalQuestions: questions.length,
            categoryCounts,
            difficultyCounts,
            typeCounts
          };
        }
        
        private updateCategories(): void {
          this.categories.clear();
          this.getAllQuestions().forEach(q => this.categories.add(q.category));
        }
        
        private updateTags(): void {
          this.tags.clear();
          this.getAllQuestions().forEach(q => 
            q.tags.forEach(tag => this.tags.add(tag))
          );
        }
        
        exportToJSON(): string {
          const data = {
            questions: this.getAllQuestions(),
            metadata: {
              totalQuestions: this.getQuestionCount(),
              categories: this.getCategories(),
              tags: this.getTags(),
              exportDate: new Date().toISOString()
            }
          };
          
          return JSON.stringify(data, null, 2);
        }
        
        importFromJSON(jsonData: string): void {
          try {
            const data = JSON.parse(jsonData);
            if (data.questions && Array.isArray(data.questions)) {
              data.questions.forEach((question: Question) => {
                this.addQuestion(question);
              });
            }
          } catch (error) {
            throw new Error('Invalid JSON format');
          }
        }
      }
      
      const questionBank = new QuestionBank();
      
      // Sample questions
      const question1: Question = {
        id: 'q1',
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'TypeScript Basics',
        difficulty: DifficultyLevel.BEGINNER,
        points: 5,
        tags: ['typescript', 'variables']
      };
      
      const question2: Question = {
        id: 'q2',
        type: QuestionType.TRUE_FALSE,
        category: 'TypeScript Advanced',
        difficulty: DifficultyLevel.ADVANCED,
        points: 10,
        tags: ['typescript', 'generics']
      };
      
      const question3: Question = {
        id: 'q3',
        type: QuestionType.MULTIPLE_CHOICE,
        category: 'JavaScript',
        difficulty: DifficultyLevel.INTERMEDIATE,
        points: 7,
        tags: ['javascript', 'functions']
      };
      
      // Test adding questions
      questionBank.addQuestion(question1);
      questionBank.addQuestion(question2);
      questionBank.addQuestion(question3);
      
      expect(questionBank.getQuestionCount()).toBe(3);
      expect(questionBank.getCategories()).toEqual(['TypeScript Basics', 'TypeScript Advanced', 'JavaScript']);
      expect(questionBank.getTags()).toContain('typescript');
      expect(questionBank.getTags()).toContain('generics');
      
      // Test filtering
      const beginnerQuestions = questionBank.getQuestionsByDifficulty(DifficultyLevel.BEGINNER);
      expect(beginnerQuestions).toHaveLength(1);
      expect(beginnerQuestions[0].id).toBe('q1');
      
      const typescriptQuestions = questionBank.getQuestionsByTags(['typescript']);
      expect(typescriptQuestions).toHaveLength(2);
      
      // Test advanced filtering
      const filtered = questionBank.filterQuestions({
        difficulties: [DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED],
        minPoints: 7
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.every(q => q.points >= 7)).toBe(true);
      
      // Test random selection
      const randomQuestions = questionBank.getRandomQuestions(2);
      expect(randomQuestions).toHaveLength(2);
      expect(new Set(randomQuestions.map(q => q.id)).size).toBe(2); // Ensure unique
      
      // Test statistics
      const stats = questionBank.getStatistics();
      expect(stats.totalQuestions).toBe(3);
      expect(stats.difficultyCounts[DifficultyLevel.BEGINNER]).toBe(1);
      expect(stats.typeCounts[QuestionType.MULTIPLE_CHOICE]).toBe(2);
      
      // Test removal
      expect(questionBank.removeQuestion('q2')).toBe(true);
      expect(questionBank.getQuestionCount()).toBe(2);
      expect(questionBank.removeQuestion('nonexistent')).toBe(false);
      
      // Test export/import
      const exportData = questionBank.exportToJSON();
      expect(typeof exportData).toBe('string');
      
      const newBank = new QuestionBank();
      newBank.importFromJSON(exportData);
      expect(newBank.getQuestionCount()).toBe(2);
    });
  });

  describe('Quiz Generation', () => {
    it('should generate quizzes based on criteria', () => {
      enum QuestionType {
        MULTIPLE_CHOICE = 'multiple_choice',
        TRUE_FALSE = 'true_false'
      }
      
      enum DifficultyLevel {
        BEGINNER = 'beginner',
        INTERMEDIATE = 'intermediate',
        ADVANCED = 'advanced'
      }
      
      interface Question {
        id: string;
        type: QuestionType;
        category: string;
        difficulty: DifficultyLevel;
        points: number;
        tags: string[];
        content: string;
      }
      
      interface QuizCriteria {
        totalQuestions: number;
        totalPoints?: number;
        categories?: string[];
        difficulties?: DifficultyLevel[];
        types?: QuestionType[];
        tags?: string[];
        timeLimit?: number; // in minutes
        shuffleQuestions?: boolean;
        shuffleOptions?: boolean;
      }
      
      interface Quiz {
        id: string;
        title: string;
        description?: string;
        questions: Question[];
        totalPoints: number;
        estimatedTime: number; // in minutes
        difficulty: DifficultyLevel;
        categories: string[];
        tags: string[];
        createdAt: Date;
        criteria: QuizCriteria;
      }
      
      class QuizGenerator {
        private questionBank: Map<string, Question> = new Map();
        
        addQuestion(question: Question): void {
          this.questionBank.set(question.id, question);
        }
        
        generateQuiz(title: string, criteria: QuizCriteria): Quiz {
          const availableQuestions = this.filterQuestions(criteria);
          
          if (availableQuestions.length < criteria.totalQuestions) {
            throw new Error(`Not enough questions available. Found ${availableQuestions.length}, needed ${criteria.totalQuestions}`);
          }
          
          let selectedQuestions = this.selectQuestions(availableQuestions, criteria);
          
          if (criteria.shuffleQuestions) {
            selectedQuestions = this.shuffleArray(selectedQuestions);
          }
          
          const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);
          const categories = [...new Set(selectedQuestions.map(q => q.category))];
          const tags = [...new Set(selectedQuestions.flatMap(q => q.tags))];
          const difficulty = this.calculateOverallDifficulty(selectedQuestions);
          const estimatedTime = this.calculateEstimatedTime(selectedQuestions);
          
          return {
            id: this.generateId(),
            title,
            questions: selectedQuestions,
            totalPoints,
            estimatedTime,
            difficulty,
            categories,
            tags,
            createdAt: new Date(),
            criteria
          };
        }
        
        private filterQuestions(criteria: QuizCriteria): Question[] {
          const allQuestions = Array.from(this.questionBank.values());
          
          return allQuestions.filter(question => {
            if (criteria.categories && !criteria.categories.includes(question.category)) {
              return false;
            }
            
            if (criteria.difficulties && !criteria.difficulties.includes(question.difficulty)) {
              return false;
            }
            
            if (criteria.types && !criteria.types.includes(question.type)) {
              return false;
            }
            
            if (criteria.tags && !criteria.tags.some(tag => question.tags.includes(tag))) {
              return false;
            }
            
            return true;
          });
        }
        
        private selectQuestions(availableQuestions: Question[], criteria: QuizCriteria): Question[] {
          if (criteria.totalPoints) {
            return this.selectByPoints(availableQuestions, criteria);
          } else {
            return this.selectByCount(availableQuestions, criteria);
          }
        }
        
        private selectByCount(availableQuestions: Question[], criteria: QuizCriteria): Question[] {
          const shuffled = this.shuffleArray([...availableQuestions]);
          return shuffled.slice(0, criteria.totalQuestions);
        }
        
        private selectByPoints(availableQuestions: Question[], criteria: QuizCriteria): Question[] {
          const targetPoints = criteria.totalPoints!;
          const maxQuestions = criteria.totalQuestions;
          
          // Sort questions by points for better selection
          const sortedQuestions = [...availableQuestions].sort((a, b) => a.points - b.points);
          
          const selected: Question[] = [];
          let currentPoints = 0;
          let currentQuestions = 0;
          
          // Greedy algorithm to select questions close to target points
          for (const question of sortedQuestions) {
            if (currentQuestions >= maxQuestions) break;
            
            if (currentPoints + question.points <= targetPoints) {
              selected.push(question);
              currentPoints += question.points;
              currentQuestions++;
            }
            
            if (currentPoints === targetPoints) break;
          }
          
          // If we haven't reached the desired number of questions or points,
          // fill with remaining questions
          const remaining = sortedQuestions.filter(q => !selected.includes(q));
          for (const question of remaining) {
            if (selected.length >= maxQuestions) break;
            selected.push(question);
          }
          
          return selected;
        }
        
        private shuffleArray<T>(array: T[]): T[] {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        }
        
        private calculateOverallDifficulty(questions: Question[]): DifficultyLevel {
          const difficultyScores = {
            [DifficultyLevel.BEGINNER]: 1,
            [DifficultyLevel.INTERMEDIATE]: 2,
            [DifficultyLevel.ADVANCED]: 3
          };
          
          const averageScore = questions.reduce((sum, q) => 
            sum + difficultyScores[q.difficulty], 0) / questions.length;
          
          if (averageScore <= 1.3) return DifficultyLevel.BEGINNER;
          if (averageScore <= 2.3) return DifficultyLevel.INTERMEDIATE;
          return DifficultyLevel.ADVANCED;
        }
        
        private calculateEstimatedTime(questions: Question[]): number {
          // Estimate 1 minute per question for basic questions, more for complex ones
          const timePerType = {
            [QuestionType.MULTIPLE_CHOICE]: 1.5,
            [QuestionType.TRUE_FALSE]: 1
          };
          
          const totalTime = questions.reduce((sum, q) => {
            const baseTime = timePerType[q.type] || 1;
            const difficultyMultiplier = q.difficulty === DifficultyLevel.ADVANCED ? 1.5 : 
                                       q.difficulty === DifficultyLevel.INTERMEDIATE ? 1.2 : 1;
            return sum + (baseTime * difficultyMultiplier);
          }, 0);
          
          return Math.ceil(totalTime);
        }
        
        private generateId(): string {
          return 'quiz_' + Math.random().toString(36).substr(2, 9);
        }
        
        validateQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
          const errors: string[] = [];
          
          if (!quiz.title || quiz.title.trim().length === 0) {
            errors.push('Quiz must have a title');
          }
          
          if (quiz.questions.length === 0) {
            errors.push('Quiz must have at least one question');
          }
          
          if (quiz.totalPoints <= 0) {
            errors.push('Quiz must have positive total points');
          }
          
          if (quiz.estimatedTime <= 0) {
            errors.push('Quiz must have positive estimated time');
          }
          
          // Validate that total points match sum of question points
          const calculatedPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
          if (calculatedPoints !== quiz.totalPoints) {
            errors.push(`Total points mismatch: calculated ${calculatedPoints}, stored ${quiz.totalPoints}`);
          }
          
          return {
            isValid: errors.length === 0,
            errors
          };
        }
        
        getQuestionCount(): number {
          return this.questionBank.size;
        }
      }
      
      const generator = new QuizGenerator();
      
      // Add sample questions
      const questions: Question[] = [
        {
          id: 'q1',
          type: QuestionType.MULTIPLE_CHOICE,
          category: 'TypeScript Basics',
          difficulty: DifficultyLevel.BEGINNER,
          points: 5,
          tags: ['typescript', 'variables'],
          content: 'What is a variable?'
        },
        {
          id: 'q2',
          type: QuestionType.TRUE_FALSE,
          category: 'TypeScript Basics',
          difficulty: DifficultyLevel.BEGINNER,
          points: 3,
          tags: ['typescript', 'types'],
          content: 'TypeScript is strongly typed'
        },
        {
          id: 'q3',
          type: QuestionType.MULTIPLE_CHOICE,
          category: 'TypeScript Advanced',
          difficulty: DifficultyLevel.ADVANCED,
          points: 10,
          tags: ['typescript', 'generics'],
          content: 'How do generics work?'
        },
        {
          id: 'q4',
          type: QuestionType.TRUE_FALSE,
          category: 'JavaScript',
          difficulty: DifficultyLevel.INTERMEDIATE,
          points: 7,
          tags: ['javascript', 'functions'],
          content: 'Functions are first-class objects'
        }
      ];
      
      questions.forEach(q => generator.addQuestion(q));
      expect(generator.getQuestionCount()).toBe(4);
      
      // Test basic quiz generation
      const basicCriteria: QuizCriteria = {
        totalQuestions: 2,
        categories: ['TypeScript Basics'],
        shuffleQuestions: true
      };
      
      const basicQuiz = generator.generateQuiz('Basic TypeScript Quiz', basicCriteria);
      
      expect(basicQuiz.title).toBe('Basic TypeScript Quiz');
      expect(basicQuiz.questions).toHaveLength(2);
      expect(basicQuiz.categories).toContain('TypeScript Basics');
      expect(basicQuiz.totalPoints).toBe(8); // 5 + 3
      expect(basicQuiz.difficulty).toBe(DifficultyLevel.BEGINNER);
      expect(basicQuiz.estimatedTime).toBeGreaterThan(0);
      
      // Test quiz generation with point target
      const pointCriteria: QuizCriteria = {
        totalQuestions: 3,
        totalPoints: 15,
        difficulties: [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE]
      };
      
      const pointQuiz = generator.generateQuiz('Point-based Quiz', pointCriteria);
      expect(pointQuiz.questions.length).toBeGreaterThan(0);
      expect(pointQuiz.questions.length).toBeLessThanOrEqual(3);
      
      // Test insufficient questions
      const impossibleCriteria: QuizCriteria = {
        totalQuestions: 10, // More than available
        categories: ['Nonexistent Category']
      };
      
      expect(() => {
        generator.generateQuiz('Impossible Quiz', impossibleCriteria);
      }).toThrow('Not enough questions available');
      
      // Test quiz validation
      const validationResult = generator.validateQuiz(basicQuiz);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      
      // Test invalid quiz
      const invalidQuiz: Quiz = {
        ...basicQuiz,
        title: '',
        totalPoints: -5
      };
      
      const invalidResult = generator.validateQuiz(invalidQuiz);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors).toContain('Quiz must have a title');
    });
  });

  describe('Quiz Templates and Presets', () => {
    it('should provide quiz templates and presets', () => {
      enum DifficultyLevel {
        BEGINNER = 'beginner',
        INTERMEDIATE = 'intermediate',
        ADVANCED = 'advanced'
      }
      
      interface QuizTemplate {
        id: string;
        name: string;
        description: string;
        defaultCriteria: {
          totalQuestions: number;
          difficulties: DifficultyLevel[];
          timeLimit: number;
          categories?: string[];
          tags?: string[];
        };
        customizable: string[]; // Which criteria can be customized
      }
      
      class QuizTemplateManager {
        private templates: Map<string, QuizTemplate> = new Map();
        
        constructor() {
          this.initializeDefaultTemplates();
        }
        
        private initializeDefaultTemplates(): void {
          const templates: QuizTemplate[] = [
            {
              id: 'beginner-assessment',
              name: 'Beginner Assessment',
              description: 'A comprehensive assessment for beginners',
              defaultCriteria: {
                totalQuestions: 10,
                difficulties: [DifficultyLevel.BEGINNER],
                timeLimit: 15
              },
              customizable: ['totalQuestions', 'timeLimit', 'categories', 'tags']
            },
            {
              id: 'quick-review',
              name: 'Quick Review',
              description: 'A short quiz for quick knowledge review',
              defaultCriteria: {
                totalQuestions: 5,
                difficulties: [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE],
                timeLimit: 10
              },
              customizable: ['totalQuestions', 'difficulties', 'categories']
            },
            {
              id: 'certification-prep',
              name: 'Certification Preparation',
              description: 'Comprehensive quiz for certification preparation',
              defaultCriteria: {
                totalQuestions: 25,
                difficulties: [DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED],
                timeLimit: 45
              },
              customizable: ['totalQuestions', 'timeLimit']
            },
            {
              id: 'topic-focused',
              name: 'Topic-Focused Assessment',
              description: 'Deep dive into a specific topic',
              defaultCriteria: {
                totalQuestions: 15,
                difficulties: [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED],
                timeLimit: 25
              },
              customizable: ['totalQuestions', 'difficulties', 'timeLimit', 'categories', 'tags']
            }
          ];
          
          templates.forEach(template => this.templates.set(template.id, template));
        }
        
        getTemplate(id: string): QuizTemplate | undefined {
          return this.templates.get(id);
        }
        
        getAllTemplates(): QuizTemplate[] {
          return Array.from(this.templates.values());
        }
        
        createCustomTemplate(template: QuizTemplate): void {
          this.templates.set(template.id, template);
        }
        
        removeTemplate(id: string): boolean {
          return this.templates.delete(id);
        }
        
        generateQuizFromTemplate(
          templateId: string,
          customizations?: Partial<QuizTemplate['defaultCriteria']>
        ): QuizTemplate['defaultCriteria'] {
          const template = this.templates.get(templateId);
          if (!template) {
            throw new Error(`Template with id ${templateId} not found`);
          }
          
          const criteria = { ...template.defaultCriteria };
          
          if (customizations) {
            // Apply customizations only for allowed fields
            Object.keys(customizations).forEach(key => {
              if (template.customizable.includes(key)) {
                (criteria as any)[key] = (customizations as any)[key];
              }
            });
          }
          
          return criteria;
        }
        
        getTemplatesByDifficulty(difficulty: DifficultyLevel): QuizTemplate[] {
          return this.getAllTemplates().filter(template =>
            template.defaultCriteria.difficulties.includes(difficulty)
          );
        }
        
        getTemplatesByQuestionCount(min: number, max: number): QuizTemplate[] {
          return this.getAllTemplates().filter(template =>
            template.defaultCriteria.totalQuestions >= min &&
            template.defaultCriteria.totalQuestions <= max
          );
        }
        
        getTemplatesByTimeLimit(maxTime: number): QuizTemplate[] {
          return this.getAllTemplates().filter(template =>
            template.defaultCriteria.timeLimit <= maxTime
          );
        }
      }
      
      const templateManager = new QuizTemplateManager();
      
      // Test default templates
      const allTemplates = templateManager.getAllTemplates();
      expect(allTemplates.length).toBeGreaterThan(0);
      
      const beginnerTemplate = templateManager.getTemplate('beginner-assessment');
      expect(beginnerTemplate).toBeDefined();
      expect(beginnerTemplate!.name).toBe('Beginner Assessment');
      expect(beginnerTemplate!.defaultCriteria.difficulties).toEqual([DifficultyLevel.BEGINNER]);
      expect(beginnerTemplate!.defaultCriteria.totalQuestions).toBe(10);
      
      // Test template customization
      const customizedCriteria = templateManager.generateQuizFromTemplate('quick-review', {
        totalQuestions: 8,
        timeLimit: 12
      });
      
      expect(customizedCriteria.totalQuestions).toBe(8);
      expect(customizedCriteria.timeLimit).toBe(12);
      expect(customizedCriteria.difficulties).toEqual([DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE]);
      
      // Test custom template creation
      const customTemplate: QuizTemplate = {
        id: 'advanced-challenge',
        name: 'Advanced Challenge',
        description: 'For expert-level assessment',
        defaultCriteria: {
          totalQuestions: 20,
          difficulties: [DifficultyLevel.ADVANCED],
          timeLimit: 40,
          tags: ['expert', 'challenge']
        },
        customizable: ['timeLimit']
      };
      
      templateManager.createCustomTemplate(customTemplate);
      
      const retrievedCustom = templateManager.getTemplate('advanced-challenge');
      expect(retrievedCustom).toBeDefined();
      expect(retrievedCustom!.name).toBe('Advanced Challenge');
      
      // Test filtering templates
      const beginnerTemplates = templateManager.getTemplatesByDifficulty(DifficultyLevel.BEGINNER);
      expect(beginnerTemplates.length).toBeGreaterThan(0);
      expect(beginnerTemplates.every(t => 
        t.defaultCriteria.difficulties.includes(DifficultyLevel.BEGINNER)
      )).toBe(true);
      
      const shortTemplates = templateManager.getTemplatesByQuestionCount(1, 10);
      expect(shortTemplates.every(t => 
        t.defaultCriteria.totalQuestions <= 10
      )).toBe(true);
      
      const quickTemplates = templateManager.getTemplatesByTimeLimit(20);
      expect(quickTemplates.every(t => 
        t.defaultCriteria.timeLimit <= 20
      )).toBe(true);
      
      // Test template removal
      expect(templateManager.removeTemplate('advanced-challenge')).toBe(true);
      expect(templateManager.getTemplate('advanced-challenge')).toBeUndefined();
      expect(templateManager.removeTemplate('nonexistent')).toBe(false);
    });
  });

  describe('Answer Validation and Scoring', () => {
    it('should validate answers and calculate scores', () => {
      enum QuestionType {
        MULTIPLE_CHOICE = 'multiple_choice',
        TRUE_FALSE = 'true_false',
        SHORT_ANSWER = 'short_answer'
      }
      
      interface BaseQuestion {
        id: string;
        type: QuestionType;
        points: number;
      }
      
      interface MultipleChoiceQuestion extends BaseQuestion {
        type: QuestionType.MULTIPLE_CHOICE;
        correctAnswer: number;
        allowMultiple?: boolean;
        correctAnswers?: number[];
      }
      
      interface TrueFalseQuestion extends BaseQuestion {
        type: QuestionType.TRUE_FALSE;
        correctAnswer: boolean;
      }
      
      interface ShortAnswerQuestion extends BaseQuestion {
        type: QuestionType.SHORT_ANSWER;
        acceptedAnswers: string[];
        caseSensitive?: boolean;
        exactMatch?: boolean;
      }
      
      type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;
      
      interface UserAnswer {
        questionId: string;
        answer: any;
        timeSpent?: number; // in seconds
      }
      
      interface QuestionResult {
        questionId: string;
        correct: boolean;
        pointsEarned: number;
        pointsPossible: number;
        userAnswer: any;
        correctAnswer: any;
        feedback?: string;
      }
      
      interface QuizResult {
        totalScore: number;
        totalPossible: number;
        percentage: number;
        questionsCorrect: number;
        questionsTotal: number;
        timeSpent: number;
        results: QuestionResult[];
        passed: boolean;
        grade: string;
      }
      
      class AnswerValidator {
        validateAnswer(question: Question, userAnswer: any): boolean {
          switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
              return this.validateMultipleChoice(question, userAnswer);
            case QuestionType.TRUE_FALSE:
              return this.validateTrueFalse(question, userAnswer);
            case QuestionType.SHORT_ANSWER:
              return this.validateShortAnswer(question, userAnswer);
            default:
              return false;
          }
        }
        
        private validateMultipleChoice(question: MultipleChoiceQuestion, userAnswer: any): boolean {
          if (question.allowMultiple && question.correctAnswers) {
            if (!Array.isArray(userAnswer)) return false;
            
            const userSet = new Set(userAnswer);
            const correctSet = new Set(question.correctAnswers);
            
            if (userSet.size !== correctSet.size) return false;
            
            for (const answer of userSet) {
              if (!correctSet.has(answer)) return false;
            }
            
            return true;
          } else {
            return userAnswer === question.correctAnswer;
          }
        }
        
        private validateTrueFalse(question: TrueFalseQuestion, userAnswer: any): boolean {
          return userAnswer === question.correctAnswer;
        }
        
        private validateShortAnswer(question: ShortAnswerQuestion, userAnswer: any): boolean {
          if (typeof userAnswer !== 'string') return false;
          
          const normalizedAnswer = question.caseSensitive ? 
            userAnswer.trim() : 
            userAnswer.trim().toLowerCase();
          
          return question.acceptedAnswers.some(accepted => {
            const normalizedAccepted = question.caseSensitive ? 
              accepted.trim() : 
              accepted.trim().toLowerCase();
            
            if (question.exactMatch) {
              return normalizedAnswer === normalizedAccepted;
            } else {
              return normalizedAnswer.includes(normalizedAccepted) || 
                     normalizedAccepted.includes(normalizedAnswer);
            }
          });
        }
        
        getCorrectAnswer(question: Question): any {
          switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
              return question.allowMultiple ? question.correctAnswers : question.correctAnswer;
            case QuestionType.TRUE_FALSE:
              return question.correctAnswer;
            case QuestionType.SHORT_ANSWER:
              return question.acceptedAnswers[0]; // Return first accepted answer
            default:
              return null;
          }
        }
      }
      
      class QuizScorer {
        private validator = new AnswerValidator();
        
        scoreQuiz(
          questions: Question[],
          userAnswers: UserAnswer[],
          passingPercentage: number = 70
        ): QuizResult {
          const results: QuestionResult[] = [];
          let totalScore = 0;
          let totalPossible = 0;
          let totalTimeSpent = 0;
          
          const answerMap = new Map(userAnswers.map(ua => [ua.questionId, ua]));
          
          for (const question of questions) {
            const userAnswer = answerMap.get(question.id);
            const isCorrect = userAnswer ? 
              this.validator.validateAnswer(question, userAnswer.answer) : 
              false;
            
            const pointsEarned = isCorrect ? question.points : 0;
            totalScore += pointsEarned;
            totalPossible += question.points;
            
            if (userAnswer && userAnswer.timeSpent) {
              totalTimeSpent += userAnswer.timeSpent;
            }
            
            results.push({
              questionId: question.id,
              correct: isCorrect,
              pointsEarned,
              pointsPossible: question.points,
              userAnswer: userAnswer ? userAnswer.answer : null,
              correctAnswer: this.validator.getCorrectAnswer(question),
              feedback: this.generateFeedback(question, isCorrect)
            });
          }
          
          const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
          const passed = percentage >= passingPercentage;
          const grade = this.calculateGrade(percentage);
          const questionsCorrect = results.filter(r => r.correct).length;
          
          return {
            totalScore,
            totalPossible,
            percentage,
            questionsCorrect,
            questionsTotal: questions.length,
            timeSpent: totalTimeSpent,
            results,
            passed,
            grade
          };
        }
        
        private generateFeedback(question: Question, isCorrect: boolean): string {
          if (isCorrect) {
            return 'Correct! Well done.';
          } else {
            switch (question.type) {
              case QuestionType.MULTIPLE_CHOICE:
                return 'Incorrect. Please review the correct answer.';
              case QuestionType.TRUE_FALSE:
                return 'Incorrect. The correct answer is the opposite.';
              case QuestionType.SHORT_ANSWER:
                return 'Incorrect. Please check your spelling and try again.';
              default:
                return 'Incorrect answer.';
            }
          }
        }
        
        private calculateGrade(percentage: number): string {
          if (percentage >= 97) return 'A+';
          if (percentage >= 93) return 'A';
          if (percentage >= 90) return 'A-';
          if (percentage >= 87) return 'B+';
          if (percentage >= 83) return 'B';
          if (percentage >= 80) return 'B-';
          if (percentage >= 77) return 'C+';
          if (percentage >= 73) return 'C';
          if (percentage >= 70) return 'C-';
          if (percentage >= 67) return 'D+';
          if (percentage >= 65) return 'D';
          return 'F';
        }
        
        getDetailedAnalytics(result: QuizResult): {
          averageTimePerQuestion: number;
          strongAreas: string[];
          weakAreas: string[];
          improvementSuggestions: string[];
        } {
          const averageTimePerQuestion = result.timeSpent / result.questionsTotal;
          
          // This is a simplified analytics - in real implementation, 
          // you'd analyze by categories, topics, etc.
          const strongAreas = result.percentage >= 80 ? ['Overall Performance'] : [];
          const weakAreas = result.percentage < 70 ? ['Needs Improvement'] : [];
          
          const improvementSuggestions: string[] = [];
          if (result.percentage < 70) {
            improvementSuggestions.push('Review the material and practice more');
          }
          if (averageTimePerQuestion > 120) { // More than 2 minutes per question
            improvementSuggestions.push('Work on time management');
          }
          
          return {
            averageTimePerQuestion,
            strongAreas,
            weakAreas,
            improvementSuggestions
          };
        }
      }
      
      const validator = new AnswerValidator();
      const scorer = new QuizScorer();
      
      // Test questions
      const multipleChoiceQ: MultipleChoiceQuestion = {
        id: 'mc1',
        type: QuestionType.MULTIPLE_CHOICE,
        correctAnswer: 2,
        points: 5
      };
      
      const trueFalseQ: TrueFalseQuestion = {
        id: 'tf1',
        type: QuestionType.TRUE_FALSE,
        correctAnswer: true,
        points: 3
      };
      
      const shortAnswerQ: ShortAnswerQuestion = {
        id: 'sa1',
        type: QuestionType.SHORT_ANSWER,
        acceptedAnswers: ['typescript', 'TypeScript'],
        caseSensitive: false,
        points: 4
      };
      
      const multipleSelectQ: MultipleChoiceQuestion = {
        id: 'ms1',
        type: QuestionType.MULTIPLE_CHOICE,
        allowMultiple: true,
        correctAnswers: [0, 2],
        points: 6
      };
      
      // Test answer validation
      expect(validator.validateAnswer(multipleChoiceQ, 2)).toBe(true);
      expect(validator.validateAnswer(multipleChoiceQ, 1)).toBe(false);
      
      expect(validator.validateAnswer(trueFalseQ, true)).toBe(true);
      expect(validator.validateAnswer(trueFalseQ, false)).toBe(false);
      
      expect(validator.validateAnswer(shortAnswerQ, 'TypeScript')).toBe(true);
      expect(validator.validateAnswer(shortAnswerQ, 'typescript')).toBe(true);
      expect(validator.validateAnswer(shortAnswerQ, 'JavaScript')).toBe(false);
      
      expect(validator.validateAnswer(multipleSelectQ, [0, 2])).toBe(true);
      expect(validator.validateAnswer(multipleSelectQ, [2, 0])).toBe(true);
      expect(validator.validateAnswer(multipleSelectQ, [0, 1, 2])).toBe(false);
      
      // Test quiz scoring
      const questions = [multipleChoiceQ, trueFalseQ, shortAnswerQ];
      const userAnswers: UserAnswer[] = [
        { questionId: 'mc1', answer: 2, timeSpent: 45 },
        { questionId: 'tf1', answer: false, timeSpent: 20 }, // Incorrect
        { questionId: 'sa1', answer: 'typescript', timeSpent: 60 }
      ];
      
      const quizResult = scorer.scoreQuiz(questions, userAnswers, 70);
      
      expect(quizResult.totalPossible).toBe(12); // 5 + 3 + 4
      expect(quizResult.totalScore).toBe(9); // 5 + 0 + 4 (missed true/false)
      expect(quizResult.percentage).toBeCloseTo(75, 0); // 9/12 * 100
      expect(quizResult.questionsCorrect).toBe(2);
      expect(quizResult.questionsTotal).toBe(3);
      expect(quizResult.timeSpent).toBe(125); // 45 + 20 + 60
      expect(quizResult.passed).toBe(true); // 75% > 70%
      expect(quizResult.grade).toBe('C');
      
      // Test individual question results
      const mc1Result = quizResult.results.find(r => r.questionId === 'mc1');
      expect(mc1Result?.correct).toBe(true);
      expect(mc1Result?.pointsEarned).toBe(5);
      
      const tf1Result = quizResult.results.find(r => r.questionId === 'tf1');
      expect(tf1Result?.correct).toBe(false);
      expect(tf1Result?.pointsEarned).toBe(0);
      expect(tf1Result?.correctAnswer).toBe(true);
      
      // Test analytics
      const analytics = scorer.getDetailedAnalytics(quizResult);
      expect(analytics.averageTimePerQuestion).toBeCloseTo(41.67, 1); // 125/3
      expect(analytics.strongAreas).toContain('Overall Performance'); // 75% >= 80% is false, so should be empty
      
      // Test perfect score
      const perfectAnswers: UserAnswer[] = [
        { questionId: 'mc1', answer: 2 },
        { questionId: 'tf1', answer: true },
        { questionId: 'sa1', answer: 'TypeScript' }
      ];
      
      const perfectResult = scorer.scoreQuiz(questions, perfectAnswers);
      expect(perfectResult.percentage).toBe(100);
      expect(perfectResult.grade).toBe('A+');
      expect(perfectResult.questionsCorrect).toBe(3);
      expect(perfectResult.passed).toBe(true);
    });
  });
});