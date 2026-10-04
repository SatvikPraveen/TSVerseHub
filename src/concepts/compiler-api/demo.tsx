// File location: src/data/concepts/compiler-api/demo.tsx

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/Tabs';
import { 
  Play, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Zap,
  Settings,
  Eye,
  Download
} from 'lucide-react';

// ===== Lightweight presentational helpers (local to this demo) =====

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${className}`}>{children}</h2>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}>{children}</p>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-600 text-white',
  secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100',
  outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
  destructive: 'bg-red-600 text-white',
};

const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant; className?: string }> = ({
  children,
  variant = 'default',
  className = '',
}) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeVariantClasses[variant]} ${className}`}>
    {children}
  </span>
);

type AlertVariant = 'default' | 'destructive';

const alertVariantClasses: Record<AlertVariant, string> = {
  default: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200',
  destructive: 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
};

const Alert: React.FC<{ children: React.ReactNode; variant?: AlertVariant; className?: string }> = ({
  children,
  variant = 'default',
  className = '',
}) => (
  <div role="alert" className={`rounded-lg border p-4 flex items-start gap-2 ${alertVariantClasses[variant]} ${className}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm">{children}</div>
);

const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-slate-200 dark:border-slate-700 ${className}`} />
);

const ScrollArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

interface DiagnosticInfo {
  line: number;
  column: number;
  message: string;
  category: 'error' | 'warning' | 'info';
  code: number;
}

interface TransformationResult {
  javascript: string;
  sourceMap?: string;
  diagnostics: DiagnosticInfo[];
  optimizations?: string[];
}

interface ASTNodeInfo {
  kind: string;
  text: string;
  line: number;
  column: number;
  children: ASTNodeInfo[];
}

interface FunctionComplexity {
  name: string;
  complexity: number;
}

interface CodeAnalysis {
  complexity: {
    total: number;
    functions: FunctionComplexity[];
  };
  metrics: {
    lines: number;
    characters: number;
    functions: number;
    classes: number;
    interfaces: number;
  };
  dependencies: string[];
}

