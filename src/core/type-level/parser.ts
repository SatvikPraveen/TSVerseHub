/**
 * A type-level tokenizer, parser and evaluator for integer arithmetic.
 *
 * Grammar (standard precedence, left-associative):
 *
 *   expr   := term   (('+' | '-') term)*
 *   term   := factor (('*' | '/' | '%') factor)*
 *   factor := NUMBER | '(' expr ')'
 *
 * The implementation mirrors a hand-written recursive-descent parser, with
 * each production encoded as a conditional type that returns a `[value, rest]`
 * pair. It exists to demonstrate that TypeScript's type system is expressive
 * enough to implement a complete, if small, language pipeline, and to give the
 * benchmark suite a workload whose instantiation depth scales predictably with
 * input length.
 *
 * Numbers are naturals encoded as tuples (see `./arith`), so subtraction that
 * would go negative evaluates to `never`, as does division by zero. Both are
 * reported as parse failures rather than silently producing garbage.
 *
 * @example
 * type Seven = Evaluate<'1 + 2 * 3'>;        // 7
 * type Nine  = Evaluate<'(1 + 2) * 3'>;      // 9
 * type Bad   = Evaluate<'1 +'>;              // ParseError<"Unexpected end of input">
 *
 * @module core/type-level/parser
 */

import type { Add, Div, Mod, Mul, Sub } from './arith';
import type { Digit, Whitespace } from './string';

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export type Operator = '+' | '-' | '*' | '/' | '%';
export type Paren = '(' | ')';
export type NumberToken<N extends number = number> = { kind: 'number'; value: N };
export type OperatorToken<Op extends Operator = Operator> = { kind: 'op'; value: Op };
export type ParenToken<P extends Paren = Paren> = { kind: 'paren'; value: P };
export type Token = NumberToken | OperatorToken | ParenToken;

/** Structured error carrying a human-readable message. */
export type ParseError<Message extends string> = { kind: 'error'; message: Message };

type ReadNumber<S extends string, Acc extends string = ''> = S extends `${infer C extends Digit}${infer R}`
  ? ReadNumber<R, `${Acc}${C}`>
  : [Acc extends `${infer N extends number}` ? N : never, S];

/** Convert source text into a tuple of tokens, or a {@link ParseError}. */
export type Tokenize<S extends string, Acc extends Token[] = []> = S extends ''
  ? Acc
  : S extends `${Whitespace}${infer R}`
    ? Tokenize<R, Acc>
    : S extends `${infer C extends Operator}${infer R}`
      ? Tokenize<R, [...Acc, OperatorToken<C>]>
      : S extends `${infer C extends Paren}${infer R}`
        ? Tokenize<R, [...Acc, ParenToken<C>]>
        : S extends `${Digit}${string}`
          ? ReadNumber<S> extends [infer N extends number, infer R extends string]
            ? Tokenize<R, [...Acc, NumberToken<N>]>
            : ParseError<'Invalid number'>
          : S extends `${infer C}${string}`
            ? ParseError<`Unexpected character '${C}'`>
            : ParseError<'Unreachable'>;

// ---------------------------------------------------------------------------
// Parser: each production returns [value, remainingTokens] or ParseError
// ---------------------------------------------------------------------------

type ApplyOp<Op extends Operator, L extends number, R extends number> = Op extends '+'
  ? Add<L, R>
  : Op extends '-'
    ? Sub<L, R>
    : Op extends '*'
      ? Mul<L, R>
      : Op extends '/'
        ? Div<L, R>
        : Mod<L, R>;

type Checked<Op extends Operator, L extends number, R extends number> = [ApplyOp<Op, L, R>] extends [never]
  ? ParseError<`Operation ${L} ${Op} ${R} is undefined over the naturals`>
  : ApplyOp<Op, L, R>;

type ParseFactor<T extends Token[]> = T extends [NumberToken<infer N>, ...infer R extends Token[]]
  ? [N, R]
  : T extends [ParenToken<'('>, ...infer R extends Token[]]
    ? ParseExpr<R> extends [infer V extends number, infer Rest extends Token[]]
      ? Rest extends [ParenToken<')'>, ...infer After extends Token[]]
        ? [V, After]
        : ParseError<"Expected ')'">
      : ParseExpr<R>
    : T extends []
      ? ParseError<'Unexpected end of input'>
      : ParseError<'Expected a number or parenthesised expression'>;

type ParseTermRest<L extends number, T extends Token[]> = T extends [OperatorToken<infer Op extends '*' | '/' | '%'>, ...infer R extends Token[]]
  ? ParseFactor<R> extends [infer V extends number, infer Rest extends Token[]]
    ? Checked<Op, L, V> extends infer Result
      ? Result extends number
        ? ParseTermRest<Result, Rest>
        : Result
      : never
    : ParseFactor<R>
  : [L, T];

type ParseTerm<T extends Token[]> = ParseFactor<T> extends [infer V extends number, infer Rest extends Token[]]
  ? ParseTermRest<V, Rest>
  : ParseFactor<T>;

type ParseExprRest<L extends number, T extends Token[]> = T extends [OperatorToken<infer Op extends '+' | '-'>, ...infer R extends Token[]]
  ? ParseTerm<R> extends [infer V extends number, infer Rest extends Token[]]
    ? Checked<Op, L, V> extends infer Result
      ? Result extends number
        ? ParseExprRest<Result, Rest>
        : Result
      : never
    : ParseTerm<R>
  : [L, T];

type ParseExpr<T extends Token[]> = ParseTerm<T> extends [infer V extends number, infer Rest extends Token[]]
  ? ParseExprRest<V, Rest>
  : ParseTerm<T>;

/** Parse and evaluate `S`, producing a numeric literal or a {@link ParseError}. */
export type Evaluate<S extends string> = Tokenize<S> extends infer Tokens
  ? Tokens extends Token[]
    ? ParseExpr<Tokens> extends infer Result
      ? Result extends [infer V extends number, infer Rest extends Token[]]
        ? Rest extends []
          ? V
          : ParseError<'Unexpected trailing tokens'>
        : Result
      : never
    : Tokens // tokenizer error
  : never;

/** `true` when `S` is a well-formed expression that evaluates without error. */
export type IsValidExpression<S extends string> = Evaluate<S> extends number ? true : false;
