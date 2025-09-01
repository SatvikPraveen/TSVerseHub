// File: concepts/tsconfig/project-references.ts

/**
 * TYPESCRIPT PROJECT REFERENCES
 * 
 * Project references allow you to structure TypeScript programs into smaller pieces.
 * This improves build times and enforces logical separation between components.
 * Perfect for monorepos and large applications.
 */

// ===== PROJECT REFERENCE TYPES =====

export interface ProjectReference {
  path: string;
  prepend?: boolean;
}

export interface ProjectConfig {
  name: string;
  path: string;
  tsConfigPath: string;
  dependencies: string[];
  composite: boolean;
  declaration: boolean;
  declarationMap?: boolean;
  outDir?: string;
  rootDir?: string;
}

export interface BuildInfo {
  bundle?: boolean;
  bundleDependencies?: boolean;
}

// ===== PROJECT REFERENCE MANAGER =====

export class ProjectReferenceManager {
  private projects: Map<string, ProjectConfig> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private reverseDependencyGraph: Map<string, Set<string>> = new Map();

  // Add a project to the manager
  addProject(config: ProjectConfig): this {
    if (this.projects.has(config.name)) {
      throw new Error(`Project ${config.name} already exists`);
    }

    this.projects.set(config.name, { ...config });
    this.dependencyGraph.set(config.name, new Set(config.dependencies));
    
    // Update reverse dependencies
    for (const dep of config.dependencies) {
      if (!this.reverseDependencyGraph.has(dep)) {
        this.reverseDependencyGraph.set(dep, new Set());
      }
      this.reverseDependencyGraph.get(dep)!.add(config.name);
    }

    return this;
  }

  // Remove a project
  removeProject(name: string): this {
    const project = this.projects.get(name);
    if (!project) {
      throw new Error(`Project ${name} not found`);
    }

    // Check if other projects depend on this one
    const dependents = this.reverseDependencyGraph.get(name);
    if (dependents && dependents.size > 0) {
      throw new Error(`Cannot remove project ${name}: depended on by ${Array.from(dependents).join(', ')}`);
    }

    // Remove from all collections
    this.projects.delete(name);
    this.dependencyGraph.delete(name);
    this.reverseDependencyGraph.delete(name);

    // Remove from other projects' dependencies
    for (const [projectName, deps] of this.dependencyGraph.entries()) {
      deps.delete(name);
      // Update project config
      const projectConfig = this.projects.get(projectName);
      if (projectConfig) {
        projectConfig.dependencies = projectConfig.dependencies.filter(d => d !== name);
      }
    }

    return this;
  }

  // Add dependency between projects
  addDependency(fromProject: string, toProject: string): this {
    if (!this.projects.has(fromProject)) {
      throw new Error(`Source project ${fromProject} not found`);
    }
    if (!this.projects.has(toProject)) {
      throw new Error(`Target project ${toProject} not found`);
    }

    // Check for circular dependencies
    if (this.wouldCreateCycle(fromProject, toProject)) {
      throw new Error(`Adding dependency from ${fromProject} to ${toProject} would create a circular dependency`);
    }

    // Add dependency
    this.dependencyGraph.get(fromProject)!.add(toProject);
    if (!this.reverseDependencyGraph.has(toProject)) {
      this.reverseDependencyGraph.set(toProject, new Set());
    }
    this.reverseDependencyGraph.get(toProject)!.add(fromProject);

    // Update project config
    const projectConfig = this.projects.get(fromProject)!;
    if (!projectConfig.dependencies.includes(toProject)) {
      projectConfig.dependencies.push(toProject);
    }

    return this;
  }

  // Remove dependency between projects
  removeDependency(fromProject: string, toProject: string): this {
    if (!this.projects.has(fromProject) || !this.projects.has(toProject)) {
      return this; // Silently ignore if projects don't exist
    }

    this.dependencyGraph.get(fromProject)?.delete(toProject);
    this.reverseDependencyGraph.get(toProject)?.delete(fromProject);

    // Update project config
    const projectConfig = this.projects.get(fromProject);
    if (projectConfig) {
      projectConfig.dependencies = projectConfig.dependencies.filter(d => d !== toProject);
    }

    return this;
  }

  // Get all projects
  getProjects(): ProjectConfig[] {
    return Array.from(this.projects.values());
  }

  // Get specific project
  getProject(name: string): ProjectConfig | undefined {
    return this.projects.get(name);
  }

  // Get project dependencies
  getDependencies(projectName: string): string[] {
    const deps = this.dependencyGraph.get(projectName);
    return deps ? Array.from(deps) : [];
  }

