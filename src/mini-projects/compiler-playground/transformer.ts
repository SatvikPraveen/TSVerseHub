// File: mini-projects/compiler-playground/transformer.ts

import { ASTNode } from './ASTViewer';

// Token types for lexical analysis
enum TokenType {
  LET = 'LET',
  CONST = 'CONST',
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  ASSIGN = 'ASSIGN',
  SEMICOLON = 'SEMICOLON',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  DOT = 'DOT',
  CONSOLE = 'CONSOLE',
  LOG = 'LOG',
  EOF = 'EOF',
  COMMENT = 'COMMENT'
}

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private peek(offset: number = 0): string {
    const pos = this.position + offset;
    return pos >= this.input.length ? '\0' : this.input[pos];
  }

  private advance(): string {
    const char = this.peek();
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  private readNumber(): string {
    let value = '';
    while (/[\d.]/.test(this.peek())) {
      value += this.advance();
    }
    return value;
  }

  private readIdentifier(): string {
    let value = '';
    while (/[a-zA-Z_$][\w$]*/.test(this.peek()) || /\w/.test(this.peek())) {
      value += this.advance();
    }
    return value;
  }

  private readString(quote: string): string {
    let value = '';
    this.advance(); // Skip opening quote
    while (this.peek() !== quote && this.peek() !== '\0') {
      value += this.advance();
    }
    if (this.peek() === quote) {
      this.advance(); // Skip closing quote
    }
    return value;
  }

  private readComment(): string {
    let value = '';
    this.advance(); // Skip first /
    this.advance(); // Skip second /
    while (this.peek() !== '\n' && this.peek() !== '\0') {
      value += this.advance();
    }
    return value;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.position >= this.input.length) break;

      const char = this.peek();
      const line = this.line;
      const column = this.column;

      if (char === '/' && this.peek(1) === '/') {
        const value = this.readComment();
        tokens.push({ type: TokenType.COMMENT, value, line, column });
        continue;
      }

      if (/\d/.test(char)) {
        const value = this.readNumber();
        tokens.push({ type: TokenType.NUMBER, value, line, column });
        continue;
      }

      if (/[a-zA-Z_$]/.test(char)) {
        const value = this.readIdentifier();
        let type: TokenType = TokenType.IDENTIFIER;

        switch (value) {
          case 'let': type = TokenType.LET; break;
          case 'const': type = TokenType.CONST; break;
          case 'console': type = TokenType.CONSOLE; break;
          case 'log': type = TokenType.LOG; break;
        }

        tokens.push({ type, value, line, column });
        continue;
      }

      if (char === '"' || char === "'") {
        const value = this.readString(char);
        tokens.push({ type: TokenType.STRING, value, line, column });
        continue;
      }

      // Single character tokens
      switch (char) {
        case '=':
          tokens.push({ type: TokenType.ASSIGN, value: char, line, column });
          break;
        case ';':
          tokens.push({ type: TokenType.SEMICOLON, value: char, line, column });
          break;
        case '+':
          tokens.push({ type: TokenType.PLUS, value: char, line, column });
          break;
        case '-':
          tokens.push({ type: TokenType.MINUS, value: char, line, column });
          break;
        case '*':
          tokens.push({ type: TokenType.MULTIPLY, value: char, line, column });
          break;
        case '/':
          tokens.push({ type: TokenType.DIVIDE, value: char, line, column });
          break;
        case '(':
          tokens.push({ type: TokenType.LPAREN, value: char, line, column });
          break;
        case ')':
          tokens.push({ type: TokenType.RPAREN, value: char, line, column });
          break;
        case '.':
          tokens.push({ type: TokenType.DOT, value: char, line, column });
          break;
        default:
          throw new Error(`Unexpected character: ${char} at line ${line}, column ${column}`);
      }

      this.advance();
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
}

