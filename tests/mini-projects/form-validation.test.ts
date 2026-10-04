// File: tests/mini-projects/form-validation.test.ts
//
// Exercises the real form-validation mini-project: the validator library and
// ValidationEngine in validation.ts, and the useForm / useFieldArray hooks in
// useForm.tsx (driven through @testing-library/react's renderHook).

import { act, render, renderHook, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPath,
  setPath,
  useFieldArray,
  useForm,
  withForm,
  type FormControlElement,
  type FormReturn,
} from '@/mini-projects/form-validation/useForm';
import {
  combineValidators,
  compositeValidators,
  conditionalValidator,
  createValidationSchema,
  type ValidationEngine,
  validators,
  type FieldError,
  type ValidationContext,
  type ValidationSchema,
} from '@/mini-projects/form-validation/validation';

const context = (overrides: Partial<ValidationContext> = {}): ValidationContext => ({
  fieldName: 'field',
  formData: {},
  touched: {},
  dirty: {},
  ...overrides,
});

describe('validators', () => {
  describe('required', () => {
    it.each([null, undefined, '', '   ', []])('rejects empty value %j', value => {
      expect(validators.required()(value)).toEqual({
        isValid: false,
        message: 'This field is required',
        code: 'required',
      });
    });

    it.each(['a', 0, false, ['x'], {}])('accepts non-empty value %j', value => {
      expect(validators.required()(value)).toMatchObject({ isValid: true, code: 'required' });
    });

    it('uses a custom message', () => {
      expect(validators.required('Name please')('')).toMatchObject({ message: 'Name please' });
    });
  });

  describe('minLength / maxLength', () => {
    it('checks string length bounds with default and custom messages', () => {
      expect(validators.minLength(3)('ab')).toEqual({
        isValid: false,
        message: 'Must be at least 3 characters',
        code: 'minLength',
      });
      expect(validators.minLength(3)('abc')).toMatchObject({ isValid: true });
      expect(validators.minLength(1, 'Too short')('')).toMatchObject({ message: 'Too short' });

      expect(validators.maxLength(2)('abc')).toEqual({
        isValid: false,
        message: 'Must be no more than 2 characters',
        code: 'maxLength',
      });
      expect(validators.maxLength(2)('ab')).toMatchObject({ isValid: true });
      expect(validators.maxLength(2)('')).toMatchObject({ isValid: true });
    });
  });

  describe('email', () => {
    it.each(['ada@example.com', 'first.last+tag@sub.domain.org'])('accepts %s', value => {
      expect(validators.email()(value)).toMatchObject({ isValid: true, code: 'email' });
    });

    it.each(['not-an-email', 'a@b', 'a b@c.com', '@domain.com'])('rejects %s', value => {
      expect(validators.email()(value)).toEqual({
        isValid: false,
        message: 'Please enter a valid email address',
        code: 'email',
      });
    });

    it('treats empty input as valid so required() can own that case', () => {
      expect(validators.email()('')).toEqual({ isValid: true });
    });
  });

  describe('pattern', () => {
    it('tests the value against the regex', () => {
      const digits = validators.pattern(/^\d+$/, 'Digits only');
      expect(digits('123')).toMatchObject({ isValid: true });
      expect(digits('12a')).toEqual({ isValid: false, message: 'Digits only', code: 'pattern' });
      expect(digits('')).toEqual({ isValid: true });
    });
  });

  describe('min / max', () => {
    it('checks numeric bounds and skips nullish values', () => {
      expect(validators.min(5)(4)).toEqual({ isValid: false, message: 'Must be at least 5', code: 'min' });
      expect(validators.min(5)(5)).toMatchObject({ isValid: true });
      expect(validators.min(5, 'Low')(1)).toMatchObject({ message: 'Low' });
      expect(validators.min(5)(null as unknown as number)).toEqual({ isValid: true });

      expect(validators.max(5)(6)).toEqual({ isValid: false, message: 'Must be no more than 5', code: 'max' });
      expect(validators.max(5)(5)).toMatchObject({ isValid: true });
      expect(validators.max(5, 'High')(9)).toMatchObject({ message: 'High' });
      expect(validators.max(5)(undefined as unknown as number)).toEqual({ isValid: true });
    });
  });

  describe('url', () => {
    it('accepts parseable URLs and rejects the rest', () => {
      expect(validators.url()('https://example.com/path?q=1')).toEqual({ isValid: true });
      expect(validators.url()('')).toEqual({ isValid: true });
      expect(validators.url()('not a url')).toEqual({
        isValid: false,
        message: 'Please enter a valid URL',
        code: 'url',
      });
    });
  });

  describe('phone', () => {
    it.each(['+1 (555) 123-4567', '555.123.4567', '+442071234567'])('accepts %s', value => {
      expect(validators.phone()(value)).toMatchObject({ isValid: true });
    });

    it.each(['0123', 'abc', '+', '12345678901234567'])('rejects %s', value => {
      expect(validators.phone()(value)).toEqual({
        isValid: false,
        message: 'Please enter a valid phone number',
        code: 'phone',
      });
    });

    it('treats empty input as valid', () => {
      expect(validators.phone()('')).toEqual({ isValid: true });
    });
  });

  describe('creditCard (Luhn)', () => {
    it.each(['4539 1488 0343 6467', '4111111111111111', '5500000000000004', '371449635398431'])(
      'accepts Luhn-valid number %s',
      value => {
        expect(validators.creditCard()(value)).toMatchObject({ isValid: true, code: 'creditCard' });
      }
    );

    it.each(['4111111111111112', '1234567890123456', '411111', 'abcd efgh ijkl mnop'])(
      'rejects %s',
      value => {
        expect(validators.creditCard()(value)).toEqual({
          isValid: false,
          message: 'Please enter a valid credit card number',
          code: 'creditCard',
        });
      }
    );

    it('treats empty input as valid', () => {
      expect(validators.creditCard()('')).toEqual({ isValid: true });
    });
  });

  describe('date / dateRange', () => {
    it('validates parseable dates', () => {
      expect(validators.date()('2024-02-29')).toMatchObject({ isValid: true });
      expect(validators.date()('')).toEqual({ isValid: true });
      expect(validators.date()('not a date')).toEqual({
        isValid: false,
        message: 'Please enter a valid date',
        code: 'date',
      });
    });

    it('validates dates inside an inclusive range', () => {
      const inRange = validators.dateRange('2024-01-01', new Date('2024-12-31'));
      expect(inRange('2024-06-15')).toMatchObject({ isValid: true, code: 'dateRange' });
      expect(inRange('2024-01-01')).toMatchObject({ isValid: true });
      expect(inRange('2025-01-01')).toMatchObject({
        isValid: false,
        code: 'dateRange',
        message: expect.stringMatching(/^Date must be between /),
      });
      expect(validators.dateRange('2024-01-01', '2024-12-31', 'Out of range')('2023-01-01')).toMatchObject({
        message: 'Out of range',
      });
      expect(inRange('garbage')).toEqual({ isValid: false, message: 'Please enter a valid date', code: 'date' });
      expect(inRange('')).toEqual({ isValid: true });
    });
  });

  describe('matches', () => {
    it('compares against another field in the form data', () => {
      const confirm = validators.matches('password');
      expect(confirm('secret', context({ formData: { password: 'secret' } }))).toMatchObject({ isValid: true });
      expect(confirm('other', context({ formData: { password: 'secret' } }))).toEqual({
        isValid: false,
        message: 'Must match password',
        code: 'matches',
      });
      expect(validators.matches('password', 'Passwords differ')('x', context())).toMatchObject({
        message: 'Passwords differ',
      });
      expect(confirm('anything')).toEqual({ isValid: true });
    });
  });

  describe('custom / async', () => {
    it('wraps a boolean predicate', () => {
      const even = validators.custom<number>(value => value % 2 === 0, 'Must be even', 'even');
      expect(even(2)).toMatchObject({ isValid: true, code: 'even' });
      expect(even(3)).toEqual({ isValid: false, message: 'Must be even', code: 'even' });
      expect(validators.custom(() => false, 'Nope')(1)).toMatchObject({ code: 'custom' });
    });

    it('passes the context through to the predicate', () => {
      const predicate = vi.fn(() => true);
      const ctx = context({ fieldName: 'x' });
      validators.custom(predicate, 'msg')('value', ctx);
      expect(predicate).toHaveBeenCalledWith('value', ctx);
    });

    it('wraps an async predicate and maps rejections to asyncError', async () => {
      const unique = validators.async<string>(async value => value !== 'taken', 'Already taken', 'unique');
      await expect(unique('free')).resolves.toMatchObject({ isValid: true, code: 'unique' });
      await expect(unique('taken')).resolves.toEqual({ isValid: false, message: 'Already taken', code: 'unique' });

      const failing = validators.async(async () => {
        throw new Error('network');
      }, 'msg');
      await expect(failing('x')).resolves.toEqual({
        isValid: false,
        message: 'Validation error occurred',
        code: 'asyncError',
      });
      await expect(validators.async(async () => false, 'msg')('x')).resolves.toMatchObject({ code: 'async' });
    });
  });
});