  // Get projects that depend on this one
  getDependents(projectName: string): string[] {
    const dependents = this.reverseDependencyGraph.get(projectName);
    return dependents ? Array.from(dependents) : [];
  }

  // Check if dependency would create cycle
  private wouldCreateCycle(from: string, to: string): boolean {
    const visited = new Set<string>();
    const stack = [to];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === from) {
        return true;
      }

      if (!visited.has(current)) {
        visited.add(current);
        const dependencies = this.dependencyGraph.get(current);
        if (dependencies) {
          stack.push(...dependencies);
        }
      }
    }

    return false;
  }

  // Validate all project references
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const circularDependencies: string[][] = [];

    // Check for missing projects
    for (const [projectName, config] of this.projects.entries()) {
      for (const dep of config.dependencies) {
        if (!this.projects.has(dep)) {
          errors.push(`Project ${projectName} depends on missing project: ${dep}`);
        }
      }
    }

    // Check for circular dependencies
    const cycles = this.findCircularDependencies();
    circularDependencies.push(...cycles);
    if (cycles.length > 0) {
      errors.push(`Found ${cycles.length} circular dependencies`);
    }

    // Check composite settings
    for (const [name, config] of this.projects.entries()) {
      if (!config.composite) {
        warnings.push(`Project ${name} should have composite: true for project references`);
      }
      if (!config.declaration) {
        warnings.push(`Project ${name} should have declaration: true for project references`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      circularDependencies,
      suggestions: this.generateValidationSuggestions(errors, warnings)
    };
  }

  private findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const project of this.projects.keys()) {
      if (!visited.has(project)) {
        const cycle = this.dfsForCycle(project, visited, recursionStack, []);
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    }

    return cycles;
  }

  private dfsForCycle(
    project: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): string[] {
    visited.add(project);
    recursionStack.add(project);
    path.push(project);

    const dependencies = this.dependencyGraph.get(project) || new Set();
    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        const cycle = this.dfsForCycle(dep, visited, recursionStack, [...path]);
        if (cycle.length > 0) {
          return cycle;
        }
      } else if (recursionStack.has(dep)) {
        // Found cycle
        const cycleStart = path.indexOf(dep);
        return path.slice(cycleStart).concat(dep);
      }
    }

    recursionStack.delete(project);
    return [];
  }

  private generateValidationSuggestions(errors: string[], warnings: string[]): string[] {
    const suggestions: string[] = [];

    if (errors.some(e => e.includes('missing project'))) {
      suggestions.push('Ensure all referenced projects are added to the manager');
    }

    if (errors.some(e => e.includes('circular'))) {
      suggestions.push('Break circular dependencies by extracting shared code to a common project');
    }

    if (warnings.some(w => w.includes('composite'))) {
      suggestions.push('Set composite: true in tsconfig.json for all referenced projects');
    }

    return suggestions;
  }

  // Generate build order using topological sort
  generateBuildOrder(): BuildOrderResult {
    const result = this.topologicalSort();
    
    return {
      order: result.order,
      isValid: result.isValid,
      parallelStages: this.generateParallelStages(),
      estimatedBuildTime: this.estimateBuildTime(result.order)
    };
  }

  private topologicalSort(): { order: string[]; isValid: boolean } {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];

    // Initialize in-degree count
    for (const project of this.projects.keys()) {
      inDegree.set(project, 0);
    }

    // Calculate in-degrees
    for (const dependencies of this.dependencyGraph.values()) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Find projects with no dependencies
    for (const [project, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(project);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const dependencies = this.dependencyGraph.get(current) || new Set();
      for (const dep of dependencies) {
        const newInDegree = (inDegree.get(dep) || 0) - 1;
        inDegree.set(dep, newInDegree);
        
        if (newInDegree === 0) {
          queue.push(dep);
        }
      }
    }

    return {
      order: result,
      isValid: result.length === this.projects.size
    };
  }

  private generateParallelStages(): string[][] {
    const stages: string[][] = [];
    const processed = new Set<string>();
    
    while (processed.size < this.projects.size) {
      const currentStage: string[] = [];
      
      for (const project of this.projects.keys()) {
        if (processed.has(project)) continue;
        
        // Check if all dependencies are already processed
        const dependencies = this.getDependencies(project);
        const canBuild = dependencies.every(dep => processed.has(dep));
        
        if (canBuild) {
          currentStage.push(project);
        }
      }
      
      if (currentStage.length === 0) {
        break; // Circular dependency detected
      }
      
      stages.push(currentStage);
      currentStage.forEach(project => processed.add(project));
    }
    
    return stages;
  }

  private estimateBuildTime(buildOrder: string[]): number {
    // Mock implementation - in real scenario would use historical build data
    return buildOrder.length * 2; // 2 seconds per project
  }

  // Generate root tsconfig.json
  generateRootConfig(): RootConfig {
    const references: ProjectReference[] = [];
    
    for (const project of this.projects.values()) {
      references.push({ path: project.path });
    }

    return {
      files: [],
      references,
      compilerOptions: {}
    };
  }

  // Generate individual project tsconfig.json
  generateProjectConfig(projectName: string): ProjectTSConfig | null {
    const project = this.projects.get(projectName);
    if (!project) {
      return null;
    }

    const references: ProjectReference[] = [];
    for (const dep of project.dependencies) {
      const depProject = this.projects.get(dep);
      if (depProject) {
        references.push({ path: depProject.path });
      }
    }

    return {
      compilerOptions: {
        composite: project.composite,
        declaration: project.declaration,
        declarationMap: project.declarationMap,
        outDir: project.outDir,
        rootDir: project.rootDir
      },
      references,
      include: [`${project.rootDir || 'src'}/**/*`],
      exclude: ['node_modules', project.outDir || 'dist']
    };
  }
}

