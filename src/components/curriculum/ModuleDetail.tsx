// File: src/components/curriculum/ModuleDetail.tsx

import { clsx } from 'clsx';
import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { bloomClasses, difficultyClasses, formatMinutes } from './format';
import { SampleCard } from './SampleCard';

import type { ModuleId } from '@/core/curriculum/registry';
import type { ConceptModule } from '@/core/curriculum/schema';
import type React from 'react';

export interface ModuleDetailProps {
  module: ConceptModule<ModuleId>;
  /** Every module, used to resolve prerequisite and dependant titles. */
  modules: readonly ConceptModule<ModuleId>[];
  /** Longest-path effort to reach the end of this module, in minutes. */
  cumulativeMinutes: number;
  completed: boolean;
  onToggleComplete: () => void;
}

/**
 * Full view of one curriculum module: metadata, prerequisite links,
 * objectives with their Bloom level, references and the verified samples.
 */
export const ModuleDetail: React.FC<ModuleDetailProps> = ({ module, modules, cumulativeMinutes, completed, onToggleComplete }) => {
  const byId = new Map(modules.map((m) => [m.id, m] as const));
  const prerequisites = module.prerequisites.map((id) => byId.get(id)).filter((m): m is ConceptModule<ModuleId> => m !== undefined);
  const dependants = modules.filter((m) => m.prerequisites.includes(module.id));

  return (
    <div className="space-y-8">
      <Link to="/concepts" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        All modules
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{module.title}</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-3xl">{module.summary}</p>
          </div>
          <Button variant={completed ? 'outline' : 'success'} onClick={onToggleComplete} aria-pressed={completed}>
            <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            {completed ? 'Completed — mark as not complete' : 'Mark complete'}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', difficultyClasses[module.difficulty])}>{module.difficulty}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
            {formatMinutes(module.estimatedMinutes)} for this module
          </span>
          <span className="inline-flex items-center gap-1">
            <Route className="w-4 h-4" aria-hidden="true" />
            {formatMinutes(cumulativeMinutes)} including prerequisites
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Prerequisites</h2>
          {prerequisites.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">None. This is a starting module.</p>
          ) : (
            <ul aria-label="Prerequisites" className="space-y-2">
              {prerequisites.map((prerequisite) => (
                <li key={prerequisite.id}>
                  <Link to={`/concepts/${prerequisite.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {prerequisite.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {dependants.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-2">Unlocks</h3>
              <ul aria-label="Unlocks" className="space-y-2">
                {dependants.map((dependant) => (
                  <li key={dependant.id}>
                    <Link to={`/concepts/${dependant.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      {dependant.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Learning objectives</h2>
          <ul aria-label="Learning objectives" className="space-y-3">
            {module.objectives.map((objective) => (
              <li key={objective.id} className="flex items-start gap-2">
                <span className={clsx('mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap', bloomClasses[objective.level])}>
                  {objective.level}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{objective.statement}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">References</h2>
          <ul aria-label="References" className="space-y-2">
            {module.references.map((reference) => (
              <li key={reference.url}>
                <a
                  href={reference.url}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  {reference.title}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section aria-labelledby="verified-samples-heading">
        <div className="flex items-baseline justify-between mb-4">
          <h2 id="verified-samples-heading" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Verified samples
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {module.samples.length} samples checked against the compiler on every build
          </p>
        </div>
        <div className="space-y-4">
          {module.samples.map((sample) => (
            <SampleCard key={sample.id} moduleId={module.id} sample={sample} />
          ))}
        </div>
      </section>
    </div>
  );
};
