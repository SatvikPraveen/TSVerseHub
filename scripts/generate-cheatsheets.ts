// scripts/generate-cheatsheets.ts

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CheatSheetSection {
  title: string;
  description: string;
  examples: CodeExample[];
  tips?: string[];
  relatedConcepts?: string[];
}

interface CodeExample {
  title: string;
  code: string;
  explanation: string;
  output?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface CheatSheetConfig {
  outputDir: string;
  formats: ('md' | 'html' | 'json')[];
  includeExercises: boolean;
  includeExamples: boolean;
  groupByDifficulty: boolean;
  addTableOfContents: boolean;
}

const DEFAULT_CONFIG: CheatSheetConfig = {
  outputDir: 'docs/generated-cheatsheets',
  formats: ['md', 'html'],
  includeExercises: true,
  includeExamples: true,
  groupByDifficulty: false,
  addTableOfContents: true
};

class CheatSheetGenerator {
  private config: CheatSheetConfig;
  private outputDir: string;
  private sections: CheatSheetSection[] = [];

  constructor(config: Partial<CheatSheetConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.outputDir = path.resolve(process.cwd(), this.config.outputDir);
  }

  async generate(): Promise<void> {
    console.log('📚 Generating TypeScript cheat sheets...');
    
    try {
      await this.initialize();
      await this.extractConceptData();
      await this.generateCheatSheets();
      
      console.log('✅ Cheat sheet generation completed!');
    } catch (error) {
      console.error('❌ Cheat sheet generation failed:', error);
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    console.log('🚀 Initialized output directory');
  }

  private async extractConceptData(): Promise<void> {
    console.log('🔍 Extracting concept data...');
    
    const conceptDirs = await glob('src/concepts/*/');
    
    for (const conceptDir of conceptDirs) {
      const conceptName = path.basename(conceptDir);
      const section = await this.processConceptDirectory(conceptDir, conceptName);
      if (section) {
        this.sections.push(section);
      }
    }
    
    console.log(`📊 Processed ${this.sections.length} concept sections`);
  }

  private async processConceptDirectory(conceptDir: string, conceptName: string): Promise<CheatSheetSection | null> {
    try {
      const examples: CodeExample[] = [];
      
      // Process all TypeScript files in the concept directory
      const tsFiles = await glob(path.join(conceptDir, '*.ts'));
      const tsxFiles = await glob(path.join(conceptDir, '*.tsx'));
      
      for (const file of [...tsFiles, ...tsxFiles]) {
        const fileName = path.basename(file, path.extname(file));
        if (fileName === 'index' || fileName === 'exercises' || fileName === 'demo') {
          const fileExamples = await this.extractExamplesFromFile(file, fileName);
          examples.push(...fileExamples);
        }
      }
      
      if (examples.length === 0) return null;
      
      return {
        title: this.formatConceptName(conceptName),
        description: this.getConceptDescription(conceptName),
        examples,
        tips: this.getConceptTips(conceptName),
        relatedConcepts: this.getRelatedConcepts(conceptName)
      };
    } catch (error) {
      console.warn(`⚠️ Failed to process ${conceptName}:`, error);
      return null;
    }
  }

  private async extractExamplesFromFile(filePath: string, fileName: string): Promise<CodeExample[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const examples: CodeExample[] = [];
    
    // Extract code blocks and comments
    const codeBlocks = this.parseCodeBlocks(content);
    
    codeBlocks.forEach((block, index) => {
      if (block.code.trim()) {
        examples.push({
          title: block.title || `${fileName} Example ${index + 1}`,
          code: block.code,
          explanation: block.explanation || this.generateExplanation(block.code),
          output: block.output,
          level: this.determineLevel(block.code)
        });
      }
    });
    
    return examples;
  }

  private parseCodeBlocks(content: string): Array<{
    title?: string;
    code: string;
    explanation?: string;
    output?: string;
  }> {
    const blocks: Array<{
      title?: string;
      code: string;
      explanation?: string;
      output?: string;
    }> = [];
    
    // Split by comments or function/class definitions
    const segments = content.split(/(?=\/\*\*|\/\/|export\s+(?:interface|type|class|function|const))/);
    
    segments.forEach(segment => {
      const trimmed = segment.trim();
      if (!trimmed) return;
      
      // Extract title from comment
      const titleMatch = trimmed.match(/^\s*\/\*\*\s*\n?\s*\*?\s*(.+?)(?:\n|\*\/)/);
      const singleLineCommentMatch = trimmed.match(/^\s*\/\/\s*(.+)/);
      
      const title = titleMatch?.[1] || singleLineCommentMatch?.[1];
      
      // Extract the actual code (remove comments)
      let code = trimmed
        .replace(/^\s*\/\*\*[\s\S]*?\*\/\s*\n?/, '') // Remove block comments
        .replace(/^\s*\/\/.*$/gm, '') // Remove single line comments
        .trim();
      
      if (code) {
        blocks.push({
          title,
          code,
          explanation: this.extractExplanationFromComments(trimmed)
        });
      }
    });
    
    return blocks;
  }

  private extractExplanationFromComments(content: string): string {
    const blockCommentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (blockCommentMatch) {
      return blockCommentMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line)
        .join(' ');
    }
    
    const singleLineComments = content.match(/\/\/\s*(.+)/g);
    if (singleLineComments) {
      return singleLineComments
        .map(comment => comment.replace(/^\s*\/\/\s*/, ''))
        .join(' ');
    }
    
    return '';
  }

