/* File: src/components/dashboards/QuizWidget.tsx */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../ui/Button';

import type React from 'react';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concept: string;
  codeExample?: string;
}

interface QuizResult {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizWidgetProps {
  title?: string;
  questions: QuizQuestion[];
  onComplete?: (results: QuizResult[]) => void;
  onQuestionAnswer?: (questionId: string, isCorrect: boolean) => void;
  showResults?: boolean;
  allowRetry?: boolean;
  timeLimit?: number; // in seconds
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  className?: string;
}

/** Deterministic 32-bit PRNG (mulberry32), returning values in [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Unbiased Fisher-Yates shuffle of a copy of `items`. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

const QuizWidget: React.FC<QuizWidgetProps> = ({
  title = "TypeScript Quiz",
  questions,
  onComplete,
  onQuestionAnswer,
  showResults = true,
  allowRetry = true,
  timeLimit,
  randomizeQuestions = false,
  randomizeOptions = false,
  className = '',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(() => Date.now());
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const [showExplanation, setShowExplanation] = useState(false);
  // The shuffle is drawn once per mounted quiz and is a pure function of this
  // seed, so the processed question list can be derived during render.
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 0x100000000));

  const processedQuestions = useMemo<QuizQuestion[]>(() => {
    const random = mulberry32(shuffleSeed);
    let processed = [...questions];

    if (randomizeQuestions) {
      processed = shuffle(processed, random);
    }

    if (randomizeOptions) {
      processed = processed.map(question => ({
        ...question,
        options: shuffle(question.options, random)
      }));
    }

    return processed;
  }, [questions, randomizeQuestions, randomizeOptions, shuffleSeed]);

  const completeQuiz = useCallback((results: QuizResult[] = quizResults) => {
    setIsCompleted(true);
    setCompletedAt(Date.now());
    onComplete?.(results);
  }, [quizResults, onComplete]);

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining && timeRemaining > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            // Time's up - complete quiz
            completeQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [timeLimit, timeRemaining, isCompleted, completeQuiz]);

  const currentQuestion = processedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === processedQuestions.length - 1;
  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleOptionSelect = (optionId: string) => {
    if (isCompleted || !currentQuestion) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const timeSpent = Date.now() - questionStartTime;
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedOptionId: selectedAnswer,
      isCorrect,
      timeSpent
    };

    const newResults = [...quizResults, result];
    setQuizResults(newResults);

    onQuestionAnswer?.(currentQuestion.id, isCorrect);

    if (isLastQuestion) {
      completeQuiz(newResults);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults([]);
    setIsCompleted(false);
    setCompletedAt(null);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setTimeRemaining(timeLimit || null);
    setShowExplanation(false);
  };

  const getScoreData = () => {
    const correctAnswers = quizResults.filter(result => result.isCorrect).length;
    const totalQuestions = quizResults.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const totalTime = Math.round(((completedAt ?? startTime) - startTime) / 1000);
    
    return {
      correctAnswers,
      totalQuestions,
      percentage,
      totalTime
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (processedQuestions.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const scoreData = getScoreData();
    
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        {/* Results Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
            <div className="text-4xl font-bold mb-2">{scoreData.percentage}%</div>
            <p className="text-green-100">
              {scoreData.correctAnswers} out of {scoreData.totalQuestions} correct
            </p>
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(scoreData.totalTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {scoreData.percentage >= 80 ? '🎉' : scoreData.percentage >= 60 ? '👍' : '📚'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {scoreData.percentage >= 80 ? 'Excellent!' : scoreData.percentage >= 60 ? 'Good job!' : 'Keep learning!'}
              </div>
            </div>
          </div>

          {showResults && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white">Detailed Results</h4>
              {quizResults.map((result, index) => {
                const question = processedQuestions.find(q => q.id === result.questionId);
                const selectedOption = question?.options.find(opt => opt.id === result.selectedOptionId);
                const correctOption = question?.options.find(opt => opt.isCorrect);
                
                return (
                  <div
                    key={result.questionId}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.isCorrect 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.isCorrect 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {question?.question}
                    </p>
                    
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="font-medium">Your answer:</span> {selectedOption?.text}
                      </div>
                      {!result.isCorrect && (
                        <div>
                          <span className="font-medium">Correct answer:</span> {correctOption?.text}
                        </div>
                      )}
                    </div>
                    
                    {(selectedOption?.explanation || question?.explanation) && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
                        {selectedOption?.explanation || question?.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {allowRetry && (
            <div className="text-center">
              <Button onClick={resetQuiz} variant="primary">
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          {timeRemaining && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-blue-100">
            Question {currentQuestionIndex + 1} of {processedQuestions.length}
          </span>
          <div className="w-32 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / processedQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {currentQuestion && (
          <>
            {/* Question Details */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {currentQuestion.concept}
                </span>
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentQuestion.question}
              </h4>
              
              {currentQuestion.codeExample && (
                <div className="mb-4">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{currentQuestion.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const showResult = showExplanation && selectedAnswer;
                const isCorrect = option.isCorrect;
                
                let optionClassName = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20";
                
                if (isSelected && !showResult) {
                  optionClassName += " border-blue-500 bg-blue-50 dark:bg-blue-900/20";
                } else if (showResult && isSelected && isCorrect) {
                  optionClassName += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                } else if (showResult && isSelected && !isCorrect) {
                  optionClassName += " border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                } else if (showResult && isCorrect) {
                  optionClassName += " border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                } else {
                  optionClassName += " border-gray-200 dark:border-gray-600";
                }
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={optionClassName}
                    disabled={showExplanation}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                        {showResult && isCorrect && !isSelected && (
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{option.text}</div>
                        {showResult && isSelected && option.explanation && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                            {option.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {showExplanation && currentQuestion.explanation && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Explanation</h5>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setShowExplanation(!showExplanation)}
                disabled={!selectedAnswer}
                className="text-blue-600 hover:text-blue-700"
              >
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                variant="primary"
                className="min-w-[120px]"
              >
                {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizWidget;