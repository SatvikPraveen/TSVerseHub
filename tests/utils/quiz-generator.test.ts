// Tests for src/utils/quiz-generator.ts, exercised through its public export surface.
import fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type quizGenerator as staticGenerator, type QuizQuestion } from '@/utils/quiz-generator';

type Generator = typeof staticGenerator;

/** Each test gets a pristine question bank: the module exports a stateful singleton. */
async function freshGenerator(): Promise<Generator> {
  vi.resetModules();
  const mod = await import('@/utils/quiz-generator');
  return mod.quizGenerator;
}

const BANK_SIZE = 8;

function customQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'custom-001',
    question: 'What does `readonly` do on a property?',
    options: [
      { id: 'a', text: 'Prevents reassignment after construction', isCorrect: true },
      { id: 'b', text: 'Freezes the object at runtime', isCorrect: false },
    ],
    explanation: 'readonly is a compile-time check only',
    difficulty: 'advanced',
    concept: 'Readonly Modifiers',
    points: 20,
    ...overrides,
  };
}

let gen: Generator;

beforeEach(async () => {
  gen = await freshGenerator();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('question bank queries', () => {
  it('lists every concept once, sorted alphabetically', () => {
    const concepts = gen.getAvailableConcepts();
    expect(concepts).toEqual([...concepts].sort());
    expect(new Set(concepts).size).toBe(concepts.length);
    expect(concepts).toContain('Generics');
    expect(concepts).toContain('Union Types');
  });

  it('partitions the bank by difficulty', () => {
    const beginner = gen.getQuestionsByDifficulty('beginner');
    const intermediate = gen.getQuestionsByDifficulty('intermediate');
    const advanced = gen.getQuestionsByDifficulty('advanced');

    expect(beginner.length + intermediate.length + advanced.length).toBe(BANK_SIZE);
    expect(beginner.every(q => q.difficulty === 'beginner')).toBe(true);
    expect(advanced.map(q => q.id)).toEqual(['advanced-001']);
  });

  it('every bank question has exactly one correct option with a unique id', () => {
    const all = [
      ...gen.getQuestionsByDifficulty('beginner'),
      ...gen.getQuestionsByDifficulty('intermediate'),
      ...gen.getQuestionsByDifficulty('advanced'),
    ];
    for (const q of all) {
      expect(q.options.filter(o => o.isCorrect)).toHaveLength(1);
      expect(new Set(q.options.map(o => o.id)).size).toBe(q.options.length);
      expect(q.points).toBeGreaterThan(0);
    }
  });

  it('addQuestion makes the question available to queries and generation', () => {
    gen.addQuestion(customQuestion());

    expect(gen.getAvailableConcepts()).toContain('Readonly Modifiers');
    expect(gen.getQuestionsByDifficulty('advanced').map(q => q.id)).toContain('custom-001');

    const quiz = gen.generateQuiz({ totalQuestions: 5, concepts: ['readonly'] });
    expect(quiz.questions.map(q => q.id)).toEqual(['custom-001']);
  });
});

describe('generateQuiz', () => {
  it('returns bank order, totals and timing when nothing is randomised', () => {
    const quiz = gen.generateQuiz({ totalQuestions: 3 });

    expect(quiz.questions.map(q => q.id)).toEqual(['basic-001', 'basic-002', 'basic-003']);
    expect(quiz.totalPoints).toBe(15);
    expect(quiz.estimatedTime).toBe(5); // ceil(3 * 1.5)
    expect(quiz.title).toBe('TypeScript Quiz');
  });

  it('caps the question count at what the filters leave available', () => {
    const quiz = gen.generateQuiz({ totalQuestions: 100 });
    expect(quiz.questions).toHaveLength(BANK_SIZE);
  });

  it('produces an empty quiz for zero questions', () => {
    const quiz = gen.generateQuiz({ totalQuestions: 0 });
    expect(quiz.questions).toEqual([]);
    expect(quiz.totalPoints).toBe(0);
    expect(quiz.estimatedTime).toBe(0);
  });

  it('filters by difficulty, and "mixed" keeps everything', () => {
    const beginner = gen.generateQuiz({ totalQuestions: 50, difficulty: 'beginner' });
    expect(beginner.questions.length).toBeGreaterThan(0);
    expect(beginner.questions.every(q => q.difficulty === 'beginner')).toBe(true);

    const mixed = gen.generateQuiz({ totalQuestions: 50, difficulty: 'mixed' });
    expect(mixed.questions).toHaveLength(BANK_SIZE);
  });

  it('matches concepts case-insensitively by substring', () => {
    const quiz = gen.generateQuiz({ totalQuestions: 50, concepts: ['TYPES'] });
    expect(quiz.questions.length).toBeGreaterThan(1);
    expect(quiz.questions.every(q => q.concept.toLowerCase().includes('types'))).toBe(true);
  });

  it('an empty concepts list does not filter', () => {
    const quiz = gen.generateQuiz({ totalQuestions: 50, concepts: [] });
    expect(quiz.questions).toHaveLength(BANK_SIZE);
  });

  it('includeCodeExamples true/false selects disjoint, exhaustive subsets', () => {
    const withCode = gen.generateQuiz({ totalQuestions: 50, includeCodeExamples: true });
    const withoutCode = gen.generateQuiz({ totalQuestions: 50, includeCodeExamples: false });

    expect(withCode.questions.every(q => q.codeExample)).toBe(true);
    expect(withoutCode.questions.every(q => !q.codeExample)).toBe(true);
    expect(withCode.questions.length + withoutCode.questions.length).toBe(BANK_SIZE);
  });

  it('stamps id and createdAt from the clock and echoes the config', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05Z'));
    const config = { totalQuestions: 1 };

    const quiz = gen.generateQuiz(config);

    expect(quiz.createdAt.toISOString()).toBe('2026-01-02T03:04:05.000Z');
    expect(quiz.id).toMatch(new RegExp(`^quiz_${Date.now()}_`));
    expect(quiz.config).toBe(config);
  });

  it('builds titles from concepts, difficulty and time limit', () => {
    expect(gen.generateQuiz({ totalQuestions: 1, concepts: ['Generics'] }).title).toBe('Generics Quiz');
    expect(gen.generateQuiz({ totalQuestions: 1, concepts: ['Enums', 'Generics'] }).title).toBe(
      'Enums & Generics Quiz'
    );
    expect(gen.generateQuiz({ totalQuestions: 1, difficulty: 'intermediate', timeLimit: 7 }).title).toBe(
      'TypeScript Quiz (Intermediate) - 7 min'
    );
    expect(gen.generateQuiz({ totalQuestions: 1, difficulty: 'mixed' }).title).toBe('TypeScript Quiz');
  });

  it('is deterministic for a fixed random source', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = gen.generateQuiz({ totalQuestions: 4, randomizeQuestions: true, randomizeOptions: true });
    const second = gen.generateQuiz({ totalQuestions: 4, randomizeQuestions: true, randomizeOptions: true });

    const shape = (qs: QuizQuestion[]) => qs.map(q => `${q.id}:${q.options.map(o => o.id).join('')}`);
    expect(shape(first.questions)).toEqual(shape(second.questions));
    // With random() === 0 Fisher-Yates rotates the array left by one.
    expect(first.questions[0]!.options.map(o => o.id)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('randomised quizzes are permutations of the filtered bank (property)', () => {
    const sortedIds = (qs: QuizQuestion[]) => qs.map(q => q.id).sort();
    const baseline = gen.generateQuiz({ totalQuestions: 50 });

    fc.assert(
      fc.property(fc.array(fc.double({ min: 0, max: 0.999999, noNaN: true }), { minLength: 1, maxLength: 64 }), randoms => {
        let i = 0;
        const spy = vi.spyOn(Math, 'random').mockImplementation(() => randoms[i++ % randoms.length]!);
        try {
          const quiz = gen.generateQuiz({ totalQuestions: 50, randomizeQuestions: true, randomizeOptions: true });
          expect(sortedIds(quiz.questions)).toEqual(sortedIds(baseline.questions));
          for (const q of quiz.questions) {
            const original = baseline.questions.find(b => b.id === q.id)!;
            expect(q.options.map(o => o.id).sort()).toEqual(original.options.map(o => o.id).sort());
            expect(q.options.filter(o => o.isCorrect)).toHaveLength(1);
          }
        } finally {
          spy.mockRestore();
        }
      }),
      { numRuns: 50 }
    );
  });

  it('shuffling options does not mutate the shared question bank (regression)', () => {
    const before = gen.getQuestionsByDifficulty('beginner').map(q => q.options.map(o => o.id).join(''));
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const quiz = gen.generateQuiz({ totalQuestions: 50, randomizeOptions: true });

    const after = gen.getQuestionsByDifficulty('beginner').map(q => q.options.map(o => o.id).join(''));
    expect(after).toEqual(before);
    expect(quiz.questions[0]!.options.map(o => o.id).join('')).not.toBe(before[0]);
  });
});

describe('preset quizzes', () => {
  it('generateTopicQuiz filters by topic and titles after it', () => {
    const quiz = gen.generateTopicQuiz('Generics', 3);
    expect(quiz.title).toBe('Generics Quiz');
    expect(quiz.questions.map(q => q.id)).toEqual(['generic-001']);
  });

  it('generateTopicQuiz defaults to five questions', () => {
    expect(gen.generateTopicQuiz('').questions).toHaveLength(5);
  });

  it('generateSkillAssessment uses only code-example questions with a 20 minute limit', () => {
    const quiz = gen.generateSkillAssessment();
    expect(quiz.title).toBe('TypeScript Quiz - 20 min');
    expect(quiz.questions.length).toBeGreaterThan(0);
    expect(quiz.questions.every(q => q.codeExample)).toBe(true);
    expect(quiz.totalPoints).toBe(quiz.questions.reduce((s, q) => s + q.points, 0));
  });

  it('generateQuickPractice defaults to beginner and accepts a difficulty', () => {
    const beginner = gen.generateQuickPractice();
    expect(beginner.title).toBe('TypeScript Quiz (Beginner) - 10 min');
    expect(beginner.questions.length).toBeLessThanOrEqual(5);
    expect(beginner.questions.every(q => q.difficulty === 'beginner')).toBe(true);

    const advanced = gen.generateQuickPractice('advanced');
    expect(advanced.questions).toHaveLength(1);
    expect(advanced.totalPoints).toBe(15);
    expect(advanced.estimatedTime).toBe(2);
  });
});

describe('validateAnswer', () => {
  it('awards the question points for the correct option', () => {
    const result = gen.validateAnswer('basic-001', 'a');
    expect(result).toMatchObject({ isCorrect: true, correctAnswerId: 'a', points: 5 });
    expect(result.explanation).toContain('correct syntax');
  });

  it('awards zero points for a wrong option and still reports the right answer', () => {
    const result = gen.validateAnswer('enum-001', 'a');
    expect(result.isCorrect).toBe(false);
    expect(result.points).toBe(0);
    expect(result.correctAnswerId).toBe('b');
    expect(result.explanation).toBe('Red would be 0');
  });

  it('falls back to the question explanation when the option has none', () => {
    gen.addQuestion(customQuestion());
    expect(gen.validateAnswer('custom-001', 'b').explanation).toBe('readonly is a compile-time check only');
  });

  it('throws for unknown questions or options', () => {
    expect(() => gen.validateAnswer('nope', 'a')).toThrow('Question not found');
    expect(() => gen.validateAnswer('basic-001', 'z')).toThrow('Selected option not found');
  });
});

describe('calculateScore', () => {
  it('sums points, counts correct answers and rounds the percentage', () => {
    const score = gen.calculateScore('quiz-1', [
      { questionId: 'basic-001', selectedOptionId: 'a' }, // correct, 5
      { questionId: 'interface-001', selectedOptionId: 'a' }, // wrong, worth 10
    ]);

    expect(score.totalPoints).toBe(5);
    expect(score.maxPoints).toBe(15);
    expect(score.percentage).toBe(33);
    expect(score.correctAnswers).toBe(1);
    expect(score.totalQuestions).toBe(2);
    expect(score.results.map(r => [r.questionId, r.isCorrect, r.points])).toEqual([
      ['basic-001', true, 5],
      ['interface-001', false, 0],
    ]);
  });

  it('a perfect run scores 100%', () => {
    const score = gen.calculateScore('quiz-2', [
      { questionId: 'advanced-001', selectedOptionId: 'a' },
      { questionId: 'generic-001', selectedOptionId: 'a' },
    ]);
    expect(score.percentage).toBe(100);
    expect(score.totalPoints).toBe(score.maxPoints);
  });

  it('an empty answer sheet scores 0% rather than NaN', () => {
    const score = gen.calculateScore('quiz-3', []);
    expect(score).toMatchObject({ totalPoints: 0, maxPoints: 0, percentage: 0, totalQuestions: 0 });
  });

  it('propagates validation errors for unknown questions', () => {
    expect(() => gen.calculateScore('quiz-4', [{ questionId: 'missing', selectedOptionId: 'a' }])).toThrow(
      'Question not found'
    );
  });
});

describe('module exports', () => {
  it('default export is the same singleton as the named export', async () => {
    const mod = await import('@/utils/quiz-generator');
    expect(mod.default).toBe(mod.quizGenerator);
  });
});