describe('compositeValidators', () => {
  const run = (rules: ReturnType<typeof compositeValidators.name>, value: string) =>
    Promise.all(rules.map(rule => rule.validator(value, context())));

  it('password builds rules according to the requested requirements', async () => {
    expect(compositeValidators.password()).toHaveLength(4);
    expect(compositeValidators.password(8, false, false, false)).toHaveLength(1);

    const results = await run(compositeValidators.password(), 'weakpass');
    expect(results.map(result => result.isValid)).toEqual([true, false, false, false]);
    expect(results.map(result => result.message)).toEqual([
      undefined,
      'Password must contain at least one special character',
      'Password must contain at least one number',
      'Password must contain at least one uppercase letter',
    ]);

    const strong = await run(compositeValidators.password(), 'Str0ng!pass');
    expect(strong.every(result => result.isValid)).toBe(true);
  });

  it('name accepts realistic names and rejects symbols', async () => {
    expect((await run(compositeValidators.name(), "Mary-Jane O'Neil")).every(result => result.isValid)).toBe(true);
    const bad = await run(compositeValidators.name(), 'R2D2');
    expect(bad.map(result => result.isValid)).toEqual([true, true, true, false]);
    expect((await run(compositeValidators.name(), 'A')).map(result => result.isValid)).toEqual([
      true, false, true, true,
    ]);
  });

  it('address enforces presence and length', async () => {
    expect((await run(compositeValidators.address(), '')).map(result => result.isValid)).toEqual([false, false, true]);
    expect((await run(compositeValidators.address(), 'x'.repeat(201))).map(result => result.isValid)).toEqual([
      true, true, false,
    ]);
    expect((await run(compositeValidators.address(), '12 A')).map(result => result.isValid)).toEqual([
      true, false, true,
    ]);
    expect((await run(compositeValidators.address(), '221B Baker Street')).every(result => result.isValid)).toBe(true);
  });

  it('zipCode picks a pattern per country and falls back to US', async () => {
    const passes = async (country: string | undefined, value: string) =>
      (await run(country ? compositeValidators.zipCode(country) : compositeValidators.zipCode(), value)).every(
        result => result.isValid
      );

    expect(await passes(undefined, '12345')).toBe(true);
    expect(await passes('US', '12345-6789')).toBe(true);
    expect(await passes('US', '1234')).toBe(false);
    expect(await passes('CA', 'K1A 0B1')).toBe(true);
    expect(await passes('CA', '12345')).toBe(false);
    expect(await passes('UK', 'SW1A 1AA')).toBe(true);
    expect(await passes('FR', '12345')).toBe(true); // unknown country uses the US pattern
    expect(compositeValidators.zipCode('CA')[1]!.validator('nope', context())).toMatchObject({
      message: 'Please enter a valid CA zip code',
    });
  });
});

describe('combineValidators / conditionalValidator', () => {
  it('runs validators in order and stops at the first failure', async () => {
    const second = vi.fn(validators.minLength(3));
    const combined = combineValidators<string>(validators.required(), second, validators.email());

    await expect(combined('')).resolves.toMatchObject({ isValid: false, code: 'required' });
    expect(second).not.toHaveBeenCalled();

    await expect(combined('ab')).resolves.toMatchObject({ isValid: false, code: 'minLength' });
    await expect(combined('nope')).resolves.toMatchObject({ isValid: false, code: 'email' });
    await expect(combined('a@b.co')).resolves.toEqual({ isValid: true });
  });

  it('chooses between validators based on the context', async () => {
    const needsPhone = (ctx: ValidationContext) => ctx.formData.contact === 'phone';
    const validator = conditionalValidator<string>(needsPhone, validators.phone(), validators.email());

    await expect(validator('abc', context({ formData: { contact: 'phone' } }))).resolves.toMatchObject({ code: 'phone' });
    await expect(validator('abc', context({ formData: { contact: 'email' } }))).resolves.toMatchObject({ code: 'email' });
    await expect(validator('abc')).resolves.toEqual({ isValid: true });

    const onlyIf = conditionalValidator<string>(needsPhone, validators.phone());
    await expect(onlyIf('abc', context({ formData: { contact: 'email' } }))).resolves.toEqual({ isValid: true });
  });
});