  private generateExplanation(code: string): string {
    // Simple heuristics to generate explanations
    if (code.includes('interface ')) return 'Defines a TypeScript interface for type checking';
    if (code.includes('type ')) return 'Creates a type alias for reusable type definitions';
    if (code.includes('class ')) return 'Declares a TypeScript class with typed properties and methods';
    if (code.includes('function ')) return 'Defines a function with TypeScript type annotations';
    if (code.includes('const ') && code.includes(': ')) return 'Declares a typed constant variable';
    if (code.includes('enum ')) return 'Creates an enumeration of named constants';
    if (code.includes('namespace ')) return 'Defines a namespace to organize code';
    if (code.includes('generic') || code.includes('<T>')) return 'Uses TypeScript generics for reusable type-safe code';
    if (code.includes('extends ')) return 'Demonstrates inheritance or type extension';
    if (code.includes('implements ')) return 'Shows class implementation of an interface';
    
    return 'TypeScript code example demonstrating language features';
  }

  private determineLevel(code: string): 'beginner' | 'intermediate' | 'advanced' {
    // Simple heuristics to determine difficulty level
    let complexity = 0;
    
    if (code.includes('interface ') || code.includes('type ')) complexity += 1;
    if (code.includes('class ')) complexity += 1;
    if (code.includes('extends ') || code.includes('implements ')) complexity += 2;
    if (code.includes('<T>') || code.includes('generic')) complexity += 2;
    if (code.includes('conditional') || code.includes('mapped') || code.includes('infer')) complexity += 3;
    if (code.includes('decorator') || code.includes('@')) complexity += 2;
    if (code.includes('namespace ') || code.includes('module ')) complexity += 2;
    if (code.includes('keyof ') || code.includes('typeof ')) complexity += 2;
    if (code.includes('Promise') || code.includes('async')) complexity += 1;
    if (code.includes('Union') || code.includes('|')) complexity += 1;
    if (code.includes('Intersection') || code.includes('&')) complexity += 1;
    
    if (complexity <= 2) return 'beginner';
    if (complexity <= 5) return 'intermediate';
    return 'advanced';
  }

  private async generateCheatSheets(): Promise<void> {
    for (const format of this.config.formats) {
      await this.generateFormat(format);
    }
  }

  private async generateFormat(format: 'md' | 'html' | 'json'): Promise<void> {
    console.log(`📝 Generating ${format.toUpperCase()} cheat sheet...`);
    
    const fileName = `typescript-cheatsheet.${format}`;
    const outputPath = path.join(this.outputDir, fileName);
    
    let content: string;
    
    switch (format) {
      case 'md':
        content = await this.generateMarkdown();
        break;
      case 'html':
        content = await this.generateHTML();
        break;
      case 'json':
        content = JSON.stringify(this.sections, null, 2);
        break;
    }
    
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Generated ${fileName}`);
  }

  private async generateMarkdown(): Promise<string> {
    let markdown = '';
    
    // Header
    markdown += '# TypeScript Cheat Sheet\n\n';
    markdown += '> Comprehensive TypeScript reference generated from TSVerseHub concepts\n\n';
    markdown += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
    
    // Table of Contents
    if (this.config.addTableOfContents) {
      markdown += '## Table of Contents\n\n';
      this.sections.forEach((section, index) => {
        markdown += `${index + 1}. [${section.title}](#${this.slugify(section.title)})\n`;
      });
      markdown += '\n---\n\n';
    }
    
    // Sections
    this.sections.forEach(section => {
      markdown += `## ${section.title}\n\n`;
      
      if (section.description) {
        markdown += `${section.description}\n\n`;
      }
      
      // Examples grouped by level if requested
      if (this.config.groupByDifficulty) {
        const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
        
        levels.forEach(level => {
          const levelExamples = section.examples.filter(ex => ex.level === level);
          if (levelExamples.length > 0) {
            markdown += `### ${this.capitalizeFirst(level)} Level\n\n`;
            levelExamples.forEach(example => {
              markdown += this.formatExampleMarkdown(example);
            });
          }
        });
      } else {
        section.examples.forEach(example => {
          markdown += this.formatExampleMarkdown(example);
        });
      }
      
      // Tips
      if (section.tips && section.tips.length > 0) {
        markdown += `### 💡 Tips\n\n`;
        section.tips.forEach(tip => {
          markdown += `- ${tip}\n`;
        });
        markdown += '\n';
      }
      
      // Related Concepts
      if (section.relatedConcepts && section.relatedConcepts.length > 0) {
        markdown += `### 🔗 Related Concepts\n\n`;
        section.relatedConcepts.forEach(concept => {
          markdown += `- ${concept}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });
    
    // Footer
    markdown += '## Additional Resources\n\n';
    markdown += '- [TypeScript Handbook](https://www.typescriptlang.org/docs/)\n';
    markdown += '- [TSVerseHub](https://tsversehub.dev) - Interactive TypeScript Learning\n';
    markdown += '- [TypeScript Playground](https://www.typescriptlang.org/play)\n\n';
    markdown += '*This cheat sheet was automatically generated from TSVerseHub concept modules.*\n';
    
    return markdown;
  }

  private formatExampleMarkdown(example: CodeExample): string {
    let md = '';
    
    md += `### ${example.title}\n\n`;
    
    if (example.explanation) {
      md += `${example.explanation}\n\n`;
    }
    
    md += '```typescript\n';
    md += example.code;
    md += '\n```\n\n';
    
    if (example.output) {
      md += '**Output:**\n```\n';
      md += example.output;
      md += '\n```\n\n';
    }
    
    md += `*Level: ${example.level}*\n\n`;
    
    return md;
  }

  private async generateHTML(): Promise<string> {
    const markdown = await this.generateMarkdown();
    
    // Convert markdown to HTML (simplified - in real scenario use marked or similar)
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Cheat Sheet</title>
    <style>
        ${this.getHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        ${this.convertMarkdownToHTML(markdown)}
    </div>
</body>
</html>`;
    
    return html;
  }

  private convertMarkdownToHTML(markdown: string): string {
    // Simplified markdown to HTML conversion
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\*(.+)\*$/gm, '<em>$1</em>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/```typescript\n([\s\S]*?)\n```/g, '<pre><code class="typescript">$1</code></pre>')
      .replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.)/gm, '<p>$1')
      .replace(/$/m, '</p>');
  }

  private getHTMLStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3 {
            color: #2563eb;
            margin: 20px 0 10px 0;
        }
        
        h1 { font-size: 2.5rem; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        h3 { font-size: 1.5rem; }
        
        p { margin: 10px 0; }
        
        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            border-left: 4px solid #2563eb;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        blockquote {
            background: #f8f9fa;
            border-left: 4px solid #2563eb;
            padding: 15px 20px;
            margin: 15px 0;
            font-style: italic;
        }
        
        ul {
            margin: 10px 0 10px 20px;
        }
        
        li {
            margin: 5px 0;
        }
        
        .level-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .level-beginner { background: #22c55e; color: white; }
        .level-intermediate { background: #f59e0b; color: white; }
        .level-advanced { background: #ef4444; color: white; }
        
        hr {
            border: none;
            height: 2px;
            background: #e5e7eb;
            margin: 30px 0;
        }
    `;
  }

  // Utility methods
  private formatConceptName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getConceptDescription(conceptName: string): string {
    const descriptions: Record<string, string> = {
      'basics': 'Fundamental TypeScript concepts including variables, functions, and basic types.',
      'advanced-types': 'Advanced type system features like conditional types, mapped types, and template literals.',
      'generics': 'Generic programming concepts for creating reusable, type-safe components.',
      'decorators': 'Decorator pattern implementation for metadata and aspect-oriented programming.',
      'compiler-api': 'TypeScript compiler API for AST manipulation and custom tooling.',
      'patterns': 'Common design patterns implemented with TypeScript features.',
      'namespaces-modules': 'Code organization using namespaces and ES modules.',
      'tsconfig': 'TypeScript configuration and compiler options.'
    };
    
    return descriptions[conceptName] || `Comprehensive guide to ${this.formatConceptName(conceptName)} in TypeScript.`;
  }

  private getConceptTips(conceptName: string): string[] {
    const tips: Record<string, string[]> = {
      'basics': [
        'Always enable strict mode in tsconfig.json for better type safety',
        'Use interfaces for object shapes and type aliases for unions',
        'Prefer const assertions for immutable data'
      ],
      'advanced-types': [
        'Use conditional types sparingly to avoid complex type definitions',
        'Template literal types are powerful for creating precise string types',
        'Mapped types help create variations of existing types'
      ],
      'generics': [
        'Use meaningful constraint names like <T extends User>',
        'Generic defaults can simplify API usage',
        'Utility types like Partial<T> are built with generics'
      ]
    };
    
    return tips[conceptName] || [];
  }

  private getRelatedConcepts(conceptName: string): string[] {
    const relations: Record<string, string[]> = {
      'basics': ['Advanced Types', 'Generics', 'TSConfig'],
      'advanced-types': ['Generics', 'Compiler API', 'Basics'],
      'generics': ['Advanced Types', 'Patterns', 'Basics'],
      'decorators': ['Patterns', 'Compiler API'],
      'compiler-api': ['Advanced Types', 'Decorators'],
      'patterns': ['Generics', 'Decorators', 'Advanced Types']
    };
    
    return relations[conceptName] || [];
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const config: Partial<CheatSheetConfig> = {};
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    switch (arg) {
      case '--output':
        config.outputDir = args[index + 1];
        break;
      case '--format':
        const formats = args[index + 1].split(',') as ('md' | 'html' | 'json')[];
        config.formats = formats;
        break;
      case '--no-exercises':
        config.includeExercises = false;
        break;
      case '--no-examples':
        config.includeExamples = false;
        break;
      case '--group-by-difficulty':
        config.groupByDifficulty = true;
        break;
      case '--no-toc':
        config.addTableOfContents = false;
        break;
    }
  });

  console.log('📚 Starting cheat sheet generation...');
  if (Object.keys(config).length > 0) {
    console.log('🔧 Custom configuration:', config);
  }
  
  const generator = new CheatSheetGenerator(config);
  
  try {
    await generator.generate();
    console.log('\n✅ Cheat sheet generation completed successfully!');
  } catch (error) {
    console.error('💥 Generation failed:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export { CheatSheetGenerator, DEFAULT_CONFIG };
export type { CheatSheetSection, CodeExample, CheatSheetConfig };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}