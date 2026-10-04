import type {
  Add,
  Cases,
  Compare,
  Concat,
  Div,
  Drop,
  Equal,
  Expect,
  Flatten,
  Head,
  Includes,
  Init,
  IsEven,
  Last,
  Length,
  Lt,
  Max,
  Min,
  Mod,
  Mul,
  Range,
  Repeat,
  Reverse,
  Sub,
  Sum,
  Tail,
  Take,
  Unique,
  Zip,
} from '@/core/type-level';

type _tuple = Cases<
  [
    Expect<Equal<Length<[1, 2, 3]>, 3>>,
    Expect<Equal<Head<[1, 2, 3]>, 1>>,
    Expect<Equal<Head<[]>, never>>,
    Expect<Equal<Tail<[1, 2, 3]>, [2, 3]>>,
    Expect<Equal<Tail<[]>, []>>,
    Expect<Equal<Last<[1, 2, 3]>, 3>>,
    Expect<Equal<Init<[1, 2, 3]>, [1, 2]>>,
    Expect<Equal<Reverse<[1, 2, 3]>, [3, 2, 1]>>,
    Expect<Equal<Reverse<[]>, []>>,
    Expect<Equal<Concat<[1], [2, 3]>, [1, 2, 3]>>,
    Expect<Equal<Repeat<'x', 3>, ['x', 'x', 'x']>>,
    Expect<Equal<Take<[1, 2, 3, 4], 2>, [1, 2]>>,
    Expect<Equal<Take<[1], 5>, [1]>>,
    Expect<Equal<Drop<[1, 2, 3, 4], 2>, [3, 4]>>,
    Expect<Equal<Drop<[1], 5>, []>>,
    Expect<Equal<Zip<[1, 2, 3], ['a', 'b']>, [[1, 'a'], [2, 'b']]>>,
    Expect<Includes<[1, 2, 3], 2>>,
    Expect<Equal<Includes<[1, 2, 3], 4>, false>>,
    Expect<Equal<Includes<[1, any], unknown>, false>>, // Equal-based, not extends-based
    Expect<Equal<Flatten<[1, [2, 3], [4]]>, [1, 2, 3, 4]>>,
    Expect<Equal<Unique<[1, 2, 1, 3, 2]>, [1, 2, 3]>>,
  ]
>;

type _arith = Cases<
  [
    Expect<Equal<Add<2, 3>, 5>>,
    Expect<Equal<Add<0, 0>, 0>>,
    Expect<Equal<Sub<5, 3>, 2>>,
    Expect<Equal<Sub<3, 5>, never>>,
    Expect<Equal<Mul<3, 4>, 12>>,
    Expect<Equal<Mul<7, 0>, 0>>,
    Expect<Equal<Div<7, 2>, 3>>,
    Expect<Equal<Div<1, 0>, never>>,
    Expect<Equal<Mod<7, 2>, 1>>,
    Expect<Equal<Mod<6, 3>, 0>>,
    Expect<Lt<2, 3>>,
    Expect<Equal<Lt<3, 3>, false>>,
    Expect<Equal<Compare<1, 2>, -1>>,
    Expect<Equal<Compare<2, 2>, 0>>,
    Expect<Equal<Compare<3, 2>, 1>>,
    Expect<Equal<Max<3, 9>, 9>>,
    Expect<Equal<Min<3, 9>, 3>>,
    Expect<IsEven<10>>,
    Expect<Equal<IsEven<7>, false>>,
    Expect<Equal<Range<2, 5>, [2, 3, 4]>>,
    Expect<Equal<Sum<[1, 2, 3, 4]>, 10>>,
    // Non-literal inputs degrade to `number` instead of erroring.
    Expect<Equal<Add<number, 1>, number>>,
  ]
>;

// Depth: the encoding handles three-digit operands within the compiler's limits.
type _depth = Cases<[Expect<Equal<Add<400, 500>, 900>>, Expect<Equal<Mul<30, 30>, 900>>]>;
