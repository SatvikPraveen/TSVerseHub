// File: concepts/decorators/metadata.ts

/**
 * METADATA REGISTRY
 *
 * The decorator examples in this folder attach metadata to classes and class
 * members (table names, route paths, validation rules, parameter markers, ...).
 * In many codebases that job is done by the `reflect-metadata` polyfill, which
 * patches the global `Reflect` object. This module provides the same API surface
 * (`defineMetadata`, `getOwnMetadata`, `getMetadata`, `hasOwnMetadata`,
 * `hasMetadata`) as a small, dependency-free, fully typed implementation so the
 * examples run without a global polyfill.
 *
 * Storage model: a WeakMap keyed by the decorated target (a constructor or a
 * prototype) -> a Map keyed by member name (`undefined` for class-level
 * metadata) -> a Map of metadata key -> value. Using a WeakMap means metadata
 * never keeps a class alive once nothing else references it.
 */

export type MetadataKey = string | symbol;

/** A member name, or `undefined` for metadata attached to the class itself. */
export type MemberKey = string | symbol | undefined;

const registry = new WeakMap<object, Map<MemberKey, Map<MetadataKey, unknown>>>();

/** Stores `metadataValue` under `metadataKey` on `target` (optionally scoped to a member). */
export function defineMetadata(
  metadataKey: MetadataKey,
  metadataValue: unknown,
  target: object,
  propertyKey?: MemberKey
): void {
  let members = registry.get(target);
  if (!members) {
    members = new Map();
    registry.set(target, members);
  }

  let entries = members.get(propertyKey);
  if (!entries) {
    entries = new Map();
    members.set(propertyKey, entries);
  }

  entries.set(metadataKey, metadataValue);
}

/** True when `target` itself (not its prototype chain) carries `metadataKey`. */
export function hasOwnMetadata(metadataKey: MetadataKey, target: object, propertyKey?: MemberKey): boolean {
  return registry.get(target)?.get(propertyKey)?.has(metadataKey) ?? false;
}

/**
 * Reads metadata stored directly on `target`.
 *
 * The registry stores values as `unknown`; the caller names the expected type via
 * `T`, exactly as it would with `reflect-metadata`. The cast below is the single
 * place where that trust is expressed.
 */
export function getOwnMetadata<T = unknown>(
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: MemberKey
): T | undefined {
  return registry.get(target)?.get(propertyKey)?.get(metadataKey) as T | undefined;
}

/** True when `target` or anything on its prototype chain carries `metadataKey`. */
export function hasMetadata(metadataKey: MetadataKey, target: object, propertyKey?: MemberKey): boolean {
  let current: object | null = target;
  while (current) {
    if (hasOwnMetadata(metadataKey, current, propertyKey)) {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }
  return false;
}

/**
 * Reads metadata from `target`, walking up the prototype chain so that metadata
 * defined on a base class (or on the original constructor wrapped by a class
 * decorator) is visible from subclasses.
 */
export function getMetadata<T = unknown>(
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: MemberKey
): T | undefined {
  let current: object | null = target;
  while (current) {
    if (hasOwnMetadata(metadataKey, current, propertyKey)) {
      return getOwnMetadata<T>(metadataKey, current, propertyKey);
    }
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

export default {
  defineMetadata,
  getOwnMetadata,
  getMetadata,
  hasOwnMetadata,
  hasMetadata,
};
