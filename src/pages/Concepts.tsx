// File: src/pages/Concepts.tsx

import { BookOpen, CheckCircle, Clock, Layers, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';

import {
  ModuleDetail,
  ModuleOverview,
  cumulativeMinutes,
  formatMinutes,
  isModuleId,
  moduleLevels,
  orderedModules,
} from '@/components/curriculum';
import { useProgress } from '@/contexts/ProgressContext';
import { curriculum, moduleById, type ModuleId } from '@/core/curriculum/registry';

import type React from 'react';

// Study order, levels and cumulative effort come from the prerequisite graph
// (see components/curriculum/model); only the totals are computed here.
const totalMinutes = curriculum.modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
const totalSamples = curriculum.modules.reduce((sum, m) => sum + m.samples.length, 0);

const Concepts: React.FC = () => {
  const { conceptId } = useParams<{ conceptId: string }>();
  const { state, updateConceptProgress } = useProgress();

  const isCompleted = (id: ModuleId): boolean => state.concepts[id]?.completed === true;
  const selected = conceptId !== undefined && isModuleId(conceptId) ? moduleById(conceptId) : undefined;
  const unknownId = conceptId !== undefined && selected === undefined ? conceptId : undefined;
  const completedCount = curriculum.modules.filter((m) => isCompleted(m.id)).length;

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ModuleDetail
            module={selected}
            modules={curriculum.modules}
            cumulativeMinutes={cumulativeMinutes.get(selected.id) ?? selected.estimatedMinutes}
            completed={isCompleted(selected.id)}
            onToggleComplete={() => updateConceptProgress(selected.id, { completed: !isCompleted(selected.id) })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">TypeScript Curriculum</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              {curriculum.modules.length} modules ordered by their prerequisites. Every code sample is compiled against the real
              TypeScript compiler on each build, so what you read here is what the compiler does (curriculum v{curriculum.version}).
            </p>
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <dt className="sr-only">Modules</dt>
              <dd className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 inline-flex items-center gap-2">
                <Layers className="w-6 h-6" aria-hidden="true" />
                {curriculum.modules.length}
              </dd>
              <div className="text-sm text-slate-600 dark:text-slate-400">Modules</div>
            </div>
            <div>
              <dt className="sr-only">Completed</dt>
              <dd className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1 inline-flex items-center gap-2">
                <CheckCircle className="w-6 h-6" aria-hidden="true" />
                {completedCount}
              </dd>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </div>
            <div>
              <dt className="sr-only">Estimated time</dt>
              <dd className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1 inline-flex items-center gap-2">
                <Clock className="w-6 h-6" aria-hidden="true" />
                {formatMinutes(totalMinutes)}
              </dd>
              <div className="text-sm text-slate-600 dark:text-slate-400">Estimated time</div>
            </div>
            <div>
              <dt className="sr-only">Verified samples</dt>
              <dd className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 inline-flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                {totalSamples}
              </dd>
              <div className="text-sm text-slate-600 dark:text-slate-400">Verified samples</div>
            </div>
          </dl>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {unknownId !== undefined && (
          <p
            role="status"
            className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm"
          >
            {`No module named "${unknownId}". Showing the full curriculum instead.`}
          </p>
        )}

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Modules in study order</h2>
        </div>

        <ModuleOverview modules={orderedModules} levelOf={moduleLevels} isCompleted={isCompleted} />
      </div>
    </div>
  );
};

export default Concepts;
