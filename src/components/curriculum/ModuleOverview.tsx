// File: src/components/curriculum/ModuleOverview.tsx

import { clsx } from 'clsx';
import { ArrowRight, CheckCircle, Clock, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';

import { difficultyClasses, formatMinutes } from './format';

import type { ModuleId } from '@/core/curriculum/registry';
import type { ConceptModule } from '@/core/curriculum/schema';
import type React from 'react';

export interface ModuleOverviewProps {
  /** Modules in the order they should be studied (topological order). */
  modules: readonly ConceptModule<ModuleId>[];
  levelOf: ReadonlyMap<ModuleId, number>;
  isCompleted: (id: ModuleId) => boolean;
}

/**
 * The curriculum as an ordered list of module cards. Order and prerequisite
 * links come from the registry's prerequisite graph, not from a hand-written
 * list, so the page cannot disagree with the verified curriculum.
 */
export const ModuleOverview: React.FC<ModuleOverviewProps> = ({ modules, levelOf, isCompleted }) => {
  const titleOf = (id: ModuleId): string => modules.find((m) => m.id === id)?.title ?? id;

  return (
    <ol aria-label="Modules in prerequisite order" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {modules.map((module, index) => {
        const completed = isCompleted(module.id);
        return (
          <li key={module.id} data-module-id={module.id} className="h-full">
            <Card hover className="h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      <Link to={`/concepts/${module.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {module.title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', difficultyClasses[module.difficulty])}>
                        {module.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {formatMinutes(module.estimatedMinutes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3 h-3" aria-hidden="true" />
                        level {levelOf.get(module.id) ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                {completed && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    Completed
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{module.summary}</p>

              <dl className="mt-4 text-sm space-y-2">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <dt className="text-slate-500 dark:text-slate-400">Prerequisites:</dt>
                  <dd className="flex flex-wrap gap-2">
                    {module.prerequisites.length === 0 ? (
                      <span className="text-slate-600 dark:text-slate-300">none</span>
                    ) : (
                      module.prerequisites.map((prerequisite) => (
                        <Link
                          key={prerequisite}
                          to={`/concepts/${prerequisite}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {titleOf(prerequisite)}
                        </Link>
                      ))
                    )}
                  </dd>
                </div>
                <div className="flex gap-2 text-slate-500 dark:text-slate-400">
                  <dt className="sr-only">Contents</dt>
                  <dd>
                    {module.objectives.length} objectives · {module.samples.length} verified samples · {module.references.length} references
                  </dd>
                </div>
              </dl>

              <div className="mt-auto pt-4 flex justify-end border-t border-slate-200 dark:border-slate-700 mt-4">
                <Link
                  to={`/concepts/${module.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {completed ? 'Review module' : 'Open module'}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          </li>
        );
      })}
    </ol>
  );
};