describe('ValidationEngine', () => {
  const schema: ValidationSchema = {
    email: { rules: [{ validator: validators.email() }], required: true },
    age: { rules: [{ validator: validators.min(18), message: 'Adults only', code: 'adult' }] },
    nickname: {
      rules: [
        {
          validator: validators.minLength(3),
          when: ctx => ctx.formData.showNickname === true,
        },
      ],
    },
    'address.street': { rules: [{ validator: validators.minLength(5) }], required: true },
  };

  let engine: ValidationEngine;

  beforeEach(() => {
    engine = createValidationSchema(schema);
  });

  afterEach(() => {
    engine.clearDebounceTimers();
    vi.useRealTimers();
  });

  it('short-circuits on required and reports the rule for other failures', async () => {
    await expect(engine.validateField('email', '', context())).resolves.toEqual([
      { message: 'This field is required', code: 'required' },
    ]);

    const errors = await engine.validateField('email', 'bad', context());
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ message: 'Please enter a valid email address', code: 'email' });
    expect(errors[0]!.rule).toBe(schema.email!.rules[0]);

    await expect(engine.validateField('email', 'a@b.co', context())).resolves.toEqual([]);
  });

  it('prefers the rule message and code over the validator result', async () => {
    await expect(engine.validateField('age', 12, context())).resolves.toMatchObject([
      { message: 'Adults only', code: 'adult' },
    ]);
  });

  it('returns no errors for fields not in the schema', async () => {
    await expect(engine.validateField('unknown', 'x', context())).resolves.toEqual([]);
  });

  it('skips rules whose when() predicate is false', async () => {
    await expect(engine.validateField('nickname', 'ab', context({ formData: {} }))).resolves.toEqual([]);
    await expect(
      engine.validateField('nickname', 'ab', context({ formData: { showNickname: true } }))
    ).resolves.toHaveLength(1);
  });

  it('turns a throwing validator into a validationError', async () => {
    engine.updateSchema({
      boom: {
        rules: [
          {
            validator: () => {
              throw new Error('kaboom');
            },
          },
        ],
      },
    });

    await expect(engine.validateField('boom', 'x', context())).resolves.toMatchObject([
      { message: 'Validation error occurred', code: 'validationError' },
    ]);
  });

  it('validates a whole form, reading dotted paths out of nested data', async () => {
    const errors = await engine.validateForm({
      email: 'ada@example.com',
      age: 10,
      address: { street: 'Elm' },
    });

    expect(Object.keys(errors).sort()).toEqual(['address.street', 'age']);
    expect(errors['address.street']).toMatchObject([{ code: 'minLength' }]);

    const missingNested = await engine.validateForm({ email: 'ada@example.com', age: 30 });
    expect(missingNested['address.street']).toEqual([{ message: 'This field is required', code: 'required' }]);

    await expect(
      engine.validateForm({ email: 'ada@example.com', age: 30, address: { street: 'Baker Street' } })
    ).resolves.toEqual({});
  });

  it('passes touched/dirty context through to validators', async () => {
    const spy = vi.fn(() => ({ isValid: true }));
    engine.updateSchema({ spy: { rules: [{ validator: spy }] } });

    await engine.validateForm({ spy: 1 }, { touched: { spy: true }, dirty: { spy: false } });

    expect(spy).toHaveBeenCalledWith(1, expect.objectContaining({ fieldName: 'spy', touched: { spy: true }, dirty: { spy: false } }));
  });

  it('debounces field validation and keeps only the last call per field', async () => {
    vi.useFakeTimers();
    engine.updateSchema({ email: { ...schema.email!, debounceMs: 50 } });
    const callback = vi.fn<(errors: FieldError[]) => void>();

    void engine.validateFieldWithDebounce('email', 'bad', context(), callback);
    await vi.advanceTimersByTimeAsync(25);
    void engine.validateFieldWithDebounce('email', 'good@example.com', context(), callback);
    await vi.advanceTimersByTimeAsync(25);
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(25);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([]);
  });

  it('uses a 300ms default debounce, ignores unknown fields and can clear pending timers', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    await engine.validateFieldWithDebounce('nope', 'x', context(), callback);
    void engine.validateFieldWithDebounce('age', 1, context(), callback);
    await vi.advanceTimersByTimeAsync(299);
    expect(callback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledTimes(1);

    void engine.validateFieldWithDebounce('age', 1, context(), callback);
    engine.clearDebounceTimers();
    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('updateSchema merges, replaces and removes fields; getSchema returns a copy', () => {
    engine.updateSchema({ age: undefined, extra: { rules: [] } });

    const current = engine.getSchema();
    expect(Object.keys(current).sort()).toEqual(['address.street', 'email', 'extra', 'nickname']);

    delete current.email;
    expect(engine.getSchema().email).toBeDefined();
  });
});

