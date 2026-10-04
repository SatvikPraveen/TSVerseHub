/**
 * Type-level assertion primitives.
 *
 * These utilities make claims about types checkable by the compiler alone: a
 * file that imports them and type-checks is a proof that every `Expect<...>`
 * within it holds. They form the foundation of the curriculum's verified
 * exercises and of the `tests/type-level` suite.
 *
 * @module core/type-level/assert
 */

/**
 * Structural type equality.
 *
 * Uses the "generic function identity" encoding: two types `A` and `B` are
 * considered equal when a generic function whose result depends on `T extends A`
 * is assignable to one whose result depends on `T extends B`. Unlike a mutual
 * `extends` check this distinguishes `any` from every other type, `1 | 2`
 * from `1 | 2 | 3`, and `{ a: 1 } & { b: 2 }` from `{ a: 1; b: 2 }` (the last
 * is intentional; use {@link Simplify} before comparing when that distinction
 * is noise).
 *
 * @see https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
 */
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;

/** Negation of {@link Equal}. */
export type NotEqual<A, B> = Equal<A, B> extends true ? false : true;

/**
 * Compile-time assertion. The type parameter must be exactly `true`; anything
 * else is a type error at the site of use.
 *
 * @example
 * type _ = Expect<Equal<Head<[1, 2]>, 1>>;
 */
export type Expect<T extends true> = T;

/** Assert that a type is `false`. */
export type ExpectFalse<T extends false> = T;

/** Boolean negation. */
export type Not<T extends boolean> = T extends true ? false : true;

/** `true` when `A` is assignable to `B`. */
export type Extends<A, B> = [A] extends [B] ? true : false;

/**
 * `true` only for `any`. Relies on the fact that `any` is the only type for
 * which `0 extends (1 & T)` holds, since `1 & any` collapses to `any`.
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * `true` only for `never`. Wrapping in a tuple prevents distribution over the
 * (empty) union, which would otherwise make the conditional itself `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/** `true` only for `unknown`. */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * `true` when `T` is a union with more than one member.
 *
 * Distributes `T` over itself: for each member `U`, checks whether the whole
 * union `[T]` is assignable to `[U]`. That can only hold if `T` has one member.
 */
export type IsUnion<T, U = T> = IsNever<T> extends true
  ? false
  : T extends unknown
    ? [U] extends [T]
      ? false
      : true
    : never;

/** `true` when `T` is a tuple with a fixed length (as opposed to an array). */
export type IsTuple<T> = T extends readonly unknown[]
  ? number extends T['length']
    ? false
    : true
  : false;

/**
 * Flatten intersections into a single object type so that structurally
 * identical shapes compare equal under {@link Equal}.
 */
export type Simplify<T> = T extends (...args: never[]) => unknown
  ? T
  : { [K in keyof T]: T[K] } & {};

/** A list of assertions, each of which must be `true`. */
export type Cases<T extends true[]> = T;
