/**
 * String algebra on template-literal types.
 *
 * TypeScript's template literal types support pattern matching with `infer`,
 * which is enough to write tokenizers, case converters and small parsers at
 * the type level. The operations below are the building blocks the curriculum
 * uses for its "typed routing" and "typed query builder" exercises.
 *
 * @module core/type-level/string
 */

import type { Add } from './arith';

/** Split `S` on `Sep` (an empty separator splits into characters). */
export type Split<S extends string, Sep extends string, Acc extends string[] = []> = S extends `${infer H}${Sep}${infer R}`
  ? Sep extends ''
    ? H extends ''
      ? Split<R, Sep, Acc>
      : Split<R, Sep, [...Acc, H]>
    : Split<R, Sep, [...Acc, H]>
  : S extends ''
    ? Acc
    : [...Acc, S];

/** Join a tuple of strings with `Sep`. */
export type Join<T extends readonly string[], Sep extends string = ''> = T extends readonly [
  infer H extends string,
  ...infer R extends string[],
]
  ? R extends []
    ? H
    : `${H}${Sep}${Join<R, Sep>}`
  : '';

/** Whitespace characters recognised by {@link Trim}. */
export type Whitespace = ' ' | '\n' | '\t' | '\r';

export type TrimStart<S extends string> = S extends `${Whitespace}${infer R}` ? TrimStart<R> : S;
export type TrimEnd<S extends string> = S extends `${infer R}${Whitespace}` ? TrimEnd<R> : S;
export type Trim<S extends string> = TrimStart<TrimEnd<S>>;

/** Replace the first occurrence of `From` with `To`. */
export type Replace<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer H}${From}${infer R}`
    ? `${H}${To}${R}`
    : S;

/** Replace every occurrence of `From` with `To`. */
export type ReplaceAll<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer H}${From}${infer R}`
    ? `${H}${To}${ReplaceAll<R, From, To>}`
    : S;

/** `true` when `S` starts with `P`. */
export type StartsWith<S extends string, P extends string> = S extends `${P}${string}` ? true : false;

/** `true` when `S` ends with `P`. */
export type EndsWith<S extends string, P extends string> = S extends `${string}${P}` ? true : false;

/** Length of a string literal. */
export type StringLength<S extends string, Acc extends unknown[] = []> = S extends `${string}${infer R}`
  ? StringLength<R, [...Acc, unknown]>
  : Acc['length'];

/** Number of non-overlapping occurrences of `Sub` in `S`. */
export type Count<S extends string, Sub extends string, Acc extends number = 0> = Sub extends ''
  ? never
  : S extends `${string}${Sub}${infer R}`
    ? Count<R, Sub, Add<Acc, 1>>
    : Acc;

/** Separators recognised by the case converters. */
export type WordSeparator = '-' | '_' | ' ';

/** Normalise every {@link WordSeparator} to `-` so later matches are unambiguous. */
type NormalizeSeparators<S extends string> = ReplaceAll<ReplaceAll<S, '_', '-'>, ' ', '-'>;

type CapitalizeWords<S extends string> = S extends `${infer H}-${infer R}` ? `${Capitalize<H>}${CapitalizeWords<R>}` : Capitalize<S>;

/**
 * `"foo-bar_baz qux"` -> `"fooBarBazQux"`.
 *
 * Separators are normalised first because inferring against a union pattern
 * such as `${infer H}${'-' | '_'}${infer R}` yields one match per alternative
 * and therefore a union of results rather than a single string.
 */
export type CamelCase<S extends string> = NormalizeSeparators<S> extends `${infer H}-${infer R}`
  ? `${Uncapitalize<H>}${CapitalizeWords<R>}`
  : Uncapitalize<NormalizeSeparators<S>>;

/** `"fooBarBaz"` -> `"foo-bar-baz"`. */
export type KebabCase<S extends string, Acc extends string = ''> = S extends `${infer H}${infer R}`
  ? H extends Uppercase<H>
    ? H extends Lowercase<H>
      ? KebabCase<R, `${Acc}${H}`> // digit or symbol
      : KebabCase<R, `${Acc}${Acc extends '' ? '' : '-'}${Lowercase<H>}`>
    : KebabCase<R, `${Acc}${H}`>
  : Acc;

/** `"fooBarBaz"` -> `"foo_bar_baz"`. */
export type SnakeCase<S extends string> = ReplaceAll<KebabCase<S>, '-', '_'>;

/** `"foo"` -> `"Foo"`; alias for the built-in intrinsic for discoverability. */
export type PascalCase<S extends string> = Capitalize<CamelCase<S>>;

/** Parse a decimal digit string to a numeric literal; `never` for non-digits. */
export type ParseInt<S extends string> = S extends `${infer N extends number}` ? N : never;

/** Decimal digit characters. */
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** `true` when `S` is a non-empty string of digits. */
export type IsDigits<S extends string> = S extends ''
  ? false
  : S extends `${Digit}${infer R}`
    ? R extends ''
      ? true
      : IsDigits<R>
    : false;

/**
 * Extract `:param` segments from a route pattern, e.g.
 * `"/users/:userId/posts/:postId"` -> `"userId" | "postId"`.
 */
export type RouteParams<Route extends string> = Route extends `${string}:${infer P}/${infer R}`
  ? P | RouteParams<`/${R}`>
  : Route extends `${string}:${infer P}`
    ? P
    : never;
