// File: tests/mini-projects/compiler-playground.test.ts
//
// Exercises the real compiler-playground transformer: lexing and parsing via
// parseToAST (the Lexer / Parser classes are internal), constant folding via
// transformAST, and code generation via generateCode, plus property tests
// that generated arithmetic round-trips through the pipeline.

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { type ASTNode } from '@/mini-projects/compiler-playground/ASTViewer';
import { generateCode, parseToAST, transformAST } from '@/mini-projects/compiler-playground/transformer';

const lit = (value: string | number): ASTNode => ({ type: 'Literal', value });
const id = (value: string): ASTNode => ({ type: 'Identifier', value });
const bin = (op: string, left: ASTNode, right: ASTNode): ASTNode => ({
  type: 'BinaryExpression',
  value: op,
  children: [left, right],
});
const program = (...children: ASTNode[]): ASTNode => ({ type: 'Program', children });

/** Parse a single expression statement and return its expression node. */
const parseExpression = (source: string): ASTNode => {
  const ast = parseToAST(`${source};`);
  expect(ast.children).toHaveLength(1);
  return ast.children![0]!;
};

/** Reference evaluator for arithmetic ASTs (the module ships none). */
const evaluate = (node: ASTNode): number => {
  if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
  if (node.type === 'BinaryExpression' && node.children?.length === 2) {
    const left = evaluate(node.children[0]!);
    const right = evaluate(node.children[1]!);
    switch (node.value) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
    }
  }
  throw new Error(`Cannot evaluate ${node.type}`);
};

describe('parseToAST', () => {
  describe('lexing', () => {
    it('reads integer and decimal number literals', () => {
      expect(parseExpression('42')).toEqual(lit(42));
      expect(parseExpression('3.25')).toEqual(lit(3.25));
    });

    it('reads single- and double-quoted strings', () => {
      expect(parseExpression('"hello world"')).toEqual(lit('hello world'));
      expect(parseExpression("'it works'")).toEqual(lit('it works'));
      expect(parseExpression('"say \'hi\'"')).toEqual(lit("say 'hi'"));
    });

    it('reads identifiers containing digits, underscores and dollar signs', () => {
      expect(parseExpression('_private$1')).toEqual(id('_private$1'));
      expect(parseExpression('$el')).toEqual(id('$el'));
    });

    it('skips whitespace, newlines and line comments', () => {
      const ast = parseToAST('// leading comment\n\n  let   x\t=\n 1 ;  // trailing\n// end');
      expect(ast).toEqual(program({ type: 'VariableDeclaration', value: 'let', children: [id('x'), lit(1)] }));
    });

    it('accepts an empty program', () => {
      expect(parseToAST('')).toEqual(program());
      expect(parseToAST('   \n // only a comment')).toEqual(program());
    });

    it('reports unexpected characters with their line and column', () => {
      expect(() => parseToAST('let x = 1 % 2;')).toThrow('Unexpected character: % at line 1, column 11');
      expect(() => parseToAST('let a = 1;\nlet b = 2;\n  b # 1;')).toThrow(
        'Unexpected character: # at line 3, column 5'
      );
    });

    it('rejects unterminated string literals', () => {
      expect(() => parseToAST('let s = "abc;')).toThrow('Unterminated string literal at line 1, column 9');
    });

    it('does not swallow extra dots into a number literal', () => {
      expect(() => parseToAST('let v = 1.2.3;')).toThrow("Expected ';' after variable declaration at line 1, column 12");
    });
  });

  describe('parsing', () => {
    it('builds variable declarations for let and const', () => {
      expect(parseToAST('let x = 10;\nconst name = "Ada";')).toEqual(
        program(
          { type: 'VariableDeclaration', value: 'let', children: [id('x'), lit(10)] },
          { type: 'VariableDeclaration', value: 'const', children: [id('name'), lit('Ada')] }
        )
      );
    });

    it('builds console.log calls as CallExpression(MemberExpression, ...args)', () => {
      const callee: ASTNode = { type: 'MemberExpression', children: [id('console'), id('log')] };

      expect(parseToAST('console.log();')).toEqual(program({ type: 'CallExpression', children: [callee] }));
      expect(parseToAST('console.log(x + 1);')).toEqual(
        program({ type: 'CallExpression', children: [callee, bin('+', id('x'), lit(1))] })
      );
      expect(parseToAST('console.log("total", x, 2);')).toEqual(
        program({ type: 'CallExpression', children: [callee, lit('total'), id('x'), lit(2)] })
      );
    });

    it('gives * and / higher precedence than + and -', () => {
      expect(parseExpression('1 + 2 * 3')).toEqual(bin('+', lit(1), bin('*', lit(2), lit(3))));
      expect(parseExpression('8 / 4 - 1')).toEqual(bin('-', bin('/', lit(8), lit(4)), lit(1)));
    });

    it('associates operators of equal precedence to the left', () => {
      expect(parseExpression('10 - 4 - 3')).toEqual(bin('-', bin('-', lit(10), lit(4)), lit(3)));
      expect(parseExpression('8 / 4 / 2')).toEqual(bin('/', bin('/', lit(8), lit(4)), lit(2)));
    });

    it('honours parentheses without emitting a node for them', () => {
      expect(parseExpression('(1 + 2) * 3')).toEqual(bin('*', bin('+', lit(1), lit(2)), lit(3)));
      expect(parseExpression('((x))')).toEqual(id('x'));
    });

    it('parses bare expression statements', () => {
      expect(parseToAST('x * 2;')).toEqual(program(bin('*', id('x'), lit(2))));
    });

    it.each([
      ['let = 1;', 'Expected variable name at line 1, column 5'],
      ['let x 1;', "Expected '=' after variable name at line 1, column 7"],
      ['let x = 1', "Expected ';' after variable declaration at line 1, column 10"],
      ['x + 1', "Expected ';' after expression at line 1, column 6"],
      ['let x = (1 + 2;', "Expected ')' after expression at line 1, column 15"],
      ['let x = ;', 'Unexpected token: ; at line 1, column 9'],
      ['let x = 1 +;', 'Unexpected token: ; at line 1, column 12'],
      ['console.log(1;', "Expected ')' at line 1, column 14"],
      ['console.log(1)', "Expected ';' at line 1, column 15"],
      ['console log(1);', "Expected '.' at line 1, column 9"],
      ['console.warn(1);', "Expected 'log' at line 1, column 9"],
      ['console.log 1;', "Expected '(' at line 1, column 13"],
    ])('reports a descriptive error for %j', (source, message) => {
      expect(() => parseToAST(source)).toThrow(message);
    });
  });
});

