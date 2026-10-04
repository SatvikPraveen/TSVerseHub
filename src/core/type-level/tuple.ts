/**
 * Tuple algebra.
 *
 * Every operation here is total over `readonly unknown[]` and is bounded by
 * TypeScript's conditional-type instantiation depth (1000 at the time of
 * writing; see `research/benchmarks` for measured limits). Operations are
 * written tail-recursively where TypeScript's tail-call elimination for
 * conditional types applies (TypeScript >= 4.5).
 *
 * @module core/type-level/tuple
 */

/** Number of elements in a tuple. */
export type Length<T extends readonly unknown[]> = T['length'];

/** First element, or `never` for the empty tuple. */
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;

/** All elements after the first. */
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];

/** Last element, or `never` for the empty tuple. */
export type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;

/** All elements except the last. */
export type Init<T extends readonly unknown[]> = T extends readonly [...infer I, unknown] ? I : [];

/** Reverse (tail-recursive via accumulator). */
export type Reverse<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer H,
  ...infer R,
]
  ? Reverse<R, [H, ...Acc]>
  : Acc;

/** Concatenation. */
export type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];

/** Append one element. */
export type Push<T extends readonly unknown[], V> = [...T, V];

/** Prepend one element. */
export type Unshift<T extends readonly unknown[], V> = [V, ...T];

/** Tuple of `N` copies of `V`. */
export type Repeat<V, N extends number, Acc extends readonly unknown[] = []> = Acc['length'] extends N
  ? Acc
  : Repeat<V, N, [...Acc, V]>;

/** First `N` elements. */
export type Take<T extends readonly unknown[], N extends number, Acc extends readonly unknown[] = []> = Acc['length'] extends N
  ? Acc
  : T extends readonly [infer H, ...infer R]
    ? Take<R, N, [...Acc, H]>
    : Acc;

/** Elements after the first `N`. */
export type Drop<T extends readonly unknown[], N extends number, Count extends readonly unknown[] = []> = Count['length'] extends N
  ? T
  : T extends readonly [unknown, ...infer R]
    ? Drop<R, N, [...Count, unknown]>
    : [];

/** Pairwise zip; the result has the length of the shorter input. */
export type Zip<A extends readonly unknown[], B extends readonly unknown[]> = A extends readonly [infer AH, ...infer AR]
  ? B extends readonly [infer BH, ...infer BR]
    ? [[AH, BH], ...Zip<AR, BR>]
    : []
  : [];

/** `true` when `V` occurs in `T` (by {@link Equal}). */
export type Includes<T extends readonly unknown[], V> = T extends readonly [infer H, ...infer R]
  ? (<X>() => X extends H ? 1 : 2) extends <X>() => X extends V ? 1 : 2
    ? true
    : Includes<R, V>
  : false;

/** Element-wise map of a tuple to a union of its members. */
export type Members<T extends readonly unknown[]> = T[number];

/** Flatten one level of nesting. */
export type Flatten<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [infer H, ...infer R]
  ? H extends readonly unknown[]
    ? Flatten<R, [...Acc, ...H]>
    : Flatten<R, [...Acc, H]>
  : Acc;

/** Remove duplicate members, keeping the first occurrence. */
export type Unique<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [infer H, ...infer R]
  ? Includes<Acc, H> extends true
    ? Unique<R, Acc>
    : Unique<R, [...Acc, H]>
  : Acc;