describe('getPath / setPath', () => {
  it('reads nested values and tolerates missing segments', () => {
    const source = { a: { b: { c: 1 } }, list: [1, 2] };
    expect(getPath(source, 'a.b.c')).toBe(1);
    expect(getPath(source, 'a.b')).toEqual({ c: 1 });
    expect(getPath(source, 'a.x.y')).toBeUndefined();
    expect(getPath(source, 'list.1')).toBe(2);
    expect(getPath(null, 'a')).toBeUndefined();
    expect(getPath('str', 'length')).toBeUndefined();
  });

  it('writes immutably, creating intermediate objects as needed', () => {
    const source = { a: { b: 1, keep: true }, other: 'x' };
    const next = setPath(source, 'a.b', 2);

    expect(next).toEqual({ a: { b: 2, keep: true }, other: 'x' });
    expect(source).toEqual({ a: { b: 1, keep: true }, other: 'x' });
    expect(next.a).not.toBe(source.a);

    expect(setPath({}, 'x.y.z', 1)).toEqual({ x: { y: { z: 1 } } });
    expect(setPath({ x: 'scalar' }, 'x.y', 1)).toEqual({ x: { y: 1 } });
    expect(setPath({ x: [1, 2] }, 'x.y', 1)).toEqual({ x: { y: 1 } });
    expect(setPath({ a: 1 }, '', 5)).toEqual({ a: 1, '': 5 });
  });

  it('round-trips arbitrary values through generated nested objects and paths', () => {
    const key = fc.constantFrom('a', 'b', 'c', 'd');
    const { tree } = fc.letrec(tie => ({
      tree: fc.dictionary(key, fc.oneof({ depthSize: 'small' }, fc.integer(), fc.string(), fc.boolean(), tie('tree')), {
        maxKeys: 4,
      }) as fc.Arbitrary<Record<string, unknown>>,
    }));
    const path = fc.array(key, { minLength: 1, maxLength: 4 }).map(parts => parts.join('.'));
    const value = fc.oneof(fc.integer(), fc.string(), fc.constant(null), fc.record({ nested: fc.integer() }));

    fc.assert(
      fc.property(tree, path, value, (source, dotted, written) => {
        const snapshot = JSON.stringify(source);
        const next = setPath(source, dotted, written);

        // The written value is readable at the same path
        expect(getPath(next, dotted)).toBe(written);
        // Writing never mutates the source object
        expect(JSON.stringify(source)).toBe(snapshot);
        // Sibling leaves outside the written path are untouched
        const segments = dotted.split('.');
        for (const [topKey, topValue] of Object.entries(source)) {
          if (topKey !== segments[0]) {
            expect(next[topKey]).toBe(topValue);
          }
        }
        // Re-writing the same value is idempotent
        expect(setPath(next, dotted, written)).toEqual(next);
      }),
      { numRuns: 200 }
    );
  });
});

interface Address {
  street: string;
  city: string;
}

interface Profile {
  name: string;
  email: string;
  age: number;
  newsletter: boolean;
  address: Address;
  tags: string[];
}

const initialProfile: Profile = {
  name: '',
  email: '',
  age: 20,
  newsletter: false,
  address: { street: '', city: 'London' },
  tags: ['a', 'b', 'c'],
};

const profileSchema: ValidationSchema = {
  name: { rules: [{ validator: validators.minLength(2) }], required: true, debounceMs: 1 },
  email: { rules: [{ validator: validators.email() }], required: true, debounceMs: 1 },
  age: { rules: [{ validator: validators.min(18) }], debounceMs: 1 },
  'address.street': { rules: [{ validator: validators.minLength(3) }], required: true, debounceMs: 1 },
};

const sleep = (ms: number) => act(() => new Promise<void>(resolve => setTimeout(resolve, ms)));