describe('transformAST (constant folding)', () => {
  it('folds numeric binary expressions, including nested ones', () => {
    expect(transformAST(parseToAST('let x = 2 + 3 * 4;'))).toEqual(
      program({ type: 'VariableDeclaration', value: 'let', children: [id('x'), lit(14)] })
    );
    expect(transformAST(parseExpression('(10 - 4) / 3'))).toEqual(lit(2));
    expect(transformAST(parseExpression('1 / 0'))).toEqual(lit(Infinity));
  });

  it('folds constant sub-expressions next to identifiers', () => {
    expect(transformAST(parseExpression('x + 2 * 3'))).toEqual(bin('+', id('x'), lit(6)));
    // Left-associativity means (x + 1) + 2 is not foldable
    expect(transformAST(parseExpression('x + 1 + 2'))).toEqual(bin('+', bin('+', id('x'), lit(1)), lit(2)));
  });

  it('does not fold string operands or unknown operators', () => {
    expect(transformAST(parseExpression('"a" + "b"'))).toEqual(bin('+', lit('a'), lit('b')));
    expect(transformAST(parseExpression('1 + "b"'))).toEqual(bin('+', lit(1), lit('b')));

    const modulo = bin('%', bin('+', lit(1), lit(1)), lit(2));
    expect(transformAST(modulo)).toEqual(bin('%', lit(2), lit(2)));
  });

  it('folds inside console.log arguments', () => {
    const folded = transformAST(parseToAST('console.log(6 * 7);'));
    expect(folded.children![0]!.children![1]).toEqual(lit(42));
  });

  it('returns leaf nodes as-is and never mutates its input', () => {
    const leaf = id('x');
    expect(transformAST(leaf)).toBe(leaf);

    const ast = parseToAST('let x = 1 + 2;');
    const snapshot = structuredClone(ast);
    transformAST(ast);
    expect(ast).toEqual(snapshot);
  });
});

