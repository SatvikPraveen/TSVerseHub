// Tests for src/utils/compiler-utils.ts (the lightweight in-browser compiler simulation).
import fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CompilerUtils, type compilerService as staticService, type Diagnostic } from '@/utils/compiler-utils';

type Service = typeof staticService;

let svc: Service;

beforeEach(async () => {
  // The module exports a stateful singleton (options, virtual files); isolate each test.
  vi.resetModules();
  svc = (await import('@/utils/compiler-utils')).compilerService;
});

const messages = (diags: Diagnostic[]) => diags.map(d => d.message);
const byId = (diags: Diagnostic[], prefix: string) => diags.filter(d => d.id.startsWith(prefix));

describe('compile', () => {
  it('succeeds for valid code and emits transpiled output plus the source file record', async () => {
    const code = 'const x: number = 1;\nconsole.log(x);';
    const result = await svc.compile(code, 'demo.ts');

    expect(result.success).toBe(true);
    expect(result.outputText?.replace(/\s/g, '')).toBe('constx=1;console.log(x);');
    expect(result.sourceFiles).toEqual([
      { fileName: 'demo.ts', content: code, version: 1, languageVersion: 'ES2020', isDeclarationFile: false },
    ]);
    expect(result.timeTaken).toBeGreaterThanOrEqual(0);
  });

  it('fails without output when an error diagnostic is produced', async () => {
    const result = await svc.compile('const x: lowercaseType = 1;');
    expect(result.success).toBe(false);
    expect(result.outputText).toBeUndefined();
    expect(result.diagnostics.find(d => d.category === 'error')).toMatchObject({
      message: "Invalid type 'lowercaseType'",
      code: 2304,
      line: 1,
    });
  });

  it('honours per-call compiler options', async () => {
    const result = await svc.compile('const a = 1;\nconst b = a;', 'main.ts', { target: 'ES5' });
    expect(result.sourceFiles[0]!.languageVersion).toBe('ES5');
  });

  it('turns an internal failure into a single error diagnostic', async () => {
    vi.spyOn(svc, 'getDiagnostics').mockRejectedValue(new Error('checker crashed'));
    const result = await svc.compile('const a = 1;', 'boom.ts');
    expect(result.success).toBe(false);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ id: 'compilation-error', message: 'checker crashed', file: 'boom.ts', category: 'error' }),
    ]);
    expect(result.sourceFiles).toEqual([]);
  });

  it('reports a generic message for non-Error failures', async () => {
    vi.spyOn(svc, 'getDiagnostics').mockRejectedValue('nope');
    const result = await svc.compile('x');
    expect(messages(result.diagnostics)).toEqual(['Unknown compilation error']);
  });
});

describe('transpile', () => {
  it('strips type annotations, interfaces and type aliases', async () => {
    expect(await svc.transpile('const x: number = 1;')).toBe('const x= 1;');
    expect((await svc.transpile('interface User { id: number }\nconst u = 1;')).trim()).toBe('const u = 1;');
    expect((await svc.transpile('type Id = string | number;\nlet a = 1;')).trim()).toBe('let a = 1;');
  });

  it('lowers numeric and string enums to objects', async () => {
    expect(await svc.transpile('enum Color { Red, Green, Blue }')).toBe('const Color = {\n  Red: 0,\n  Green: 1,\n  Blue: 2,\n};');
    expect(await svc.transpile("enum Dir { Up = 'UP', Down = 'DOWN' }")).toContain('Up: "UP"');
  });

  it('removes imports, export keywords, access modifiers and generic parameters', async () => {
    expect(await svc.transpile("import { a } from './a';\nexport const b = 1;")).toBe('const b = 1;');
    expect(await svc.transpile('class A { private x = 1; public readonly y = 2; }')).toBe('class A { x = 1; y = 2; }');
    expect(await svc.transpile('function id<T>(a) { return a; }')).toBe('function id(a) { return a; }');
  });

  it('keeps decorators only when experimentalDecorators is enabled', async () => {
    const code = '@Component()\nclass A {}';
    expect(await svc.transpile(code)).toBe(code);
    expect(await svc.transpile(code, { experimentalDecorators: false })).toBe('class A {}');
  });
});