class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new Error(`${message} at line ${token.line}, column ${token.column}`);
  }

  parse(): ASTNode {
    const statements: ASTNode[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.COMMENT)) {
        this.advance(); // Skip comments
        continue;
      }
      
      const stmt = this.statement();
      if (stmt) statements.push(stmt);
    }

    return {
      type: 'Program',
      children: statements
    };
  }

  private statement(): ASTNode | null {
    if (this.match(TokenType.LET, TokenType.CONST)) {
      return this.variableDeclaration();
    }

    if (this.check(TokenType.CONSOLE)) {
      return this.consoleStatement();
    }

    return this.expressionStatement();
  }

  private variableDeclaration(): ASTNode {
    const kind = this.tokens[this.current - 1].value;
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    
    this.consume(TokenType.ASSIGN, "Expected '=' after variable name");
    
    const init = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");

    return {
      type: 'VariableDeclaration',
      value: kind,
      children: [
        { type: 'Identifier', value: name },
        init
      ]
    };
  }

  private consoleStatement(): ASTNode {
    this.consume(TokenType.CONSOLE, "Expected 'console'");
    this.consume(TokenType.DOT, "Expected '.'");
    this.consume(TokenType.LOG, "Expected 'log'");
    this.consume(TokenType.LPAREN, "Expected '('");
    
    const args: ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.SEMICOLON)); // Allow comma separation in future
    }
    
    this.consume(TokenType.RPAREN, "Expected ')'");
    this.consume(TokenType.SEMICOLON, "Expected ';'");

    return {
      type: 'CallExpression',
      children: [
        {
          type: 'MemberExpression',
          children: [
            { type: 'Identifier', value: 'console' },
            { type: 'Identifier', value: 'log' }
          ]
        },
        ...args
      ]
    };
  }

  private expressionStatement(): ASTNode {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after expression");
    return expr;
  }

  private expression(): ASTNode {
    return this.additive();
  }

  private additive(): ASTNode {
    let expr = this.multiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.multiplicative();
      expr = {
        type: 'BinaryExpression',
        value: operator,
        children: [expr, right]
      };
    }

    return expr;
  }

  private multiplicative(): ASTNode {
    let expr = this.primary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.primary();
      expr = {
        type: 'BinaryExpression',
        value: operator,
        children: [expr, right]
      };
    }

    return expr;
  }

  private primary(): ASTNode {
    if (this.match(TokenType.NUMBER)) {
      const value = parseFloat(this.tokens[this.current - 1].value);
      return { type: 'Literal', value };
    }

    if (this.match(TokenType.STRING)) {
      const value = this.tokens[this.current - 1].value;
      return { type: 'Literal', value };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.tokens[this.current - 1].value;
      return { type: 'Identifier', value: name };
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    const token = this.peek();
    throw new Error(`Unexpected token: ${token.value} at line ${token.line}, column ${token.column}`);
  }
}

// Main export functions
export function parseToAST(source: string): ASTNode {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  
  const parser = new Parser(tokens);
  return parser.parse();
}

export function transformAST(ast: ASTNode): ASTNode {
  // Simple optimization transformations
  return optimizeAST(ast);
}

function optimizeAST(node: ASTNode): ASTNode {
  if (!node.children) return node;

  // Optimize children first
  const optimizedChildren = node.children.map(child => optimizeAST(child));

  // Constant folding for binary expressions
  if (node.type === 'BinaryExpression' && 
      optimizedChildren.length === 2 &&
      optimizedChildren[0].type === 'Literal' &&
      optimizedChildren[1].type === 'Literal') {
    
    const left = optimizedChildren[0].value as number;
    const right = optimizedChildren[1].value as number;
    const operator = node.value as string;

    let result: number;
    switch (operator) {
      case '+': result = left + right; break;
      case '-': result = left - right; break;
      case '*': result = left * right; break;
      case '/': result = left / right; break;
      default: return { ...node, children: optimizedChildren };
    }

    return { type: 'Literal', value: result };
  }

  return { ...node, children: optimizedChildren };
}

export function generateCode(ast: ASTNode): string {
  switch (ast.type) {
    case 'Program':
      return ast.children?.map(child => generateCode(child)).join('\n') || '';
    
    case 'VariableDeclaration':
      const kind = ast.value;
      const identifier = generateCode(ast.children![0]);
      const init = generateCode(ast.children![1]);
      return `${kind} ${identifier} = ${init};`;
    
    case 'CallExpression':
      const callee = generateCode(ast.children![0]);
      const args = ast.children!.slice(1).map(arg => generateCode(arg)).join(', ');
      return `${callee}(${args});`;
    
    case 'MemberExpression':
      const object = generateCode(ast.children![0]);
      const property = generateCode(ast.children![1]);
      return `${object}.${property}`;
    
    case 'BinaryExpression':
      const left = generateCode(ast.children![0]);
      const operator = ast.value;
      const right = generateCode(ast.children![1]);
      return `${left} ${operator} ${right}`;
    
    case 'Identifier':
      return ast.value as string;
    
    case 'Literal':
      return typeof ast.value === 'string' ? `"${ast.value}"` : String(ast.value);
    
    default:
      return `/* Unknown node: ${ast.type} */`;
  }
}