describe('useForm', () => {
  it('starts from a copy of the initial values with a clean state', () => {
    const { result } = renderHook(() => useForm<Profile>({ initialValues: initialProfile }));

    expect(result.current.values).toEqual(initialProfile);
    expect(result.current.values).not.toBe(initialProfile);
    expect(result.current).toMatchObject({
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      submitCount: 0,
    });
  });

  it('updates nested values through dotted paths and tracks dirty flags', () => {
    const { result } = renderHook(() => useForm<Profile>({ initialValues: initialProfile }));

    act(() => result.current.setFieldValue('address.street', 'Baker Street'));
    expect(result.current.values.address).toEqual({ street: 'Baker Street', city: 'London' });
    expect(result.current.dirty['address.street']).toBe(true);

    act(() => result.current.setFieldValue('address.street', ''));
    expect(result.current.dirty['address.street']).toBe(false);

    act(() => result.current.setFieldValue('name', 'Ada'));
    expect(result.current.values.name).toBe('Ada');
    expect(result.current.dirty.name).toBe(true);
  });

  it('validates on change (debounced) and clears errors once the value is fixed', async () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );

    act(() => result.current.setFieldValue('email', 'bad'));
    await waitFor(() => expect(result.current.errors.email).toMatchObject([{ code: 'email' }]));
    expect(result.current.isValid).toBe(false);

    act(() => result.current.setFieldValue('email', 'ada@example.com'));
    await waitFor(() => expect(result.current.errors.email).toBeUndefined());
    expect(result.current.isValid).toBe(true);
  });

  it('validates nested fields on change using the updated form data', async () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );

    act(() => result.current.setFieldValue('address.street', 'ab'));
    await waitFor(() => expect(result.current.errors['address.street']).toMatchObject([{ code: 'minLength' }]));
  });

  it('does not validate on change when validateOnChange is false', async () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema, validateOnChange: false })
    );

    act(() => result.current.setFieldValue('email', 'bad'));
    await sleep(20);

    expect(result.current.errors).toEqual({});
  });

  it('marks fields touched and validates on blur unless validateOnBlur is false', async () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );

    act(() => result.current.setFieldTouched('name'));
    expect(result.current.touched.name).toBe(true);
    await waitFor(() => expect(result.current.errors.name).toMatchObject([{ code: 'required' }]));

    act(() => result.current.setFieldTouched('name', false));
    expect(result.current.touched.name).toBe(false);

    const noBlur = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema, validateOnBlur: false })
    );
    act(() => noBlur.result.current.setFieldTouched('name'));
    await sleep(10);
    expect(noBlur.result.current.errors).toEqual({});
  });

  it('validates the whole form on mount when validateOnMount is set', async () => {
    const onValidationError = vi.fn();
    const { result } = renderHook(() =>
      useForm<Profile>({
        initialValues: initialProfile,
        validationSchema: profileSchema,
        validateOnMount: true,
        onValidationError,
      })
    );

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(Object.keys(result.current.errors).sort()).toEqual(['address.street', 'email', 'name']);
    expect(onValidationError).toHaveBeenCalledTimes(1);

    const untouched = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );
    await sleep(5);
    expect(untouched.result.current.errors).toEqual({});
  });

  it('validateField and validateForm return their results and update errors', async () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );

    let fieldErrors: FieldError[] = [];
    await act(async () => {
      fieldErrors = await result.current.validateField('age');
    });
    expect(fieldErrors).toEqual([]);

    act(() => result.current.setFieldValue('age', 10));
    await act(async () => {
      fieldErrors = await result.current.validateField('age');
    });
    expect(fieldErrors).toMatchObject([{ code: 'min' }]);
    expect(result.current.errors.age).toMatchObject([{ code: 'min' }]);

    let formValid = true;
    await act(async () => {
      formValid = await result.current.validateForm();
    });
    expect(formValid).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('validateField / validateForm are no-ops without a schema', async () => {
    const { result } = renderHook(() => useForm<Profile>({ initialValues: initialProfile }));

    await act(async () => {
      await expect(result.current.validateField('name')).resolves.toEqual([]);
      await expect(result.current.validateForm()).resolves.toBe(true);
    });
  });

  it('submits valid forms with the values and action helpers', async () => {
    const onSubmit = vi.fn();
    const validProfile: Profile = {
      ...initialProfile,
      name: 'Ada',
      email: 'ada@example.com',
      address: { street: 'Baker Street', city: 'London' },
    };
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: validProfile, validationSchema: profileSchema, onSubmit })
    );

    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual(validProfile);
    expect(Object.keys(onSubmit.mock.calls[0]![1] as object).sort()).toEqual([
      'resetForm',
      'setErrors',
      'setFieldError',
      'setFieldTouched',
      'setFieldValue',
      'setTouched',
      'setValues',
      'submitForm',
      'validateField',
      'validateForm',
    ]);
    expect(result.current.submitCount).toBe(1);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.touched).toEqual({
      name: true,
      email: true,
      age: true,
      newsletter: true,
      'address.street': true,
      'address.city': true,
      tags: true,
    });
  });

  it('blocks submission of invalid forms and reports validation errors', async () => {
    const onSubmit = vi.fn();
    const onValidationError = vi.fn();
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema, onSubmit, onValidationError })
    );

    await act(async () => {
      await result.current.submitForm();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.any(Array), email: expect.any(Array) })
    );
    expect(result.current.isValid).toBe(false);
    expect(result.current.submitCount).toBe(1);
  });

  it('logs and recovers when onSubmit throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() =>
      useForm<Profile>({
        initialValues: initialProfile,
        onSubmit: () => {
          throw new Error('server down');
        },
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(consoleError).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
    expect(result.current.isSubmitting).toBe(false);
  });

  it('supports manual error, touched and value management', () => {
    const { result } = renderHook(() => useForm<Profile>({ initialValues: initialProfile }));

    act(() => result.current.setFieldError('name', 'Taken'));
    expect(result.current.errors.name).toEqual([{ message: 'Taken' }]);
    expect(result.current.isValid).toBe(false);

    act(() => result.current.setFieldError('name', [{ message: 'A' }, { message: 'B', code: 'b' }]));
    expect(result.current.errors.name).toHaveLength(2);

    act(() => result.current.setErrors({ email: [{ message: 'Bad' }], name: [] }));
    expect(result.current.errors).toEqual({ email: [{ message: 'Bad' }] });

    act(() => result.current.setTouched({ name: true, 'address.city': true }));
    expect(result.current.touched).toEqual({ name: true, 'address.city': true });

    act(() => result.current.setValues({ name: 'Grace', age: 20 }));
    expect(result.current.values.name).toBe('Grace');
    expect(result.current.dirty).toEqual({ name: true, age: false });

    act(() => result.current.setErrors({ email: undefined }));
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('resets to the initial values, optionally overriding some of them', () => {
    const { result } = renderHook(() =>
      useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
    );

    act(() => {
      result.current.setFieldValue('name', 'Ada');
      result.current.setFieldTouched('name', false);
      result.current.setFieldError('email', 'x');
    });
    act(() => result.current.resetForm());

    expect(result.current.values).toEqual(initialProfile);
    expect(result.current).toMatchObject({ errors: {}, touched: {}, dirty: {}, isValid: true, submitCount: 0 });

    act(() => result.current.resetForm({ name: 'Preset' }));
    expect(result.current.values.name).toBe('Preset');

    // The override becomes the new baseline for dirty checking
    act(() => result.current.setFieldValue('name', 'Preset'));
    expect(result.current.dirty.name).toBe(false);
  });

  it('reinitialises when initialValues change and enableReinitialize is set', () => {
    const { result, rerender } = renderHook(
      ({ initialValues, enableReinitialize }: { initialValues: Profile; enableReinitialize: boolean }) =>
        useForm<Profile>({ initialValues, enableReinitialize }),
      { initialProps: { initialValues: initialProfile, enableReinitialize: false } }
    );

    const updated = { ...initialProfile, name: 'Loaded' };
    rerender({ initialValues: updated, enableReinitialize: false });
    expect(result.current.values.name).toBe('');

    rerender({ initialValues: updated, enableReinitialize: true });
    expect(result.current.values.name).toBe('Loaded');
  });

  it('swaps the validation engine when the schema changes', async () => {
    const strictAge: ValidationSchema = { age: { rules: [{ validator: validators.min(99) }], debounceMs: 1 } };
    const { result, rerender } = renderHook(
      ({ schema }: { schema: ValidationSchema }) =>
        useForm<Profile>({ initialValues: initialProfile, validationSchema: schema }),
      { initialProps: { schema: profileSchema } }
    );

    rerender({ schema: strictAge });
    let valid = true;
    await act(async () => {
      valid = await result.current.validateForm();
    });

    expect(valid).toBe(false);
    expect(Object.keys(result.current.errors)).toEqual(['age']);
  });

  describe('getFieldProps', () => {
    it('exposes value, flags and errors for a field and coerces values for inputs', async () => {
      const { result } = renderHook(() =>
        useForm<Profile>({ initialValues: initialProfile, validationSchema: profileSchema })
      );

      act(() => result.current.setFieldError('name', 'Bad name'));
      act(() => result.current.setFieldTouched('name', false));
      act(() => result.current.setFieldValue('name', 'Ada'));

      const props = result.current.getFieldProps('name');
      expect(props).toMatchObject({ name: 'name', value: 'Ada', touched: false, dirty: true });
      expect(props.error).toEqual([{ message: 'Bad name' }]);

      expect(result.current.getFieldProps('age').value).toBe(20);
      expect(result.current.getFieldProps('tags').value).toEqual(['a', 'b', 'c']);
      expect(result.current.getFieldProps('newsletter').value).toBe('false');
      expect(result.current.getFieldProps('address.city').value).toBe('London');

      act(() => result.current.setFieldValue('address.city', null));
      expect(result.current.getFieldProps('address.city').value).toBe('');
      await waitFor(() => expect(result.current.errors.name).toBeUndefined());
    });

    it('wires onChange (text and checkbox) and onBlur to the form state', async () => {
      const { result } = renderHook(() => useForm<Profile>({ initialValues: initialProfile }));

      const text = document.createElement('input');
      text.value = 'Grace';
      act(() => result.current.getFieldProps('name').onChange({ target: text } as unknown as React.ChangeEvent<FormControlElement>));
      expect(result.current.values.name).toBe('Grace');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      act(() =>
        result.current.getFieldProps('newsletter').onChange({ target: checkbox } as unknown as React.ChangeEvent<FormControlElement>)
      );
      expect(result.current.values.newsletter).toBe(true);

      act(() => result.current.getFieldProps('email').onBlur({} as React.FocusEvent<FormControlElement>));
      expect(result.current.touched.email).toBe(true);
      await sleep(5);
    });
  });

  it('withForm injects a form instance into the wrapped component', () => {
    let received: FormReturn<Profile> | null = null;
    const Inner = ({ form, label }: { form: FormReturn<Profile>; label: string }) => {
      received = form;
      return createElement('span', null, `${label}:${form.values.address.city}`);
    };
    const Wrapped = withForm<{ label: string }, Profile>(Inner, { initialValues: initialProfile });

    const { container } = render(createElement(Wrapped, { label: 'city' }));

    expect(container.textContent).toBe('city:London');
    expect(received).not.toBeNull();
    expect(typeof received!.setFieldValue).toBe('function');
  });
});

describe('useFieldArray', () => {
  const setup = () =>
    renderHook(() => {
      const form = useForm<Profile>({ initialValues: initialProfile });
      const tags = useFieldArray<string, Profile>('tags', form);
      return { form, tags };
    });

  it('mirrors the array field from the form values', () => {
    const { result } = setup();
    expect(result.current.tags.fields).toEqual(['a', 'b', 'c']);
  });

  it('append / prepend / insert / replace write through to the form', () => {
    const { result } = setup();

    act(() => result.current.tags.append('d'));
    expect(result.current.tags.fields).toEqual(['a', 'b', 'c', 'd']);

    act(() => result.current.tags.prepend('z'));
    expect(result.current.tags.fields).toEqual(['z', 'a', 'b', 'c', 'd']);

    act(() => result.current.tags.insert(2, 'mid'));
    expect(result.current.tags.fields).toEqual(['z', 'a', 'mid', 'b', 'c', 'd']);

    act(() => result.current.tags.replace(0, 'first'));
    expect(result.current.form.values.tags).toEqual(['first', 'a', 'mid', 'b', 'c', 'd']);
    expect(result.current.form.dirty.tags).toBe(true);
  });

  it('remove / swap / move reorder items and ignore out-of-range indices', () => {
    const { result } = setup();

    act(() => result.current.tags.remove(1));
    expect(result.current.tags.fields).toEqual(['a', 'c']);

    act(() => result.current.tags.append('b'));
    act(() => result.current.tags.swap(0, 2));
    expect(result.current.tags.fields).toEqual(['b', 'c', 'a']);

    act(() => result.current.tags.swap(0, 99));
    expect(result.current.tags.fields).toEqual(['b', 'c', 'a']);

    act(() => result.current.tags.move(2, 0));
    expect(result.current.tags.fields).toEqual(['a', 'b', 'c']);

    act(() => result.current.tags.move(99, 0));
    expect(result.current.tags.fields).toEqual(['a', 'b', 'c']);
  });

  it('treats non-array values as an empty list', () => {
    const { result } = renderHook(() => {
      const form = useForm<Profile>({ initialValues: initialProfile });
      return { form, missing: useFieldArray<string, Profile>('name', form) };
    });

    expect(result.current.missing.fields).toEqual([]);
    act(() => result.current.missing.append('x'));
    expect(result.current.form.values.name).toEqual(['x']);
  });
});