describe('getDiagnostics', () => {
  it('warns about unbalanced brackets in either direction, on the last line', async () => {
    const unclosed = await svc.getDiagnostics('function f() {\n  return 1;\n');
    expect(byId(unclosed, 'unbalanced-brackets')).toEqual([
      expect.objectContaining({ category: 'warning', message: 'Unclosed bracket', line: 3 }),
    ]);

    const extra = await svc.getDiagnostics('const a = 1;\nconsole.log(a));');
    expect(byId(extra, 'unbalanced-brackets')[0]?.message).toBe('Unexpected closing bracket');
  });

  it('accepts brackets balanced across lines', async () => {
    const diags = await svc.getDiagnostics('function f(a) {\n  return [a, (a)];\n}\nf(1);');
    expect(byId(diags, 'unbalanced-brackets')).toEqual([]);
  });

  it('never flags balanced bracket sequences (property)', async () => {
    // Build balanced sequences from open/close actions using an explicit stack.
    const pairs = { '(': ')', '[': ']', '{': '}' } as const;
    const balanced = fc
      .array(fc.tuple(fc.boolean(), fc.constantFrom<keyof typeof pairs>('(', '[', '{'), fc.constantFrom('', '\n', 'x ')))
      .map(actions => {
        const stack: Array<keyof typeof pairs> = [];
        let out = '';
        for (const [open, kind, filler] of actions) {
          if (open || stack.length === 0) {
            stack.push(kind);
            out += kind + filler;
          } else {
            out += pairs[stack.pop()!] + filler;
          }
        }
        while (stack.length > 0) out += pairs[stack.pop()!];
        return out;
      });

    await fc.assert(
      fc.asyncProperty(balanced, async code => {
        expect(byId(await svc.getDiagnostics(code), 'unbalanced-brackets')).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  it('suggests a semicolon for bare declarations and statements', async () => {
    const diags = await svc.getDiagnostics('let x\nreturn value');
    const semis = byId(diags, 'missing-semicolon');
    expect(semis.map(d => d.line)).toEqual([1, 2]);
    expect(semis[0]).toMatchObject({ code: 1005, column: 5 });
    expect(semis[0]!.quickFixes?.[0]?.changes[0]?.newText).toBe(';');
  });

  it('does not ask for a semicolon after initialisers, blocks or comments', async () => {
    const diags = await svc.getDiagnostics('const a = 1\nfunction f() {\n}\nlet b // note\nf(a, b);');
    expect(byId(diags, 'missing-semicolon')).toEqual([]);
  });

  it('flags unknown lowercase types but accepts built-ins, arrays, unions, generics and PascalCase', async () => {
    const valid = [
      'let a: string = "";',
      'let b: number[] = [];',
      'let c: string | null = null;',
      'let d: Promise<number> = p;',
      'let e: User & Admin = u;',
      'let f: MyType = m;',
    ].join('\n');
    expect(byId(await svc.getDiagnostics(valid), 'invalid-type')).toEqual([]);

    const invalid = await svc.getDiagnostics('let g: strng = "";');
    expect(byId(invalid, 'invalid-type')).toEqual([
      expect.objectContaining({ message: "Invalid type 'strng'", column: 8 }),
    ]);
  });

  it('suggests optional chaining for property access', async () => {
    const diags = await svc.getDiagnostics('const n = user.name;');
    expect(byId(diags, 'nullable-access')[0]).toMatchObject({
      category: 'suggestion',
      message: "Consider using optional chaining 'user?.name'",
      line: 1,
      column: 11,
    });
  });

  it('reports variables that are declared but never referenced again (regression)', async () => {
    const diags = await svc.getDiagnostics('const unused = 1;\nconst used = 2;\nf(used);');
    expect(byId(diags, 'unused-var').map(d => d.message)).toEqual(["'unused' is declared but never used"]);
  });

  it('counts a use on the declaring line', async () => {
    const diags = await svc.getDiagnostics('let n = 0; n++;');
    expect(byId(diags, 'unused-var')).toEqual([]);
  });

  it('returns nothing for empty input', async () => {
    expect(await svc.getDiagnostics('')).toEqual([]);
  });
});

describe('getTypeInfo', () => {
  it('reads an explicit annotation that precedes the hovered identifier', async () => {
    const code = 'const count: number = 5;\nf(count)';
    const info = await svc.getTypeInfo(code, code.lastIndexOf('count') + 2);
    expect(info).toEqual({ name: 'count', kind: 'variable', type: 'number', documentation: 'Variable of type number' });
  });

  it('falls back to any for unannotated identifiers', async () => {
    const info = await svc.getTypeInfo('foo', 3);
    expect(info).toMatchObject({ name: 'foo', type: 'any' });
  });

  it('returns null when the cursor is not on an identifier', async () => {
    expect(await svc.getTypeInfo('a +  b', 3)).toBeNull();
  });
});

describe('getCompletions', () => {
  it('offers keywords first and caps results at 20', async () => {
    const items = await svc.getCompletions('', 0);
    expect(items).toHaveLength(20);
    expect(items[0]).toMatchObject({ name: 'const', kind: 'keyword' });
  });

  it('filters by the word under the cursor', async () => {
    const items = await svc.getCompletions('let s: str', 10);
    expect(items.map(i => i.name)).toEqual(['string']);
  });

  it('documents utility types and inserts a type-argument placeholder', async () => {
    const [partial] = await svc.getCompletions('Par', 3);
    expect(partial).toMatchObject({ name: 'Partial', kind: 'type', insertText: 'Partial<>' });
    expect(partial!.documentation).toContain('optional');
  });

  it('offers console members after "console." (regression: previously crowded out)', async () => {
    const names = (await svc.getCompletions('console.', 8)).map(i => i.name);
    expect(names).toEqual(expect.arrayContaining(['log', 'error', 'warn']));
    expect(names).not.toContain('const');
  });

  it('offers array methods in member-access position', async () => {
    const names = (await svc.getCompletions('items.', 6)).map(i => i.name);
    expect(names).toEqual(expect.arrayContaining(['map', 'filter', 'reduce']));
  });
});

describe('getSignatureHelp', () => {
  it('resolves namespaced functions and tracks the active parameter (regression)', async () => {
    const help = await svc.getSignatureHelp('Math.max(1, 2', 13);
    expect(help?.signatures[0]?.label).toBe('Math.max(...values: number[]): number');
    expect(help?.activeParameter).toBe(1);

    const log = await svc.getSignatureHelp('console.log(', 12);
    expect(log).toMatchObject({ activeSignature: 0, activeParameter: 0 });
    expect(log?.signatures[0]?.parameters[0]?.label).toBe('...data: any[]');
  });

  it('returns null outside a call or for unknown functions', async () => {
    expect(await svc.getSignatureHelp('const a = 1', 11)).toBeNull();
    expect(await svc.getSignatureHelp('mystery(', 8)).toBeNull();
    expect(await svc.getSignatureHelp('Math.max(1)', 11)).toBeNull();
  });
});

describe('configuration and virtual file system', () => {
  it('merges option updates and hands out copies', () => {
    svc.setCompilerOptions({ target: 'ES5', strict: true });
    const opts = svc.getCompilerOptions();
    expect(opts).toMatchObject({ target: 'ES5', strict: true, module: 'ESNext' });
    opts.target = 'ES3';
    expect(svc.getCompilerOptions().target).toBe('ES5');
  });

  it('ships lib and React declarations and supports add/get/remove', () => {
    expect(svc.listVirtualFiles()).toEqual(expect.arrayContaining(['lib.d.ts', 'react.d.ts']));
    expect(svc.getVirtualFile('lib.d.ts')).toContain('declare var console');

    svc.addVirtualFile('extra.d.ts', 'declare const x: number;');
    expect(svc.getVirtualFile('extra.d.ts')).toBe('declare const x: number;');
    svc.removeVirtualFile('extra.d.ts');
    expect(svc.getVirtualFile('extra.d.ts')).toBeUndefined();
  });
});

describe('CompilerUtils', () => {
  const base: Diagnostic = { id: 'd', category: 'error', severity: 1, message: 'Bad thing', code: 2304 };

  it('formats diagnostics with location and code when available', () => {
    expect(CompilerUtils.formatDiagnostic({ ...base, file: 'a.ts', line: 3, column: 7 })).toBe(
      'ERROR a.ts(3,7): Bad thing [TS2304]'
    );
    expect(CompilerUtils.formatDiagnostic({ ...base, category: 'warning' })).toBe('WARNING: Bad thing [TS2304]');
    expect(CompilerUtils.formatDiagnostic({ ...base, code: 0 })).toBe('ERROR: Bad thing');
  });

  it('maps severities to colours', () => {
    const colour = (category: Diagnostic['category']) => CompilerUtils.getSeverityColor({ ...base, category });
    expect(colour('error')).toBe('text-red-600');
    expect(colour('warning')).toBe('text-yellow-600');
    expect(colour('info')).toBe('text-blue-600');
    expect(colour('suggestion')).toBe('text-green-600');
    expect(colour('other' as Diagnostic['category'])).toBe('text-gray-600');
  });

  it('extracts declared symbols with their line and range', () => {
    const code = ['function greet() {}', 'const answer = 42;', 'interface Shape {}', 'type Id = string;', 'class Box {}'].join(
      '\n'
    );
    const symbols = CompilerUtils.extractSymbols(code);
    expect(symbols.map(s => [s.kind, s.name, s.line])).toEqual([
      ['function', 'greet', 1],
      ['variable', 'answer', 2],
      ['interface', 'Shape', 3],
      ['type', 'Id', 4],
      ['class', 'Box', 5],
    ]);
    expect(symbols[1]!.range).toEqual({ start: 6, end: 12 });
  });

  it('extracts nothing from code without declarations', () => {
    expect(CompilerUtils.extractSymbols('f(1);\n// comment')).toEqual([]);
  });
});
