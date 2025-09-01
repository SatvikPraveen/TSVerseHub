// scripts/build-playground.ts

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { build } from 'vite';
import type { InlineConfig } from 'vite';

interface PlaygroundConfig {
  entry: string;
  outDir: string;
  formats: ('es' | 'cjs' | 'umd')[];
  external: string[];
  globals: Record<string, string>;
}

interface BuildResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  size?: number;
}

const PLAYGROUND_CONFIG: PlaygroundConfig = {
  entry: 'src/components/editors/Playground.tsx',
  outDir: 'dist/playground',
  formats: ['es', 'cjs'],
  external: ['react', 'react-dom', 'monaco-editor', '@monaco-editor/react'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'monaco-editor': 'monaco',
    '@monaco-editor/react': 'MonacoEditor'
  }
};

class PlaygroundBuilder {
  private config: PlaygroundConfig;
  private buildDir: string;

  constructor(config: PlaygroundConfig) {
    this.config = config;
    this.buildDir = path.resolve(process.cwd(), config.outDir);
  }

  async build(): Promise<BuildResult[]> {
    console.log('🚀 Building playground components...');
    
    try {
      await this.ensureDirectories();
      const results = await this.buildFormats();
      await this.generateManifest(results);
      await this.copyAssets();
      
      console.log('✅ Playground build completed successfully!');
      return results;
    } catch (error) {
      console.error('❌ Playground build failed:', error);
      throw error;
    }
  }

  private async ensureDirectories(): Promise<void> {
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
    }
  }

  private async buildFormats(): Promise<BuildResult[]> {
    const results: BuildResult[] = [];

    for (const format of this.config.formats) {
      try {
        console.log(`📦 Building ${format} format...`);
        
        const viteConfig: InlineConfig = {
          build: {
            lib: {
              entry: this.config.entry,
              name: 'TSVersePlayground',
              formats: [format],
              fileName: (format) => `playground.${format}.js`
            },
            outDir: this.buildDir,
            rollupOptions: {
              external: this.config.external,
              output: {
                globals: this.config.globals,
                banner: this.generateBanner(),
                footer: this.generateFooter()
              }
            },
            minify: true,
            sourcemap: true,
            target: 'es2020'
          },
          esbuild: {
            keepNames: true,
            legalComments: 'inline'
          }
        };

        await build(viteConfig);

        const outputPath = path.join(this.buildDir, `playground.${format}.js`);
        const size = this.getFileSize(outputPath);

        results.push({
          success: true,
          outputPath,
          size
        });

        console.log(`✅ ${format} build completed (${this.formatSize(size)})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          error: errorMessage
        });
        console.error(`❌ ${format} build failed:`, errorMessage);
      }
    }

    return results;
  }

  private async generateManifest(results: BuildResult[]): Promise<void> {
    const manifest = {
      name: 'TSVerseHub Playground',
      version: this.getPackageVersion(),
      description: 'Interactive TypeScript playground components',
      main: './playground.cjs.js',
      module: './playground.es.js',
      types: './playground.d.ts',
      files: results
        .filter(r => r.success)
        .map(r => path.basename(r.outputPath!)),
      exports: {
        '.': {
          import: './playground.es.js',
          require: './playground.cjs.js',
          types: './playground.d.ts'
        }
      },
      peerDependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        'monaco-editor': '^0.44.0',
        '@monaco-editor/react': '^4.6.0'
      },
      buildInfo: {
        timestamp: new Date().toISOString(),
        node: process.version,
        platform: process.platform,
        totalSize: results.reduce((sum, r) => sum + (r.size || 0), 0)
      }
    };

    const manifestPath = path.join(this.buildDir, 'package.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('📄 Generated manifest at', manifestPath);
  }

  private async copyAssets(): Promise<void> {
    const assetsDir = path.join('src', 'assets');
    const targetDir = path.join(this.buildDir, 'assets');

    if (fs.existsSync(assetsDir)) {
      await this.copyDirectory(assetsDir, targetDir);
      console.log('📁 Copied assets to build directory');
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private generateBanner(): string {
    return `/**
 * TSVerseHub Playground Components
 * Version: ${this.getPackageVersion()}
 * Built: ${new Date().toISOString()}
 * License: MIT
 */`;
  }

  private generateFooter(): string {
    return `
/* TSVerseHub Playground - Interactive TypeScript Learning Platform */
`;
  }

  private getPackageVersion(): string {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync('package.json', 'utf-8')
      );
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  private getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const watch = args.includes('--watch') || args.includes('-w');

  if (verbose) {
    console.log('🔧 Playground Builder Configuration:');
    console.log(JSON.stringify(PLAYGROUND_CONFIG, null, 2));
    console.log('');
  }

  const builder = new PlaygroundBuilder(PLAYGROUND_CONFIG);

  try {
    if (watch) {
      console.log('👀 Starting watch mode...');
      // Watch for changes and rebuild
      const chokidar = await import('chokidar');
      const watcher = chokidar.watch(['src/components/editors/**/*'], {
        ignored: /(^|[\/\\])\../,
        persistent: true
      });

      watcher.on('change', async (filePath) => {
        console.log(`🔄 File changed: ${filePath}`);
        await builder.build();
      });

      // Initial build
      await builder.build();
      
      console.log('🎯 Watching for changes... Press Ctrl+C to exit');
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log('\n👋 Stopping watch mode...');
        watcher.close();
        process.exit(0);
      });
    } else {
      const results = await builder.build();
      
      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n📊 Build Summary:');
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('\n🔍 Errors:');
        results
          .filter(r => !r.success)
          .forEach(r => console.log(`   - ${r.error}`));
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('💥 Build process failed:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export { PlaygroundBuilder, PLAYGROUND_CONFIG };
export type { PlaygroundConfig, BuildResult };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}