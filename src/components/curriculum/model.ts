/**
 * Browser-safe view of the verified curriculum.
 *
 * The `core/curriculum` barrel re-exports the verifier, which imports the
 * compiler kernel and therefore the whole `typescript` package (~3.6 MB).
 * Importing the barrel from a page would pull the compiler into the main
 * bundle, so UI code imports only the `graph`, `registry` and `schema`
 * submodules (see ADR 0009).
 *
 * @module components/curriculum/model
 */

import { criticalPathCost, curriculumGraph, levels, topologicalOrder, type Graph } from '@/core/curriculum/graph';
import { curriculum, moduleById, type ModuleId } from '@/core/curriculum/registry';

import type { ConceptModule } from '@/core/curriculum/schema';

export const moduleGraph: Graph<ModuleId> = curriculumGraph(curriculum.modules);

/** Module ids in study order (every prerequisite precedes its dependants). */
export const studyOrder: readonly ModuleId[] = topologicalOrder(moduleGraph);

export const orderedModules: readonly ConceptModule<ModuleId>[] = studyOrder.map(moduleById);

export const moduleLevels: ReadonlyMap<ModuleId, number> = levels(moduleGraph);

/** Longest-path effort, in minutes, to finish each module including its prerequisites. */
export const cumulativeMinutes: ReadonlyMap<ModuleId, number> = criticalPathCost(moduleGraph, (id) => moduleById(id).estimatedMinutes);

/** The module with the greatest depth; ties go to the earliest in study order. */
export const deepestModule: ModuleId = studyOrder.reduce<ModuleId>(
  (best, id) => ((moduleLevels.get(id) ?? 0) > (moduleLevels.get(best) ?? 0) ? id : best),
  studyOrder[0] ?? 'basics',
);

export const isModuleId = (value: string): value is ModuleId => curriculum.modules.some((m) => m.id === value);
