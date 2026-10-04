// File: src/components/curriculum/LearningPath.tsx

import { clsx } from 'clsx';
import { CheckCircle, Circle } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router-dom';

import { criticalPathCost, learningPath, type Graph } from '@/core/curriculum/graph';

import { formatMinutes } from './format';

import type { ModuleId } from '@/core/curriculum/registry';
import type { ConceptModule } from '@/core/curriculum/schema';
import type React from 'react';

export interface LearningPathProps {
  /** Modules in topological order (used for the target selector). */
  modules: readonly ConceptModule<ModuleId>[];
  graph: Graph<ModuleId>;
  targetId: ModuleId;
  onTargetChange: (id: ModuleId) => void;
  isCompleted: (id: ModuleId) => boolean;
}

/**
 * The ordered set of modules a learner must complete to reach a chosen
 * target, with the cumulative effort along the critical path at each step.
 * Both the order and the costs come from the registry's prerequisite graph.
 */
export const LearningPath: React.FC<LearningPathProps> = ({ modules, graph, targetId, onTargetChange, isCompleted }) => {
  const selectId = useId();
  const byId = new Map(modules.map((m) => [m.id, m] as const));
  const minutesOf = (id: ModuleId): number => byId.get(id)?.estimatedMinutes ?? 0;
  const path = learningPath(graph, targetId);
  const cost = criticalPathCost(graph, minutesOf);
  const total = path.reduce((sum, id) => sum + minutesOf(id), 0);
  const remaining = path.filter((id) => !isCompleted(id)).reduce((sum, id) => sum + minutesOf(id), 0);
  const isModuleId = (value: string): value is ModuleId => byId.has(value as ModuleId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Target module
        </label>
        <select
          id={selectId}
          value={targetId}
          onChange={(event) => {
            const next = event.target.value;
            if (isModuleId(next)) onTargetChange(next);
          }}
          className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </div>

      <ol aria-label="Learning path" className="divide-y divide-slate-200 dark:divide-slate-700">
        {path.map((id, index) => {
          const module = byId.get(id);
          const completed = isCompleted(id);
          const isTarget = id === targetId;
          return (
            <li key={id} data-module-id={id} className="flex items-center gap-3 py-3">
              <span
                aria-hidden="true"
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  completed
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                )}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/concepts/${id}`}
                  className={clsx(
                    'text-sm font-medium hover:underline',
                    isTarget ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100',
                  )}
                >
                  {module?.title ?? id}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatMinutes(minutesOf(id))} · {formatMinutes(cost.get(id) ?? 0)} cumulative
                </p>
              </div>
              {completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" aria-label="Completed" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {path.length} modules · {formatMinutes(total)} in total · {formatMinutes(remaining)} remaining · critical path{' '}
        {formatMinutes(cost.get(targetId) ?? 0)}
      </p>
    </div>
  );
};