describe('generateCode', () => {
  it('emits declarations, calls, identifiers and literals', () => {
    expect(generateCode(parseToAST('let x = 10;\nconst s = "hi";\nconsole.log(x);'))).toBe(
      'let x = 10;\nconst s = "hi";\nconsole.log(x);'
    );
    expect(generateCode(program())).toBe('');
    expect(generateCode({ type: 'Program' })).toBe('');
  });

  it('separates multiple call arguments with commas', () => {
    expect(generateCode(parseToAST('console.log("x", x, 1 + 2);'))).toBe('console.log("x", x, 1 + 2);');
  });

  it('produces valid string literals for strings containing quotes or backslashes', () => {
    expect(generateCode(lit('say "hi"'))).toBe('"say \\"hi\\""');
    expect(generateCode(lit('back\\slash'))).toBe('"back\\\\slash"');
  });

  it('keeps the parentheses that the AST structure requires', () => {
    expect(generateCode(parseExpression('(1 + 2) * 3'))).toBe('(1 + 2) * 3');
    expect(generateCode(parseExpression('10 - (4 - 3)'))).toBe('10 - (4 - 3)');
    expect(generateCode(parseExpression('8 / (4 * 2)'))).toBe('8 / (4 * 2)');
  });

  it('omits redundant parentheses', () => {
    expect(generateCode(parseExpression('(1 * 2) + 3'))).toBe('1 * 2 + 3');
    expect(generateCode(parseExpression('(10 - 4) - 3'))).toBe('10 - 4 - 3');
    expect(generateCode(parseExpression('1 + (2 * 3)'))).toBe('1 + 2 * 3');
  });

  it('marks unknown node types with a comment', () => {
    expect(generateCode({ type: 'WhileStatement' })).toBe('/* Unknown node: WhileStatement */');
  });

  it('throws a descriptive error for malformed nodes', () => {
    expect(() => generateCode({ type: 'BinaryExpression', value: '+', children: [lit(1)] })).toThrow(
      'Malformed BinaryExpression node: missing child at index 1'
    );
    expect(() => generateCode({ type: 'VariableDeclaration', value: 'let' })).toThrow(
      'Malformed VariableDeclaration node: missing child at index 0'
    );
    expect(() => generateCode({ type: 'MemberExpression', children: [id('a')] })).toThrow(
      'Malformed MemberExpression node: missing child at index 1'
    );
    expect(() => generateCode({ type: 'CallExpression', children: [] })).toThrow(
      'Malformed CallExpression node: missing child at index 0'
    );
  });

  it('compiles the playground sample end to end', () => {
    const source = 'let x = 10;\nlet y = 20;\nlet result = x + y * 2;\nconsole.log(result);';
    const output = generateCode(transformAST(parseToAST(source)));

    expect(output).toBe(source);
    expect(generateCode(transformAST(parseToAST('let area = 3 * (2 + 4);')))).toBe('let area = 18;');
  });
});

describe('arithmetic round-trip properties', () => {
  type Expr = { kind: 'num'; value: number } | { kind: 'bin'; op: '+' | '-' | '*' | '/'; left: Expr; right: Expr };

  const { expr } = fc.letrec<{ expr: Expr }>(tie => ({
    expr: fc.oneof(
      { depthSize: 'small', withCrossShrink: true },
      fc.record({ kind: fc.constant('num' as const), value: fc.integer({ min: 0, max: 999 }) }),
      fc.record({
        kind: fc.constant('bin' as const),
        op: fc.constantFrom('+' as const, '-' as const, '*' as const, '/' as const),
        left: tie('expr'),
        right: tie('expr'),
      })
    ),
  }));

  /** Render with every binary expression parenthesised. */
  const render = (node: Expr): string =>
    node.kind === 'num' ? String(node.value) : `(${render(node.left)} ${node.op} ${render(node.right)})`;

  const toAst = (node: Expr): ASTNode =>
    node.kind === 'num' ? lit(node.value) : bin(node.op, toAst(node.left), toAst(node.right));

  const sameNumber = (a: number, b: number) => Object.is(a, b) || a === b;

  it('parses fully parenthesised source into the expected AST', () => {
    fc.assert(
      fc.property(expr, node => {
        expect(parseExpression(render(node))).toEqual(toAst(node));
      }),
      { numRuns: 200 }
    );
  });

  it('generateCode output re-parses to the same AST and evaluates to the same value', () => {
    fc.assert(
      fc.property(expr, node => {
        const ast = toAst(node);
        const code = generateCode(ast);
        const reparsed = parseExpression(code);

        expect(reparsed).toEqual(ast);
        expect(sameNumber(evaluate(reparsed), evaluate(ast))).toBe(true);
      }),
      { numRuns: 300 }
    );
  });

  it('constant folding agrees with evaluation', () => {
    fc.assert(
      fc.property(expr, node => {
        const ast = toAst(node);
        const folded = transformAST(program(ast));

        expect(folded.children).toHaveLength(1);
        expect(folded.children![0]!.type).toBe('Literal');
        expect(sameNumber(folded.children![0]!.value as number, evaluate(ast))).toBe(true);
      }),
      { numRuns: 300 }
    );
  });
});
