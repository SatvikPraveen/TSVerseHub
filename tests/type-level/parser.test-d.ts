import type { Cases, Equal, Evaluate, Expect, IsValidExpression, ParseError, Tokenize } from '@/core/type-level';

type _tokenize = Cases<
  [
    Expect<
      Equal<
        Tokenize<'12 + (3)'>,
        [
          { kind: 'number'; value: 12 },
          { kind: 'op'; value: '+' },
          { kind: 'paren'; value: '(' },
          { kind: 'number'; value: 3 },
          { kind: 'paren'; value: ')' },
        ]
      >
    >,
    Expect<Equal<Tokenize<''>, []>>,
    Expect<Equal<Tokenize<'1 $ 2'>, ParseError<"Unexpected character '$'">>>,
  ]
>;

type _evaluate = Cases<
  [
    Expect<Equal<Evaluate<'7'>, 7>>,
    Expect<Equal<Evaluate<'1 + 2'>, 3>>,
    Expect<Equal<Evaluate<'1 + 2 * 3'>, 7>>, // precedence
    Expect<Equal<Evaluate<'(1 + 2) * 3'>, 9>>, // grouping
    Expect<Equal<Evaluate<'10 - 3 - 2'>, 5>>, // left associativity
    Expect<Equal<Evaluate<'20 / 3'>, 6>>, // integer division
    Expect<Equal<Evaluate<'20 % 6'>, 2>>,
    Expect<Equal<Evaluate<'((((2))))'>, 2>>,
    Expect<Equal<Evaluate<'2 * (3 + 4) - 5 % 3'>, 12>>,
    Expect<Equal<Evaluate<'  1+1  '>, 2>>,
  ]
>;

type _errors = Cases<
  [
    Expect<Equal<Evaluate<'1 +'>, ParseError<'Unexpected end of input'>>>,
    Expect<Equal<Evaluate<'(1 + 2'>, ParseError<"Expected ')'">>>,
    Expect<Equal<Evaluate<'1 2'>, ParseError<'Unexpected trailing tokens'>>>,
    Expect<Equal<Evaluate<'2 - 5'>, ParseError<'Operation 2 - 5 is undefined over the naturals'>>>,
    Expect<Equal<Evaluate<'1 / 0'>, ParseError<'Operation 1 / 0 is undefined over the naturals'>>>,
    Expect<IsValidExpression<'1 + 1'>>,
    Expect<Equal<IsValidExpression<'1 +'>, false>>,
  ]
>;
