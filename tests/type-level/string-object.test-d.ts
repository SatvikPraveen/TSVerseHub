import type {
  Brand,
  CamelCase,
  Cases,
  Common,
  Count,
  DeepPartial,
  DeepReadonly,
  Diff,
  EndsWith,
  Equal,
  Expect,
  ExtractByDiscriminant,
  Get,
  Id,
  IsDigits,
  Join,
  KebabCase,
  KeysOfType,
  Mutable,
  OptionalKeys,
  ParseInt,
  PascalCase,
  Paths,
  Replace,
  ReplaceAll,
  RequireAtLeastOne,
  RequireExactlyOne,
  RequiredKeys,
  RouteParams,
  SnakeCase,
  Split,
  StartsWith,
  StringLength,
  Trim,
  UnionSize,
  UnionToIntersection,
} from '@/core/type-level';

type _string = Cases<
  [
    Expect<Equal<Split<'a,b,c', ','>, ['a', 'b', 'c']>>,
    Expect<Equal<Split<'abc', ''>, ['a', 'b', 'c']>>,
    Expect<Equal<Split<'', ','>, []>>,
    Expect<Equal<Join<['a', 'b', 'c'], '-'>, 'a-b-c'>>,
    Expect<Equal<Join<[], '-'>, ''>>,
    Expect<Equal<Trim<'  hi \n'>, 'hi'>>,
    Expect<Equal<Replace<'a-b-c', '-', '+'>, 'a+b-c'>>,
    Expect<Equal<ReplaceAll<'a-b-c', '-', '+'>, 'a+b+c'>>,
    Expect<StartsWith<'hello', 'he'>>,
    Expect<EndsWith<'hello', 'lo'>>,
    Expect<Equal<StringLength<'hello'>, 5>>,
    Expect<Equal<Count<'banana', 'a'>, 3>>,
    Expect<Equal<CamelCase<'foo-bar_baz qux'>, 'fooBarBazQux'>>,
    Expect<Equal<CamelCase<'Already'>, 'already'>>,
    Expect<Equal<KebabCase<'fooBarBaz'>, 'foo-bar-baz'>>,
    Expect<Equal<KebabCase<'HTTPServer2'>, 'h-t-t-p-server2'>>,
    Expect<Equal<SnakeCase<'fooBarBaz'>, 'foo_bar_baz'>>,
    Expect<Equal<PascalCase<'foo-bar'>, 'FooBar'>>,
    Expect<Equal<ParseInt<'42'>, 42>>,
    Expect<Equal<ParseInt<'x'>, never>>,
    Expect<IsDigits<'0123'>>,
    Expect<Equal<IsDigits<'12a'>, false>>,
    Expect<Equal<RouteParams<'/users/:userId/posts/:postId'>, 'userId' | 'postId'>>,
    Expect<Equal<RouteParams<'/static'>, never>>,
  ]
>;

interface User {
  id: string;
  name?: string;
  profile: { age: number; tags: string[] };
  readonly createdAt: Date;
}

type _object = Cases<
  [
    Expect<Equal<DeepReadonly<{ a: { b: number[] } }>, { readonly a: { readonly b: readonly number[] } }>>,
    Expect<Equal<DeepPartial<{ a: { b: number } }>, { a?: { b?: number } }>>,
    Expect<Equal<Mutable<{ readonly a: 1 }>, { a: 1 }>>,
    Expect<Equal<RequiredKeys<User>, 'id' | 'profile' | 'createdAt'>>,
    Expect<Equal<OptionalKeys<User>, 'name'>>,
    Expect<Equal<KeysOfType<User, string>, 'id'>>,
    Expect<Equal<UnionToIntersection<{ a: 1 } | { b: 2 }>, { a: 1 } & { b: 2 }>>,
    Expect<Equal<UnionSize<'a' | 'b' | 'c'>, 3>>,
    Expect<Equal<UnionSize<never>, 0>>,
    Expect<Equal<Paths<{ a: { b: { c: 1 } }; d: 2 }>, 'a' | 'a.b' | 'a.b.c' | 'd'>>,
    Expect<Equal<Get<{ a: { b: { c: 1 } } }, 'a.b.c'>, 1>>,
    Expect<Equal<Get<{ a: 1 }, 'missing'>, undefined>>,
    Expect<Equal<Diff<{ a: 1; b: 2 }, { b: 0 }>, { a: 1 }>>,
    Expect<Equal<Common<{ a: 1; b: 2 }, { a: 1; b: 3 }>, { a: 1 }>>,
    Expect<
      Equal<
        ExtractByDiscriminant<{ kind: 'circle'; r: number } | { kind: 'square'; s: number }, 'kind', 'circle'>,
        { kind: 'circle'; r: number }
      >
    >,
  ]
>;

// RequireAtLeastOne / RequireExactlyOne behave as documented at the value level.
type Contact = RequireAtLeastOne<{ email?: string; phone?: string }>;
const viaEmail: Contact = { email: 'a@b.c' };
const viaBoth: Contact = { email: 'a@b.c', phone: '1' };
// @ts-expect-error at least one contact method is required
const viaNone: Contact = {};

type Auth = RequireExactlyOne<{ token?: string; password?: string }>;
const byToken: Auth = { token: 't' };
// @ts-expect-error exactly one of token/password
const byBoth: Auth = { token: 't', password: 'p' };

// Brands are nominal.
type UserId = Id<'User'>;
type PostId = Id<'Post'>;
declare const userId: UserId;
declare const postId: PostId;
const acceptsUser = (_id: UserId): void => undefined;
acceptsUser(userId);
// @ts-expect-error a PostId is not a UserId even though both are strings
acceptsUser(postId);
// @ts-expect-error a raw string is not a UserId
acceptsUser('raw');
type _brand = Expect<Equal<Brand<number, 'Cents'> extends number ? true : false, true>>;

void viaEmail;
void viaBoth;
void viaNone;
void byToken;
void byBoth;
