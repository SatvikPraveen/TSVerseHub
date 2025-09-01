// scripts/export-pdf.ts

import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { glob } from 'glob';

interface PDFExportOptions {
  outputDir: string;
  format: 'A4' | 'Letter' | 'Legal';
  includeCheatSheets: boolean;
  includeConcepts: boolean;
  includeProjects: boolean;
  theme: 'light' | 'dark';
  watermark?: string;
  headerFooter: boolean;
}

interface ExportResult {
  fileName: string;
  path: string;
  size: number;
  pageCount: number;
  success: boolean;
  error?: string;
}

interface ConceptModule {
  name: string;
  path: string;
  content: string;
  exercises: string;
  demo: string;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  outputDir: 'dist/pdf-exports',
  format: 'A4',
  includeCheatSheets: true,
  includeConcepts: true,
  includeProjects: true,
  theme: 'light',
  headerFooter: true
};

class PDFExporter {
  private options: PDFExportOptions;
  private browser?: puppeteer.Browser;
  private outputDir: string;

  constructor(options: Partial<PDFExportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.outputDir = path.resolve(process.cwd(), this.options.outputDir);
  }

  async export(): Promise<ExportResult[]> {
    console.log('📄 Starting PDF export process...');
    
    try {
      await this.initialize();
      const results = await this.generateAllPDFs();
      await this.generateMasterPDF(results);
      await this.cleanup();
      
      console.log('✅ PDF export completed successfully!');
      return results;
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    console.log('🚀 Browser initialized');
  }

  private async generateAllPDFs(): Promise<ExportResult[]> {
    const results: ExportResult[] = [];

    if (this.options.includeCheatSheets) {
      const cheatSheetResult = await this.generateCheatSheetPDF();
      results.push(cheatSheetResult);
    }

    if (this.options.includeConcepts) {
      const conceptResults = await this.generateConceptPDFs();
      results.push(...conceptResults);
    }

    if (this.options.includeProjects) {
      const projectResults = await this.generateProjectPDFs();
      results.push(...projectResults);
    }

    return results;
  }

  private async generateCheatSheetPDF(): Promise<ExportResult> {
    console.log('📋 Generating TypeScript cheat sheet PDF...');
    
    try {
      const cheatSheetPath = path.join('docs', 'ts-cheatsheet.md');
      const content = await this.loadMarkdownContent(cheatSheetPath);
      const html = await this.convertToHTML(content, 'TypeScript Cheat Sheet');
      
      const fileName = 'typescript-cheatsheet.pdf';
      const outputPath = path.join(this.outputDir, fileName);
      
      const page = await this.browser!.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: outputPath,
        format: this.options.format,
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: this.options.headerFooter,
        headerTemplate: this.getHeaderTemplate('TypeScript Cheat Sheet'),
        footerTemplate: this.getFooterTemplate()
      });

      await page.close();

      const stats = fs.statSync(outputPath);
      return {
        fileName,
        path: outputPath,
        size: stats.size,
        pageCount: await this.getPageCount(outputPath),
        success: true
      };
    } catch (error) {
      return {
        fileName: 'typescript-cheatsheet.pdf',
        path: '',
        size: 0,
        pageCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateConceptPDFs(): Promise<ExportResult[]> {
    console.log('🧠 Generating concept PDFs...');
    
    const results: ExportResult[] = [];
    const conceptDirs = await glob('src/concepts/*/');
    
    for (const conceptDir of conceptDirs) {
      const conceptName = path.basename(conceptDir);
      console.log(`   📖 Processing ${conceptName}...`);
      
      try {
        const concept = await this.loadConcept(conceptDir);
        const html = await this.generateConceptHTML(concept);
        
        const fileName = `concept-${conceptName}.pdf`;
        const outputPath = path.join(this.outputDir, fileName);
        
        const page = await this.browser!.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        await page.pdf({
          path: outputPath,
          format: this.options.format,
          printBackground: true,
          margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
          displayHeaderFooter: this.options.headerFooter,
          headerTemplate: this.getHeaderTemplate(`TypeScript: ${this.formatConceptName(conceptName)}`),
          footerTemplate: this.getFooterTemplate()
        });

        await page.close();

        const stats = fs.statSync(outputPath);
        results.push({
          fileName,
          path: outputPath,
          size: stats.size,
          pageCount: await this.getPageCount(outputPath),
          success: true
        });
      } catch (error) {
        results.push({
          fileName: `concept-${conceptName}.pdf`,
          path: '',
          size: 0,
          pageCount: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  private async generateProjectPDFs(): Promise<ExportResult[]> {
    console.log('🚀 Generating mini-project PDFs...');
    
    const results: ExportResult[] = [];
    const projectDirs = await glob('src/mini-projects/*/');
    
    for (const projectDir of projectDirs) {
      const projectName = path.basename(projectDir);
      console.log(`   🔧 Processing ${projectName}...`);
      
      try {
        const projectContent = await this.loadProject(projectDir);
        const html = await this.generateProjectHTML(projectContent, projectName);
        
        const fileName = `project-${projectName}.pdf`;
        const outputPath = path.join(this.outputDir, fileName);
        
        const page = await this.browser!.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        await page.pdf({
          path: outputPath,
          format: this.options.format,
          printBackground: true,
          margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
          displayHeaderFooter: this.options.headerFooter,
          headerTemplate: this.getHeaderTemplate(`Mini Project: ${this.formatConceptName(projectName)}`),
          footerTemplate: this.getFooterTemplate()
        });

        await page.close();

        const stats = fs.statSync(outputPath);
        results.push({
          fileName,
          path: outputPath,
          size: stats.size,
          pageCount: await this.getPageCount(outputPath),
          success: true
        });
      } catch (error) {
        results.push({
          fileName: `project-${projectName}.pdf`,
          path: '',
          size: 0,
          pageCount: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  private async generateMasterPDF(results: ExportResult[]): Promise<void> {
    console.log('📚 Generating master PDF...');
    
    const successfulResults = results.filter(r => r.success);
    const totalPages = successfulResults.reduce((sum, r) => sum + r.pageCount, 0);
    const totalSize = successfulResults.reduce((sum, r) => sum + r.size, 0);
    
    const tocContent = this.generateTableOfContents(successfulResults);
    const statsContent = this.generateExportStats(successfulResults, totalPages, totalSize);
    
    const html = await this.convertToHTML(
      `# TSVerseHub - Complete Learning Materials\n\n${tocContent}\n\n${statsContent}`,
      'TSVerseHub Complete Guide'
    );
    
    const fileName = 'tsversehub-complete.pdf';
    const outputPath = path.join(this.outputDir, fileName);
    
    const page = await this.browser!.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: this.options.format,
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      displayHeaderFooter: this.options.headerFooter,
      headerTemplate: this.getHeaderTemplate('TSVerseHub - Complete Learning Materials'),
      footerTemplate: this.getFooterTemplate()
    });

    await page.close();
    console.log(`✅ Master PDF generated: ${fileName}`);
  }

  private async loadMarkdownContent(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Markdown file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async loadConcept(conceptDir: string): Promise<ConceptModule> {
    const indexPath = path.join(conceptDir, 'index.ts');
    const exercisesPath = path.join(conceptDir, 'exercises.ts');
    const demoPath = path.join(conceptDir, 'demo.tsx');
    
    const name = path.basename(conceptDir);
    
    return {
      name,
      path: conceptDir,
      content: fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf-8') : '',
      exercises: fs.existsSync(exercisesPath) ? fs.readFileSync(exercisesPath, 'utf-8') : '',
      demo: fs.existsSync(demoPath) ? fs.readFileSync(demoPath, 'utf-8') : ''
    };
  }

  private async loadProject(projectDir: string): Promise<Record<string, string>> {
    const files = await glob(path.join(projectDir, '**/*.{ts,tsx}'));
    const content: Record<string, string> = {};
    
    for (const file of files) {
      const relativePath = path.relative(projectDir, file);
      content[relativePath] = fs.readFileSync(file, 'utf-8');
    }
    
    return content;
  }

  private async convertToHTML(markdown: string, title: string): Promise<string> {
    const htmlContent = marked(markdown);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${this.getBaseStyles()}
        ${this.options.theme === 'dark' ? this.getDarkStyles() : ''}
        ${this.options.watermark ? this.getWatermarkStyles() : ''}
    </style>
</head>
<body>
    ${this.options.watermark ? `<div class="watermark">${this.options.watermark}</div>` : ''}
    <div class="content">
        ${htmlContent}
    </div>
</body>
</html>`;
  }

  private async generateConceptHTML(concept: ConceptModule): Promise<string> {
    const markdown = `
# TypeScript Concept: ${this.formatConceptName(concept.name)}

## Overview
This module covers ${concept.name} in TypeScript.

## Code Examples

\`\`\`typescript
${concept.content}
\`\`\`

## Exercises

\`\`\`typescript
${concept.exercises}
\`\`\`

## Demo Implementation

\`\`\`tsx
${concept.demo}
\`\`\`
`;
    
    return this.convertToHTML(markdown, `TypeScript: ${this.formatConceptName(concept.name)}`);
  }

  private async generateProjectHTML(projectContent: Record<string, string>, projectName: string): Promise<string> {
    let markdown = `# Mini Project: ${this.formatConceptName(projectName)}\n\n`;
    
    Object.entries(projectContent).forEach(([fileName, content]) => {
      const extension = path.extname(fileName).slice(1);
      markdown += `## ${fileName}\n\n\`\`\`${extension}\n${content}\n\`\`\`\n\n`;
    });
    
    return this.convertToHTML(markdown, `Mini Project: ${this.formatConceptName(projectName)}`);
  }

  private generateTableOfContents(results: ExportResult[]): string {
    let toc = '## Table of Contents\n\n';
    
    results.forEach((result, index) => {
      const title = result.fileName.replace('.pdf', '').replace(/[-_]/g, ' ');
      toc += `${index + 1}. **${this.toTitleCase(title)}** - ${result.pageCount} pages\n`;
    });
    
    return toc;
  }

  private generateExportStats(results: ExportResult[], totalPages: number, totalSize: number): string {
    return `
## Export Statistics

- **Total Documents**: ${results.length}
- **Total Pages**: ${totalPages}
- **Total Size**: ${this.formatFileSize(totalSize)}
- **Export Date**: ${new Date().toLocaleString()}
- **Format**: ${this.options.format}
- **Theme**: ${this.options.theme}

---

*Generated by TSVerseHub PDF Exporter*
`;
  }

  private getBaseStyles(): string {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .content {
            padding: 20px;
            max-width: 100%;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin: 20px 0 10px 0;
            color: #2563eb;
        }
        
        h1 { font-size: 2.5em; }
        h2 { font-size: 2em; }
        h3 { font-size: 1.5em; }
        
        p {
            margin: 10px 0;
        }
        
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            overflow-x: auto;
            margin: 15px 0;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        pre code {
            background: none;
            padding: 0;
        }
        
        ul, ol {
            margin: 10px 0 10px 20px;
        }
        
        blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 15px;
            margin: 15px 0;
            color: #6b7280;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
    `;
  }

  private getDarkStyles(): string {
    return `
        body {
            background: #1f2937;
            color: #f9fafb;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #60a5fa;
        }
        
        pre {
            background: #374151;
            border-left-color: #60a5fa;
        }
        
        code {
            background: #4b5563;
        }
        
        th {
            background: #374151;
        }
    `;
  }

  private getWatermarkStyles(): string {
    return `
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 6em;
            color: rgba(0, 0, 0, 0.1);
            z-index: -1;
            pointer-events: none;
        }
    `;
  }

  private getHeaderTemplate(title: string): string {
    return `
        <div style="font-size: 10px; padding: 5px 15px; width: 100%; color: #666;">
            <span>${title}</span>
        </div>
    `;
  }

  private getFooterTemplate(): string {
    return `
        <div style="font-size: 10px; padding: 5px 15px; width: 100%; display: flex; justify-content: space-between; color: #666;">
            <span>TSVerseHub - TypeScript Learning Platform</span>
            <span class="pageNumber"></span>
        </div>
    `;
  }

  private async getPageCount(pdfPath: string): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you might use a PDF parsing library
    try {
      const stats = fs.statSync(pdfPath);
      // Rough estimation: 1 page ≈ 50KB for text-heavy PDFs
      return Math.max(1, Math.ceil(stats.size / 51200));
    } catch {
      return 1;
    }
  }

  private formatConceptName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const options: Partial<PDFExportOptions> = {};
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    switch (arg) {
      case '--dark':
        options.theme = 'dark';
        break;
      case '--format':
        options.format = args[index + 1] as 'A4' | 'Letter' | 'Legal';
        break;
      case '--output':
        options.outputDir = args[index + 1];
        break;
      case '--watermark':
        options.watermark = args[index + 1];
        break;
      case '--no-concepts':
        options.includeConcepts = false;
        break;
      case '--no-projects':
        options.includeProjects = false;
        break;
      case '--no-cheatsheets':
        options.includeCheatSheets = false;
        break;
    }
  });

  console.log('📄 Starting PDF export with options:', options);
  
  const exporter = new PDFExporter(options);
  
  try {
    const results = await exporter.export();
    
    console.log('\n📊 Export Summary:');
    console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n🔍 Errors:');
      failed.forEach(r => console.log(`   - ${r.fileName}: ${r.error}`));
    }
  } catch (error) {
    console.error('💥 Export failed:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export { PDFExporter, DEFAULT_OPTIONS };
export type { PDFExportOptions, ExportResult, ConceptModule };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}