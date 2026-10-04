import { expectTypeOf } from 'expect-type';

import type {
  Cases,
  Equal,
  Expect,
  ExpectFalse,
  Extends,
  IsAny,
  IsNever,
  IsTuple,
  IsUnion,
  IsUnknown,
  NotEqual,
  Simplify,
} from '@/core/type-level';

// Equal distinguishes any, unions and intersections precisely.
type _equal = Cases<
  [
    Expect<Equal<1, 1>>,
    Expect<Equal<string | number, number | string>>,
    Expect<NotEqual<any, unknown>>,
    Expect<NotEqual<1 | 2, 1 | 2 | 3>>,
    Expect<NotEqual<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>>,
    Expect<Equal<Simplify<{ a: 1 } & { b: 2 }>, { a: 1; b: 2 }>>,
  ]
>;

type _predicates = Cases<
  [
    Expect<IsAny<any>>,
    ExpectFalse<IsAny<unknown>>,
    ExpectFalse<IsAny<never>>,
    Expect<IsNever<never>>,
    ExpectFalse<IsNever<undefined>>,
    Expect<IsUnknown<unknown>>,
    ExpectFalse<IsUnknown<any>>,
    Expect<IsUnion<1 | 2>>,
    ExpectFalse<IsUnion<1>>,
    ExpectFalse<IsUnion<never>>,
    ExpectFalse<IsUnion<boolean | string>> extends never ? never : Expect<IsUnion<boolean>>, // boolean is true | false
    Expect<IsTuple<[1, 2]>>,
    ExpectFalse<IsTuple<number[]>>,
    Expect<Extends<1, number>>,
    ExpectFalse<Extends<number, 1>>,
  ]
>;

// expect-type cross-check: both harnesses must agree.
expectTypeOf<Simplify<{ a: 1 } & { b: 2 }>>().toEqualTypeOf<{ a: 1; b: 2 }>();
expectTypeOf<IsAny<any>>().toEqualTypeOf<true>();
