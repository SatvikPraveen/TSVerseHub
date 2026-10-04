// File: src/components/curriculum/PrerequisiteGraph.tsx

import { clsx } from 'clsx';

import { levels, type Graph } from '@/core/curriculum/graph';

import type { ModuleId } from '@/core/curriculum/registry';
import type { ConceptModule } from '@/core/curriculum/schema';
import type React from 'react';

export interface PrerequisiteGraphProps {
  modules: readonly ConceptModule<ModuleId>[];
  graph: Graph<ModuleId>;
  /** Modules on the currently selected learning path. */
  highlighted: ReadonlySet<ModuleId>;
  targetId: ModuleId;
  onSelect: (id: ModuleId) => void;
}

/**
 * Prerequisite DAG laid out as columns by depth (`levels`). Each node is a
 * button that selects it as the learning-path target; nodes on the current
 * path are highlighted and list the modules they follow.
 */
export const PrerequisiteGraph: React.FC<PrerequisiteGraphProps> = ({ modules, graph, highlighted, targetId, onSelect }) => {
  const depth = levels(graph);
  const byId = new Map(modules.map((m) => [m.id, m] as const));
  const maxDepth = Math.max(0, ...depth.values());
  const columns = Array.from({ length: maxDepth }, (_, index) => {
    const level = index + 1;
    return { level, ids: graph.nodes.filter((id) => depth.get(id) === level) };
  });

  return (
    <div
      role="group"
      aria-label="Prerequisite graph by level"
      className="grid gap-3 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(9rem, 1fr))` }}
    >
      {columns.map((column) => (
        <div key={column.level} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Level {column.level}</h4>
          {column.ids.map((id) => {
            const module = byId.get(id);
            const onPath = highlighted.has(id);
            const isTarget = id === targetId;
            const prerequisites = graph.edges[id] ?? [];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-pressed={isTarget}
                data-module-id={id}
                className={clsx(
                  'w-full text-left rounded-lg border p-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isTarget
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : onPath
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500',
                )}
              >
                <span className="block font-medium truncate">{module?.title.split(':')[0] ?? id}</span>
                {prerequisites.length > 0 && (
                  <span className={clsx('block mt-1 truncate', isTarget ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400')}>
                    after {prerequisites.map((p) => byId.get(p)?.title.split(':')[0] ?? p).join(', ')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
