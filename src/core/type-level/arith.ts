/**
 * Natural-number arithmetic on numeric literal types.
 *
 * Numbers are encoded as tuple lengths (Peano-style unary): `N` is represented
 * by any tuple with `N` elements, so `Add<A, B>` is the length of the
 * concatenation of two such tuples. The encoding is simple to reason about,
 * but it is not cheap: constructing a tuple of length `N` takes `N`
 * instantiations, and each one spreads the accumulator (`[...Acc, V]`), so
 * step `k` copies `k` elements and the total work is quadratic in `N`. The
 * reference benchmark confirms this: doubling `N` multiplies the checking
 * cost by about four (workloads W2 and W3 in `research/benchmarks`). The hard
 * upper bound is the compiler's instantiation-depth limit (TS2589).
 *
 * All operations are defined on non-negative integer literals; the result of
 * applying them to `number` is `number`.
 *
 * @module core/type-level/arith
 */

import type { Repeat } from './tuple';

/** Tuple of length `N`. */
export type ToTuple<N extends number> = number extends N ? unknown[] : Repeat<unknown, N>;

/** `A + B`. */
export type Add<A extends number, B extends number> = [...ToTuple<A>, ...ToTuple<B>]['length'] & number;

/** `A - B`, or `never` when `B > A` (naturals are not closed under subtraction). */
export type Sub<A extends number, B extends number> = ToTuple<A> extends [...ToTuple<B>, ...infer Rest] ? Rest['length'] : never;

/** `A * B` via repeated addition. */
export type Mul<A extends number, B extends number, Acc extends unknown[] = [], I extends unknown[] = []> = I['length'] extends B
  ? Acc['length']
  : Mul<A, B, [...Acc, ...ToTuple<A>], [...I, unknown]>;

/** `A < B`. */
export type Lt<A extends number, B extends number> = A extends B ? false : ToTuple<B> extends [...ToTuple<A>, ...unknown[]] ? true : false;

/** `A <= B`. */
export type Lte<A extends number, B extends number> = A extends B ? true : Lt<A, B>;

/** `A > B`. */
export type Gt<A extends number, B extends number> = Lt<B, A>;

/** `A >= B`. */
export type Gte<A extends number, B extends number> = Lte<B, A>;

/** Three-way comparison: `-1`, `0` or `1`. */
export type Compare<A extends number, B extends number> = A extends B ? 0 : Lt<A, B> extends true ? -1 : 1;

/** Larger of two naturals. */
export type Max<A extends number, B extends number> = Lt<A, B> extends true ? B : A;

/** Smaller of two naturals. */
export type Min<A extends number, B extends number> = Lt<A, B> extends true ? A : B;

/** Integer division `floor(A / B)`; `never` when `B` is `0`. */
export type Div<A extends number, B extends number, Q extends unknown[] = []> = B extends 0
  ? never
  : Lt<A, B> extends true
    ? Q['length']
    : Div<Sub<A, B>, B, [...Q, unknown]>;

/** `A mod B`; `never` when `B` is `0`. */
export type Mod<A extends number, B extends number> = B extends 0 ? never : Lt<A, B> extends true ? A : Mod<Sub<A, B>, B>;

/** `true` when `N` is even. */
export type IsEven<N extends number> = Mod<N, 2> extends 0 ? true : false;

/** Numeric range `[From, To)` as a tuple of literals. */
export type Range<From extends number, To extends number, Acc extends number[] = []> = From extends To
  ? Acc
  : Range<Add<From, 1>, To, [...Acc, From]>;

/** Sum of a tuple of naturals. */
export type Sum<T extends readonly number[], Acc extends number = 0> = T extends readonly [infer H extends number, ...infer R extends number[]]
  ? Sum<R, Add<Acc, H>>
  : Acc;