// ===== BUILD ORCHESTRATOR =====

export class BuildOrchestrator {
  private manager: ProjectReferenceManager;

  constructor(manager: ProjectReferenceManager) {
    this.manager = manager;
  }

  // Plan build execution
  planBuild(changedFiles: string[] = []): BuildPlan {
    const buildOrder = this.manager.generateBuildOrder();
    
    if (changedFiles.length === 0) {
      return {
        type: 'full',
        projects: buildOrder.order,
        parallelStages: buildOrder.parallelStages,
        estimatedTime: buildOrder.estimatedBuildTime,
        reason: 'No changed files specified - full build required'
      };
    }

    const affectedProjects = this.findAffectedProjects(changedFiles);
    const dependentProjects = this.findDependentProjects(affectedProjects);
    const projectsToBuild = [...affectedProjects, ...dependentProjects];

    return {
      type: 'incremental',
      projects: this.orderProjects(projectsToBuild),
      parallelStages: this.generateIncrementalStages(projectsToBuild),
      estimatedTime: Math.min(projectsToBuild.length * 1.5, buildOrder.estimatedBuildTime),
      reason: `${affectedProjects.length} projects changed, ${dependentProjects.length} dependents need rebuilding`
    };
  }

  private findAffectedProjects(changedFiles: string[]): string[] {
    const affected = new Set<string>();

    for (const file of changedFiles) {
      for (const [name, project] of this.manager.getProjects().entries()) {
        if (file.startsWith(project.path)) {
          affected.add(name);
        }
      }
    }

    return Array.from(affected);
  }

  private findDependentProjects(projects: string[]): string[] {
    const dependents = new Set<string>();
    const queue = [...projects];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const projectDependents = this.manager.getDependents(current);
      
      for (const dependent of projectDependents) {
        if (!dependents.has(dependent)) {
          dependents.add(dependent);
          queue.push(dependent);
        }
      }
    }