const CompilerAPIDemo: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(`interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];

  async addUser(user: User): Promise<void> {
    this.users.push(user);
    console.log(\`Added user: \${user.name}\`);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  get userCount(): number {
    return this.users.length;
  }
}

const service = new UserService();
service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });`);

  const [activeTab, setActiveTab] = useState('ast');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    ast: ASTNodeInfo | null;
    diagnostics: DiagnosticInfo[];
    transpilation: TransformationResult | null;
    analysis: CodeAnalysis | null;
  }>({
    ast: null,
    diagnostics: [],
    transpilation: null,
    analysis: null
  });

  // Simulate TypeScript AST parsing
  const parseAST = useCallback(async (code: string): Promise<ASTNodeInfo> => {
    // This would typically use the TypeScript compiler API
    // For demo purposes, we'll simulate the AST structure
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      kind: 'SourceFile',
      text: code.substring(0, 50) + '...',
      line: 1,
      column: 1,
      children: [
        {
          kind: 'InterfaceDeclaration',
          text: 'interface User',
          line: 1,
          column: 1,
          children: [
            {
              kind: 'PropertySignature',
              text: 'id: number',
              line: 2,
              column: 3,
              children: []
            },
            {
              kind: 'PropertySignature', 
              text: 'name: string',
              line: 3,
              column: 3,
              children: []
            },
            {
              kind: 'PropertySignature',
              text: 'email?: string',
              line: 4,
              column: 3,
              children: []
            }
          ]
        },
        {
          kind: 'ClassDeclaration',
          text: 'class UserService',
          line: 7,
          column: 1,
          children: [
            {
              kind: 'PropertyDeclaration',
              text: 'private users: User[]',
              line: 8,
              column: 3,
              children: []
            },
            {
              kind: 'MethodDeclaration',
              text: 'async addUser(...)',
              line: 10,
              column: 3,
              children: []
            }
          ]
        }
      ]
    };
  }, []);

  // Simulate diagnostic analysis
  const analyzeDiagnostics = useCallback(async (code: string): Promise<DiagnosticInfo[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const diagnostics: DiagnosticInfo[] = [];
    
    // Simulate finding console.log (custom linter rule)
    if (code.includes('console.log')) {
      diagnostics.push({
        line: 12,
        column: 5,
        message: "Console 'log' statement is not allowed. Consider using a proper logging library.",
        category: 'warning',
        code: 9001
      });
    }

    // Simulate unused variable detection
    if (code.includes('const unused')) {
      diagnostics.push({
        line: 15,
        column: 7,
        message: "Variable 'unused' is declared but never used.",
        category: 'error',
        code: 6196
      });
    }

    return diagnostics;
  }, []);

  // Simulate transpilation
  const transpileCode = useCallback(async (code: string): Promise<TransformationResult> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate JavaScript output
    const javascript = `var UserService = /** @class */ (function () {
    function UserService() {
        this.users = [];
    }
    UserService.prototype.addUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.users.push(user);
                console.log("Added user: " + user.name);
                return [2 /*return*/];
            });
        });
    };
    UserService.prototype.findById = function (id) {
        var _this = this;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.find(function (u) { return u.id === id; })];
            });
        });
    };
    Object.defineProperty(UserService.prototype, "userCount", {
        get: function () {
            return this.users.length;
        },
        enumerable: false,
        configurable: true
    });
    return UserService;
}());
var service = new UserService();
service.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });`;

    const sourceMap = `{"version":3,"file":"demo.js","sourceRoot":"","sources":["demo.ts"],"names":[],"mappings":"AAAA,SAAS,IAAI;EAAE,CAAC"}`;

    return {
      javascript,
      sourceMap,
      diagnostics: await analyzeDiagnostics(code),
      optimizations: [
        'Dead code elimination applied',
        'Constant folding performed',
        '2 unused variables removed'
      ]
    };
  }, [analyzeDiagnostics]);

  // Simulate code analysis
  const analyzeCode = useCallback(async (code: string): Promise<CodeAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      complexity: {
        total: 8,
        functions: [
          { name: 'addUser', complexity: 2 },
          { name: 'findById', complexity: 3 }
        ]
      },
      metrics: {
        lines: code.split('\n').length,
        characters: code.length,
        functions: 2,
        classes: 1,
        interfaces: 1
      },
      dependencies: [
        'No external dependencies detected'
      ]
    };
  }, []);

  const runAnalysis = async () => {
    setIsProcessing(true);
    
    try {
      const [ast, diagnostics, transpilation, analysis] = await Promise.all([
        parseAST(sourceCode),
        analyzeDiagnostics(sourceCode),
        transpileCode(sourceCode),
        analyzeCode(sourceCode)
      ]);

      setResults({
        ast,
        diagnostics,
        transpilation,
        analysis
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderASTNode = (node: ASTNodeInfo, depth = 0) => (
    <div key={`${node.kind}-${node.line}-${node.column}`} style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-1">
        <Badge variant="outline" className="text-xs">
          {node.kind}
        </Badge>
        <span className="text-sm font-mono">{node.text}</span>
        <span className="text-xs text-muted-foreground">
          ({node.line}:{node.column})
        </span>
      </div>
      {node.children.map(child => renderASTNode(child, depth + 1))}
    </div>
  );

  const getDiagnosticIcon = (category: string) => {
    switch (category) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const exampleCodes = [
    {
      name: 'Basic Class',
      code: `class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}`
    },
    {
      name: 'Async Function',
      code: `async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`
    },
    {
      name: 'Complex Interface',
      code: `interface APIResponse<T> {
  data: T;
  status: 'success' | 'error';
  pagination?: {
    page: number;
    total: number;
  };
}`
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            TypeScript Compiler API Demo
          </CardTitle>
          <CardDescription>
            Explore AST parsing, diagnostics, transpilation, and code analysis using the TypeScript Compiler API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">TypeScript Source Code</label>
                <div className="flex gap-2">
                  {exampleCodes.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setSourceCode(example.code)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
                placeholder="Enter TypeScript code here..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runAnalysis} 
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Settings className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isProcessing ? 'Processing...' : 'Analyze Code'}
              </Button>
              
              <Button variant="outline" onClick={() => setSourceCode('')}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(results.ast || results.diagnostics.length > 0 || results.transpilation || results.analysis) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabList className="grid w-full grid-cols-4">
                <Tab value="ast" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  AST
                </Tab>
                <Tab value="diagnostics" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Diagnostics
                  {results.diagnostics.length > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {results.diagnostics.length}
                    </Badge>
                  )}
                </Tab>
                <Tab value="transpilation" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Transpilation
                </Tab>
                <Tab value="analysis" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Analysis
                </Tab>
              </TabList>

              <TabPanels>

              <TabPanel value="ast" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Abstract Syntax Tree</h3>
                  {results.ast ? (
                    <ScrollArea className="h-[400px] border rounded-lg p-4">
                      {renderASTNode(results.ast)}
                    </ScrollArea>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Run the analysis to see the AST structure
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabPanel>

              <TabPanel value="diagnostics" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Diagnostics & Linting</h3>
                  {results.diagnostics.length > 0 ? (
                    <div className="space-y-2">
                      {results.diagnostics.map((diagnostic, index) => (
                        <Alert key={index} variant={diagnostic.category === 'error' ? 'destructive' : 'default'}>
                          <div className="flex items-start gap-2">
                            {getDiagnosticIcon(diagnostic.category)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  TS{diagnostic.code}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Line {diagnostic.line}, Column {diagnostic.column}
                                </span>
                              </div>
                              <AlertDescription>
                                {diagnostic.message}
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        No diagnostic issues found!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabPanel>

              <TabPanel value="transpilation" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">JavaScript Output</h3>
                  {results.transpilation ? (
                    <div className="space-y-4">
                      {results.transpilation.optimizations && (
                        <div>
                          <h4 className="font-medium mb-2">Optimizations Applied</h4>
                          <div className="flex flex-wrap gap-2">
                            {results.transpilation.optimizations.map((opt, index) => (
                              <Badge key={index} variant="secondary">
                                {opt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Generated JavaScript</h4>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                            {results.transpilation.javascript}
                          </pre>
                        </ScrollArea>
                      </div>

                      {results.transpilation.sourceMap && (
                        <div>
                          <h4 className="font-medium mb-2">Source Map</h4>
                          <ScrollArea className="h-[100px]">
                            <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto">
                              {results.transpilation.sourceMap}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Run the analysis to see the transpilation output
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabPanel>

              <TabPanel value="analysis" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Code Analysis</h3>
                  {results.analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Code Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Lines of Code:</span>
                              <Badge variant="outline">{results.analysis.metrics.lines}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Characters:</span>
                              <Badge variant="outline">{results.analysis.metrics.characters}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Functions:</span>
                              <Badge variant="outline">{results.analysis.metrics.functions}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Classes:</span>
                              <Badge variant="outline">{results.analysis.metrics.classes}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Interfaces:</span>
                              <Badge variant="outline">{results.analysis.metrics.interfaces}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Complexity Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Complexity:</span>
                              <Badge variant={results.analysis.complexity.total > 10 ? "destructive" : "secondary"}>
                                {results.analysis.complexity.total}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                              {results.analysis.complexity.functions.map((func, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{func.name}():</span>
                                  <Badge variant={func.complexity > 5 ? "destructive" : "outline"}>
                                    {func.complexity}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Run the analysis to see detailed code metrics
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabPanel>
              </TabPanels>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About This Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This demo simulates the TypeScript Compiler API functionality. In a real implementation, you would:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use <code>ts.createSourceFile()</code> to parse TypeScript code into an AST</li>
              <li>Use <code>ts.createProgram()</code> and type checker for semantic analysis</li>
              <li>Create custom transformers for code modifications</li>
              <li>Use <code>program.emit()</code> for transpilation with source maps</li>
              <li>Build custom diagnostic rules and linters</li>
            </ul>
            <p className="mt-4">
              The TypeScript Compiler API is the foundation for tools like TSLint, ESLint TypeScript parser, 
              ts-loader, and many other TypeScript tooling solutions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompilerAPIDemo;