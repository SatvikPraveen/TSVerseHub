/**
 * Object-type transformations.
 *
 * @module core/type-level/object
 */

import type { Equal } from './assert';

/** Recursively mark every property readonly (arrays and tuples included). */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? readonly DeepReadonly<E>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

/** Recursively mark every property optional. */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? DeepPartial<E>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

/** Recursively mark every property required. */
export type DeepRequired<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? DeepRequired<E>[]
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<T[K]> }
      : T;

/** Remove `readonly` from every property (one level). */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Keys whose values are required. */
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

/** Keys whose values are optional. */
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];

/** Keys whose values are assignable to `V`. */
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

/** Properties whose values are assignable to `V`. */
export type PickByValue<T, V> = Pick<T, KeysOfType<T, V>>;

/** Properties whose values are not assignable to `V`. */
export type OmitByValue<T, V> = Omit<T, KeysOfType<T, V>>;

/** Make the listed keys required while leaving the rest unchanged. */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make the listed keys optional while leaving the rest unchanged. */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** At least one of the listed keys must be present. */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> = Omit<T, K> &
  { [P in K]-?: Required<Pick<T, P>> & Partial<Pick<T, Exclude<K, P>>> }[K];

/** Exactly one of the listed keys may be present. */
export type RequireExactlyOne<T, K extends keyof T = keyof T> = Omit<T, K> &
  { [P in K]-?: Required<Pick<T, P>> & Partial<Record<Exclude<K, P>, never>> }[K];

/** Convert a union to an intersection: `A | B` -> `A & B`. */
export type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * Pick the "last" member of a union as determined by overload resolution.
 * The order is an implementation detail of the compiler and must not be relied
 * upon for anything other than exhaustively enumerating a union (see
 * {@link UnionToTuple}).
 */
export type LastOf<U> = UnionToIntersection<U extends unknown ? () => U : never> extends () => infer R ? R : never;

/**
 * Enumerate a union as a tuple. Member order is unspecified; use only where the
 * order does not matter (e.g. to compute a union's size or to iterate it).
 */
export type UnionToTuple<U, Last = LastOf<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];

/** Number of members in a union. */
export type UnionSize<U> = UnionToTuple<U>['length'];

/** Dot-separated paths into a nested object (depth-limited to avoid runaway recursion). */
export type Paths<T, Depth extends unknown[] = [0, 0, 0, 0, 0]> = Depth extends [unknown, ...infer Rest]
  ? T extends readonly unknown[]
    ? never
    : T extends object
      ? {
          [K in keyof T & (string | number)]: T[K] extends object
            ? `${K}` | `${K}.${Paths<T[K], Rest>}`
            : `${K}`;
        }[keyof T & (string | number)]
      : never
  : never;

/** Type of the value at dot-separated `P` in `T`. */
export type Get<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? Get<T[H], R>
    : undefined
  : P extends keyof T
    ? T[P]
    : undefined;

/** Properties present in `A` but not in `B`. */
export type Diff<A, B> = Omit<A, keyof B>;

/** Properties present in both with identical types. */
export type Common<A, B> = { [K in keyof A & keyof B as Equal<A[K], B[K]> extends true ? K : never]: A[K] };

/** Discriminated-union member whose discriminant `K` equals `V`. */
export type ExtractByDiscriminant<U, K extends PropertyKey, V> = U extends Record<K, V> ? U : never;

/** Branded (nominal) type: a `T` that cannot be confused with a plain `T`. */
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

/** Opaque identifier helper: `Id<'User'>` and `Id<'Post'>` are not interchangeable. */
export type Id<Entity extends string> = Brand<string, `${Entity}Id`>;