    return Array.from(dependents);
  }

  private orderProjects(projects: string[]): string[] {
    const fullOrder = this.manager.generateBuildOrder().order;
    return fullOrder.filter(project => projects.includes(project));
  }

  private generateIncrementalStages(projects: string[]): string[][] {
    const allStages = this.manager.generateBuildOrder().parallelStages;
    return allStages
      .map(stage => stage.filter(project => projects.includes(project)))
      .filter(stage => stage.length > 0);
  }

  // Execute build plan
  async executeBuild(plan: BuildPlan): Promise<BuildResult> {
    console.log(`Starting ${plan.type} build of ${plan.projects.length} projects`);
    const startTime = Date.now();
    const results: ProjectBuildResult[] = [];

    try {
      if (plan.parallelStages.length > 0) {
        await this.executeParallelBuild(plan.parallelStages, results);
      } else {
        await this.executeSequentialBuild(plan.projects, results);
      }

      const endTime = Date.now();
      return {
        success: true,
        duration: endTime - startTime,
        projects: results,
        errors: []
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        duration: endTime - startTime,
        projects: results,
        errors: [error.message]
      };
    }
  }

  private async executeParallelBuild(stages: string[][], results: ProjectBuildResult[]): Promise<void> {
    for (let i = 0; i < stages.length; i++) {
      console.log(`Building stage ${i + 1}/${stages.length}: ${stages[i].join(', ')}`);
      
      const stagePromises = stages[i].map(project => this.buildProject(project));
      const stageResults = await Promise.all(stagePromises);
      
      results.push(...stageResults);
      
      // Check for failures
      const failures = stageResults.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Stage ${i + 1} failed: ${failures.map(f => f.project).join(', ')}`);
      }
    }
  }

  private async executeSequentialBuild(projects: string[], results: ProjectBuildResult[]): Promise<void> {
    for (const project of projects) {
      console.log(`Building ${project}`);
      const result = await this.buildProject(project);
      results.push(result);
      
      if (!result.success) {
        throw new Error(`Build failed for ${project}: ${result.error}`);
      }
    }
  }

  private async buildProject(projectName: string): Promise<ProjectBuildResult> {
    const startTime = Date.now();
    
    try {
      // Mock build process
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      return {
        project: projectName,
        success: true,
        duration: Date.now() - startTime,
        warnings: []
      };
    } catch (error) {
      return {
        project: projectName,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        warnings: []
      };
    }
  }
}

// ===== TYPE DEFINITIONS =====

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  circularDependencies: string[][];
  suggestions: string[];
}

export interface BuildOrderResult {
  order: string[];
  isValid: boolean;
  parallelStages: string[][];
  estimatedBuildTime: number;
}

export interface RootConfig {
  files: string[];
  references: ProjectReference[];
  compilerOptions: Record<string, any>;
}

export interface ProjectTSConfig {
  compilerOptions: {
    composite: boolean;
    declaration: boolean;
    declarationMap?: boolean;
    outDir?: string;
    rootDir?: string;
  };
  references: ProjectReference[];
  include: string[];
  exclude: string[];
}

export interface BuildPlan {
  type: 'full' | 'incremental';
  projects: string[];
  parallelStages: string[][];
  estimatedTime: number;
  reason: string;
}

export interface ProjectBuildResult {
  project: string;
  success: boolean;
  duration: number;
  error?: string;
  warnings: string[];
}

export interface BuildResult {
  success: boolean;
  duration: number;
  projects: ProjectBuildResult[];
  errors: string[];
}

// ===== USAGE EXAMPLES =====

console.log('=== Project References Examples ===');

// Create project reference manager
const manager = new ProjectReferenceManager();

// Add projects to a typical monorepo structure
manager
  .addProject({
    name: 'shared',
    path: './packages/shared',
    tsConfigPath: './packages/shared/tsconfig.json',
    dependencies: [],
    composite: true,
    declaration: true,
    declarationMap: true,
    outDir: 'dist',
    rootDir: 'src'
  })
  .addProject({
    name: 'ui',
    path: './packages/ui',
    tsConfigPath: './packages/ui/tsconfig.json',
    dependencies: ['shared'],
    composite: true,
    declaration: true,
    outDir: 'dist',
    rootDir: 'src'
  })
  .addProject({
    name: 'api',
    path: './packages/api',
    tsConfigPath: './packages/api/tsconfig.json',
    dependencies: ['shared'],
    composite: true,
    declaration: true,
    outDir: 'dist',
    rootDir: 'src'
  })
  .addProject({
    name: 'web',
    path: './packages/web',
    tsConfigPath: './packages/web/tsconfig.json',
    dependencies: ['shared', 'ui'],
    composite: true,
    declaration: true,
    outDir: 'dist',
    rootDir: 'src'
  });

console.log('Added projects:', manager.getProjects().map(p => p.name));

// Validate project references
const validation = manager.validate();
console.log('Validation result:', {
  valid: validation.isValid,
  errors: validation.errors.length,
  warnings: validation.warnings.length
});

// Generate build order
const buildOrder = manager.generateBuildOrder();
console.log('Build order:', buildOrder.order);
console.log('Parallel stages:', buildOrder.parallelStages);
console.log('Estimated build time:', buildOrder.estimatedBuildTime, 'seconds');

// Generate configurations
const rootConfig = manager.generateRootConfig();
console.log('Root tsconfig references:', rootConfig.references.map(r => r.path));

const webConfig = manager.generateProjectConfig('web');
console.log('Web project references:', webConfig?.references.map(r => r.path));

// Build orchestration
const orchestrator = new BuildOrchestrator(manager);

// Plan incremental build
const plan = orchestrator.planBuild(['./packages/shared/src/utils.ts']);
console.log('Build plan:', {
  type: plan.type,
  projects: plan.projects,
  estimatedTime: plan.estimatedTime
});

// Execute build (async)
orchestrator.executeBuild(plan).then(result => {
  console.log('Build result:', {
    success: result.success,
    duration: result.duration,
    projectCount: result.projects.length
  });
});

export default {
  ProjectReferenceManager,
  BuildOrchestrator,
  manager,
  orchestrator,
};