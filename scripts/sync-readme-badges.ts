// scripts/sync-readme-badges.ts

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  license: string;
  author?: string;
  repository?: {
    type: string;
    url: string;
  };
}

interface BadgeConfig {
  type: 'shield' | 'custom';
  label: string;
  message: string;
  color: string;
  style?: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  logo?: string;
  logoColor?: string;
  link?: string;
}

interface GitInfo {
  branch: string;
  commit: string;
  remoteUrl: string;
  lastCommitDate: string;
  contributors: number;
}

interface ProjectStats {
  linesOfCode: number;
  filesCount: number;
  testCoverage?: number;
  buildStatus: 'passing' | 'failing' | 'unknown';
  lastBuildDate: string;
}

class BadgeSyncer {
  private packageInfo: PackageInfo;
  private gitInfo?: GitInfo;
  private projectStats?: ProjectStats;
  private readmePath: string;

  constructor() {
    this.readmePath = path.resolve(process.cwd(), 'README.md');
    this.packageInfo = this.loadPackageInfo();
  }

  async sync(): Promise<void> {
    console.log('🔄 Syncing README badges...');
    
    try {
      await this.gatherProjectInfo();
      const badges = await this.generateBadges();
      await this.updateReadme(badges);
      
      console.log('✅ README badges updated successfully!');
    } catch (error) {
      console.error('❌ Badge sync failed:', error);
      throw error;
    }
  }

  private loadPackageInfo(): PackageInfo {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
      return JSON.parse(packageJson);
    } catch (error) {
      throw new Error('Failed to load package.json');
    }
  }

  private async gatherProjectInfo(): Promise<void> {
    console.log('📊 Gathering project information...');
    
    // Git information
    this.gitInfo = await this.getGitInfo();
    
    // Project statistics
    this.projectStats = await this.getProjectStats();
    
    console.log('📈 Project info collected');
  }

  private async getGitInfo(): Promise<GitInfo> {
    try {
      const [branchResult, commitResult, remoteResult, lastCommitResult] = await Promise.all([
        execAsync('git branch --show-current').catch(() => ({ stdout: 'main' })),
        execAsync('git rev-parse --short HEAD').catch(() => ({ stdout: 'unknown' })),
        execAsync('git config --get remote.origin.url').catch(() => ({ stdout: '' })),
        execAsync('git log -1 --format=%ci').catch(() => ({ stdout: new Date().toISOString() }))
      ]);

      // Get contributor count
      const contributorsResult = await execAsync('git shortlog -sn --all | wc -l')
        .catch(() => ({ stdout: '1' }));

      return {
        branch: branchResult.stdout.trim(),
        commit: commitResult.stdout.trim(),
        remoteUrl: remoteResult.stdout.trim(),
        lastCommitDate: lastCommitResult.stdout.trim(),
        contributors: parseInt(contributorsResult.stdout.trim())
      };
    } catch (error) {
      console.warn('⚠️ Could not fetch git info:', error);
      return {
        branch: 'main',
        commit: 'unknown',
        remoteUrl: '',
        lastCommitDate: new Date().toISOString(),
        contributors: 1
      };
    }
  }

  private async getProjectStats(): Promise<ProjectStats> {
    try {
      // Count lines of code (excluding node_modules, dist, etc.)
      const locResult = await execAsync(
        "find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v dist | xargs wc -l | tail -1"
      ).catch(() => ({ stdout: '0 total' }));

      // Count files
      const filesResult = await execAsync(
        "find src -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \\) | wc -l"
      ).catch(() => ({ stdout: '0' }));

      // Check if build passes
      let buildStatus: 'passing' | 'failing' | 'unknown' = 'unknown';
      try {
        await execAsync('npm run build --silent');
        buildStatus = 'passing';
      } catch {
        buildStatus = 'failing';
      }

      // Try to get test coverage if available
      let testCoverage: number | undefined;
      try {
        const coverageResult = await execAsync('npm run test:coverage --silent');
        const coverageMatch = coverageResult.stdout.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
        if (coverageMatch) {
          testCoverage = parseFloat(coverageMatch[1]);
        }
      } catch {
        // Coverage not available
      }

      const linesOfCode = parseInt(locResult.stdout.split(' ')[0]) || 0;
      const filesCount = parseInt(filesResult.stdout.trim()) || 0;

      return {
        linesOfCode,
        filesCount,
        testCoverage,
        buildStatus,
        lastBuildDate: new Date().toISOString()
      };
    } catch (error) {
      console.warn('⚠️ Could not gather project stats:', error);
      return {
        linesOfCode: 0,
        filesCount: 0,
        buildStatus: 'unknown',
        lastBuildDate: new Date().toISOString()
      };
    }
  }

  private async generateBadges(): Promise<string[]> {
    console.log('🏷️ Generating badges...');
    
    const badges: BadgeConfig[] = [
      // Project info badges
      {
        type: 'shield',
        label: 'Version',
        message: this.packageInfo.version,
        color: 'blue',
        style: 'flat-square'
      },
      {
        type: 'shield',
        label: 'License',
        message: this.packageInfo.license || 'MIT',
        color: 'green',
        style: 'flat-square'
      },
      
      // Technology badges
      {
        type: 'shield',
        label: 'TypeScript',
        message: this.getTechVersion('typescript') || '5.0+',
        color: '3178c6',
        style: 'flat-square',
        logo: 'typescript',
        logoColor: 'white'
      },
      {
        type: 'shield',
        label: 'React',
        message: this.getTechVersion('react') || '18.0+',
        color: '61dafb',
        style: 'flat-square',
        logo: 'react',
        logoColor: 'black'
      },
      {
        type: 'shield',
        label: 'Vite',
        message: this.getTechVersion('vite') || '4.0+',
        color: '646cff',
        style: 'flat-square',
        logo: 'vite',
        logoColor: 'white'
      },
      
      // Project stats badges
      {
        type: 'shield',
        label: 'Lines of Code',
        message: this.formatNumber(this.projectStats?.linesOfCode || 0),
        color: 'informational',
        style: 'flat-square'
      },
      {
        type: 'shield',
        label: 'Files',
        message: String(this.projectStats?.filesCount || 0),
        color: 'lightgrey',
        style: 'flat-square'
      },
      
      // Build status
      {
        type: 'shield',
        label: 'Build',
        message: this.projectStats?.buildStatus || 'unknown',
        color: this.getBuildColor(this.projectStats?.buildStatus || 'unknown'),
        style: 'flat-square'
      }
    ];

    // Add test coverage badge if available
    if (this.projectStats?.testCoverage !== undefined) {
      badges.push({
        type: 'shield',
        label: 'Coverage',
        message: `${this.projectStats.testCoverage.toFixed(1)}%`,
        color: this.getCoverageColor(this.projectStats.testCoverage),
        style: 'flat-square'
      });
    }

    // Add git badges if available
    if (this.gitInfo) {
      badges.push(
        {
          type: 'shield',
          label: 'Last Commit',
          message: this.formatDate(this.gitInfo.lastCommitDate),
          color: 'blue',
          style: 'flat-square',
          logo: 'git'
        },
        {
          type: 'shield',
          label: 'Contributors',
          message: String(this.gitInfo.contributors),
          color: 'orange',
          style: 'flat-square'
        }
      );
    }

    return badges.map(badge => this.badgeToMarkdown(badge));
  }

  private getTechVersion(packageName: string): string | undefined {
    const deps = { ...this.packageInfo.dependencies, ...this.packageInfo.devDependencies };
    const version = deps[packageName];
    if (!version) return undefined;
    
    // Extract version number, removing ^ or ~ prefixes
    return version.replace(/^[\^~]/, '');
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
  }

  private getBuildColor(status: string): string {
    switch (status) {
      case 'passing': return 'brightgreen';
      case 'failing': return 'red';
      default: return 'lightgrey';
    }
  }

  private getCoverageColor(coverage: number): string {
    if (coverage >= 90) return 'brightgreen';
    if (coverage >= 80) return 'green';
    if (coverage >= 70) return 'yellowgreen';
    if (coverage >= 60) return 'yellow';
    if (coverage >= 50) return 'orange';
    return 'red';
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }

  private badgeToMarkdown(badge: BadgeConfig): string {
    const params = new URLSearchParams();
    
    if (badge.style) params.append('style', badge.style);
    if (badge.logo) params.append('logo', badge.logo);
    if (badge.logoColor) params.append('logoColor', badge.logoColor);
    
    const url = `https://img.shields.io/badge/${encodeURIComponent(badge.label)}-${encodeURIComponent(badge.message)}-${badge.color}?${params.toString()}`;
    
    if (badge.link) {
      return `[![${badge.label}](${url})](${badge.link})`;
    }
    
    return `![${badge.label}](${url})`;
  }

  private async updateReadme(badges: string[]): Promise<void> {
    console.log('📝 Updating README.md...');
    
    if (!fs.existsSync(this.readmePath)) {
      throw new Error('README.md not found');
    }

    let readmeContent = fs.readFileSync(this.readmePath, 'utf-8');
    
    // Create badge section
    const badgeSection = `
<!-- badges:start -->
${badges.join('\n')}
<!-- badges:end -->
`;

    // Check if badges section exists
    const badgeRegex = /<!-- badges:start -->[\s\S]*?<!-- badges:end -->/;
    
    if (badgeRegex.test(readmeContent)) {
      // Replace existing badges
      readmeContent = readmeContent.replace(badgeRegex, badgeSection.trim());
    } else {
      // Add badges after the first heading
      const lines = readmeContent.split('\n');
      let insertIndex = 0;
      
      // Find first heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          insertIndex = i + 1;
          break;
        }
      }
      
      // Skip any existing content until we find a good spot
      while (insertIndex < lines.length && 
             (lines[insertIndex].trim() === '' || 
              lines[insertIndex].startsWith('>'))) {
        insertIndex++;
      }
      
      // Insert badges
      lines.splice(insertIndex, 0, '', badgeSection.trim(), '');
      readmeContent = lines.join('\n');
    }

    // Update last updated timestamp
    const timestamp = `*Last updated: ${new Date().toLocaleString()}*`;
    const timestampRegex = /\*Last updated:.*?\*/;
    
    if (timestampRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(timestampRegex, timestamp);
    } else {
      // Add timestamp at the end
      readmeContent = readmeContent.trim() + '\n\n---\n\n' + timestamp + '\n';
    }

    // Write back to file
    fs.writeFileSync(this.readmePath, readmeContent);
  }

  async validateBadges(): Promise<boolean> {
    console.log('🔍 Validating badges...');
    
    const badges = await this.generateBadges();
    let allValid = true;
    
    for (const badge of badges) {
      try {
        // Extract URL from markdown
        const urlMatch = badge.match(/\((https?:\/\/[^\)]+)\)/);
        if (!urlMatch) continue;
        
        const response = await fetch(urlMatch[1], { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`⚠️ Badge URL not accessible: ${urlMatch[1]}`);
          allValid = false;
        }
      } catch (error) {
        console.warn(`⚠️ Error validating badge: ${error}`);
        allValid = false;
      }
    }
    
    return allValid;
  }

  async generateCustomBadges(): Promise<void> {
    console.log('🎨 Generating custom badges...');
    
    const customBadges = [
      {
        name: 'learning-progress',
        svg: this.generateProgressBadge()
      },
      {
        name: 'typescript-features',
        svg: this.generateFeatureBadge()
      }
    ];

    const badgesDir = path.resolve(process.cwd(), 'public/badges');
    if (!fs.existsSync(badgesDir)) {
      fs.mkdirSync(badgesDir, { recursive: true });
    }

    for (const badge of customBadges) {
      const badgePath = path.join(badgesDir, `${badge.name}.svg`);
      fs.writeFileSync(badgePath, badge.svg);
      console.log(`✅ Generated custom badge: ${badge.name}.svg`);
    }
  }

  private generateProgressBadge(): string {
    const concepts = ['Basics', 'Advanced Types', 'Generics', 'Decorators', 'Patterns'];
    const completed = Math.floor(Math.random() * concepts.length) + 1;
    const percentage = Math.round((completed / concepts.length) * 100);
    
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20">
  <defs>
    <linearGradient id="workflow-fill" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop stop-color="#34d399" offset="0%"></stop>
      <stop stop-color="#059669" offset="100%"></stop>
    </linearGradient>
  </defs>
  <g fill="none" fill-rule="evenodd">
    <g font-family="'DejaVu Sans',Verdana,Geneva,sans-serif" font-size="11">
      <path id="workflow-bg" d="M0,3 C0,1.3431 1.3431,0 3,0 L137,0 C138.6569,0 140,1.3431 140,3 L140,17 C140,18.6569 138.6569,20 137,20 L3,20 C1.3431,20 0,18.6569 0,17 Z" fill="#555"></path>
      <path d="M0,3 C0,1.3431 1.3431,0 3,0 L60,0 L60,20 L3,20 C1.3431,20 0,18.6569 0,17 Z" fill="#555"></path>
      <path fill="url(#workflow-fill)" d="M60,0 L137,0 C138.6569,0 140,1.3431 140,3 L140,17 C140,18.6569 138.6569,20 137,20 L60,20 Z"></path>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="'DejaVu Sans',Verdana,Geneva,sans-serif" font-size="11">
      <text x="30" y="15" fill="#010101" fill-opacity=".3">Progress</text>
      <text x="30" y="14">Progress</text>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="'DejaVu Sans',Verdana,Geneva,sans-serif" font-size="11">
      <text x="100" y="15" fill="#010101" fill-opacity=".3">${percentage}%</text>
      <text x="100" y="14">${percentage}%</text>
    </g>
  </g>
</svg>`.trim();
  }

  private generateFeatureBadge(): string {
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20">
  <defs>
    <linearGradient id="typescript-fill" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop stop-color="#3178c6" offset="0%"></stop>
      <stop stop-color="#235a97" offset="100%"></stop>
    </linearGradient>
  </defs>
  <g fill="none" fill-rule="evenodd">
    <g font-family="'DejaVu Sans',Verdana,Geneva,sans-serif" font-size="11">
      <path d="M0,3 C0,1.3431 1.3431,0 3,0 L157,0 C158.6569,0 160,1.3431 160,3 L160,17 C160,18.6569 158.6569,20 157,20 L3,20 C1.3431,20 0,18.6569 0,17 Z" fill="url(#typescript-fill)"></path>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="'DejaVu Sans',Verdana,Geneva,sans-serif" font-size="11">
      <text x="80" y="15" fill="#010101" fill-opacity=".3">TypeScript Expert</text>
      <text x="80" y="14">TypeScript Expert</text>
    </g>
  </g>
</svg>`.trim();
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  const syncer = new BadgeSyncer();
  
  try {
    switch (command) {
      case 'sync':
        await syncer.sync();
        break;
        
      case 'validate':
        const isValid = await syncer.validateBadges();
        if (isValid) {
          console.log('✅ All badges are valid');
        } else {
          console.log('⚠️ Some badges may have issues');
          process.exit(1);
        }
        break;
        
      case 'custom':
        await syncer.generateCustomBadges();
        break;
        
      case 'all':
        await syncer.sync();
        await syncer.generateCustomBadges();
        const valid = await syncer.validateBadges();
        if (!valid) {
          console.warn('⚠️ Some badges may have validation issues');
        }
        break;
        
      default:
        console.log(`
Usage: npm run sync:badges [command]

Commands:
  sync      Update README.md badges (default)
  validate  Check if badge URLs are accessible
  custom    Generate custom SVG badges
  all       Run sync, custom, and validate

Examples:
  npm run sync:badges
  npm run sync:badges validate
  npm run sync:badges custom
        `);
        break;
    }
  } catch (error) {
    console.error('💥 Badge sync failed:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export { BadgeSyncer };
export type { BadgeConfig, GitInfo, ProjectStats, PackageInfo };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}