// File location: src/utils/type-graph.ts

export interface TypeNode {
  id: string;
  name: string;
  type: 'primitive' | 'object' | 'array' | 'function' | 'generic' | 'utility' | 'interface' | 'class' | 'enum' | 'union' | 'intersection' | 'literal' | 'conditional';
  category: 'built-in' | 'user-defined' | 'utility' | 'advanced' | 'custom';
  description: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  examples: string[];
  documentation?: string;
  sourceCode?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface TypeEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'extends' | 'implements' | 'composes' | 'uses' | 'constrains' | 'transforms' | 'returns' | 'accepts' | 'contains';
  strength: number; // 1-10, affects visual weight
  description: string;
  examples?: string[];
  metadata?: Record<string, any>;
}

export interface TypeGraph {
  nodes: Map<string, TypeNode>;
  edges: Map<string, TypeEdge>;
  metadata: {
    name: string;
    description: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

export interface GraphAnalysis {
  nodeCount: number;
  edgeCount: number;
  complexity: number;
  centralityScores: Map<string, number>;
  clusters: string[][];
  criticalPath: string[];
  dependencies: Map<string, string[]>;
  dependents: Map<string, string[]>;
  isolatedNodes: string[];
  circularDependencies: string[][];
}

export interface GraphQuery {
  nodeTypes?: string[];
  categories?: string[];
  complexityRange?: [number, number];
  relationships?: string[];
  searchTerm?: string;
  includeExamples?: boolean;
  maxDepth?: number;
}

export interface PathFindingResult {
  path: string[];
  distance: number;
  relationships: TypeEdge[];
  description: string;
}

class TypeGraphBuilder {
  private graph: TypeGraph;

  constructor(name: string = 'TypeScript Type System') {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      metadata: {
        name,
        description: 'Interactive TypeScript type system graph',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['typescript', 'types', 'learning']
      }
    };

    this.initializeBuiltInTypes();
  }

  private initializeBuiltInTypes(): void {
    // Primitive types
    this.addNode({
      id: 'string',
      name: 'string',
      type: 'primitive',
      category: 'built-in',
      description: 'Primitive string type for text data',
      complexity: 1,
      examples: ['"hello"', "'world'", '`template ${string}`'],
      documentation: 'The string primitive type represents textual data.'
    });

    this.addNode({
      id: 'number',
      name: 'number',
      type: 'primitive',
      category: 'built-in',
      description: 'Primitive number type for numeric data',
      complexity: 1,
      examples: ['42', '3.14', '0xff', '1e10', 'NaN', 'Infinity'],
      documentation: 'The number primitive type represents both integers and floating-point numbers.'
    });

    this.addNode({
      id: 'boolean',
      name: 'boolean',
      type: 'primitive',
      category: 'built-in',
      description: 'Primitive boolean type for true/false values',
      complexity: 1,
      examples: ['true', 'false'],
      documentation: 'The boolean primitive type represents logical true/false values.'
    });

    this.addNode({
      id: 'null',
      name: 'null',
      type: 'primitive',
      category: 'built-in',
      description: 'Represents intentional absence of value',
      complexity: 1,
      examples: ['null'],
      documentation: 'The null type represents the intentional absence of any object value.'
    });

    this.addNode({
      id: 'undefined',
      name: 'undefined',
      type: 'primitive',
      category: 'built-in',
      description: 'Represents uninitialized or missing value',
      complexity: 1,
      examples: ['undefined'],
      documentation: 'The undefined type represents a variable that has been declared but not assigned a value.'
    });

    this.addNode({
      id: 'void',
      name: 'void',
      type: 'primitive',
      category: 'built-in',
      description: 'Represents the absence of a return value',
      complexity: 1,
      examples: ['function log(): void {}'],
      documentation: 'The void type is used for functions that do not return a value.'
    });

    this.addNode({
      id: 'never',
      name: 'never',
      type: 'primitive',
      category: 'built-in',
      description: 'Represents values that never occur',
      complexity: 2,
      examples: ['function throwError(): never { throw new Error(); }'],
      documentation: 'The never type represents the type of values that never occur.'
    });

    this.addNode({
      id: 'any',
      name: 'any',
      type: 'primitive',
      category: 'built-in',
      description: 'Disables type checking (use with caution)',
      complexity: 1,
      examples: ['let value: any = 42;'],
      documentation: 'The any type allows any value and disables type checking.'
    });

    this.addNode({
      id: 'unknown',
      name: 'unknown',
      type: 'primitive',
      category: 'built-in',
      description: 'Type-safe alternative to any',
      complexity: 2,
      examples: ['let value: unknown = getData();'],
      documentation: 'The unknown type is the type-safe counterpart of any.'
    });

    // Object types
    this.addNode({
      id: 'object',
      name: 'object',
      type: 'object',
      category: 'built-in',
      description: 'General object type',
      complexity: 2,
      examples: ['{}', '{ key: value }', 'new Object()'],
      documentation: 'The object type represents non-primitive types.'
    });

    this.addNode({
      id: 'array',
      name: 'Array<T>',
      type: 'array',
      category: 'built-in',
      description: 'Generic array type',
      complexity: 2,
      examples: ['number[]', 'Array<string>', 'readonly T[]'],
      documentation: 'Arrays are list-like objects with numeric indices.'
    });

    this.addNode({
      id: 'function',
      name: 'Function',
      type: 'function',
      category: 'built-in',
      description: 'Function type',
      complexity: 2,
      examples: ['() => void', '(x: number) => string', 'Function'],
      documentation: 'Functions are first-class objects in TypeScript.'
    });

    // Advanced types
    this.addNode({
      id: 'generic',
      name: 'Generic<T>',
      type: 'generic',
      category: 'advanced',
      description: 'Parameterized types for reusability',
      complexity: 4,
      examples: ['T', 'K extends keyof T', 'Generic<T, U>'],
      documentation: 'Generics provide a way to make components work with any type.'
    });

    this.addNode({
      id: 'union',
      name: 'Union Types',
      type: 'union',
      category: 'advanced',
      description: 'Type that can be one of several types',
      complexity: 3,
      examples: ['string | number', 'A | B | C', 'T | U'],
      documentation: 'Union types represent values that can be one of several types.'
    });

    this.addNode({
      id: 'intersection',
      name: 'Intersection Types',
      type: 'intersection',
      category: 'advanced',
      description: 'Type that combines multiple types',
      complexity: 4,
      examples: ['A & B', 'User & Admin', 'T & U'],
      documentation: 'Intersection types combine multiple types into one.'
    });

    // Utility types
    const utilityTypes = [
      { id: 'partial', name: 'Partial<T>', desc: 'Makes all properties optional' },
      { id: 'required', name: 'Required<T>', desc: 'Makes all properties required' },
      { id: 'readonly', name: 'Readonly<T>', desc: 'Makes all properties readonly' },
      { id: 'pick', name: 'Pick<T, K>', desc: 'Picks specific properties' },
      { id: 'omit', name: 'Omit<T, K>', desc: 'Omits specific properties' },
      { id: 'record', name: 'Record<K, T>', desc: 'Creates object type with specific keys' },
      { id: 'exclude', name: 'Exclude<T, U>', desc: 'Excludes types from union' },
      { id: 'extract', name: 'Extract<T, U>', desc: 'Extracts types from union' },
      { id: 'nonnullable', name: 'NonNullable<T>', desc: 'Removes null and undefined' },
      { id: 'returntype', name: 'ReturnType<T>', desc: 'Gets function return type' },
      { id: 'parameters', name: 'Parameters<T>', desc: 'Gets function parameter types' },
      { id: 'instancetype', name: 'InstanceType<T>', desc: 'Gets constructor instance type' }
    ];

    utilityTypes.forEach(({ id, name, desc }) => {
      this.addNode({
        id,
        name,
        type: 'utility',
        category: 'utility',
        description: desc,
        complexity: 3,
        examples: [`${name.split('<')[0]}<SomeType>`],
        documentation: `${desc} using mapped types.`
      });
    });

    this.initializeTypeRelationships();
  }

  private initializeTypeRelationships(): void {
    // Basic inheritance relationships
    this.addEdge('array', 'object', 'extends', 7, 'Arrays are objects');
    this.addEdge('function', 'object', 'extends', 6, 'Functions are objects');
    
    // Generic relationships
    this.addEdge('array', 'generic', 'uses', 9, 'Arrays use generic parameters');
    this.addEdge('partial', 'generic', 'uses', 9, 'Utility types use generics');
    this.addEdge('required', 'generic', 'uses', 9, 'Utility types use generics');
    this.addEdge('readonly', 'generic', 'uses', 9, 'Utility types use generics');
    this.addEdge('pick', 'generic', 'uses', 9, 'Pick uses generics');
    this.addEdge('omit', 'generic', 'uses', 9, 'Omit uses generics');
    this.addEdge('record', 'generic', 'uses', 9, 'Record uses generics');

    // Union and intersection relationships
    this.addEdge('union', 'string', 'composes', 5, 'Unions can include primitives');
    this.addEdge('union', 'number', 'composes', 5, 'Unions can include primitives');
    this.addEdge('union', 'object', 'composes', 6, 'Unions can include objects');
    this.addEdge('intersection', 'object', 'composes', 7, 'Intersections combine objects');

    // Never type relationships
    this.addEdge('never', 'void', 'extends', 3, 'Never is a subtype of every type');
    this.addEdge('never', 'any', 'extends', 2, 'Never is assignable to any');

    // Unknown relationships
    this.addEdge('any', 'unknown', 'extends', 4, 'Any is assignable to unknown');
    this.addEdge('string', 'unknown', 'extends', 3, 'All types extend unknown');
    this.addEdge('number', 'unknown', 'extends', 3, 'All types extend unknown');
    this.addEdge('object', 'unknown', 'extends', 3, 'All types extend unknown');

    // Utility type transformations
    this.addEdge('partial', 'object', 'transforms', 8, 'Transforms object properties');
    this.addEdge('required', 'object', 'transforms', 8, 'Transforms object properties');
    this.addEdge('readonly', 'object', 'transforms', 8, 'Transforms object properties');
    this.addEdge('pick', 'object', 'transforms', 8, 'Picks from objects');
    this.addEdge('omit', 'object', 'transforms', 8, 'Omits from objects');
    this.addEdge('record', 'object', 'transforms', 8, 'Creates object types');
  }

  // Node management methods
  
  public addNode(nodeData: Omit<TypeNode, 'id'> & { id?: string }): TypeNode {
    const node: TypeNode = {
      id: nodeData.id || this.generateId(),
      name: nodeData.name,
      type: nodeData.type,
      category: nodeData.category,
      description: nodeData.description,
      complexity: nodeData.complexity,
      examples: nodeData.examples,
      documentation: nodeData.documentation,
      sourceCode: nodeData.sourceCode,
      dependencies: nodeData.dependencies || [],
      metadata: nodeData.metadata || {}
    };

    this.graph.nodes.set(node.id, node);
    this.updateMetadata();
    return node;
  }

  public removeNode(nodeId: string): boolean {
    if (!this.graph.nodes.has(nodeId)) return false;

    // Remove all edges connected to this node
    const edgesToRemove: string[] = [];
    this.graph.edges.forEach((edge, edgeId) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        edgesToRemove.push(edgeId);
      }
    });

    edgesToRemove.forEach(edgeId => {
      this.graph.edges.delete(edgeId);
    });

    this.graph.nodes.delete(nodeId);
    this.updateMetadata();
    return true;
  }

  public updateNode(nodeId: string, updates: Partial<TypeNode>): TypeNode | null {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return null;

    const updatedNode = { ...node, ...updates, id: nodeId };
    this.graph.nodes.set(nodeId, updatedNode);
    this.updateMetadata();
    return updatedNode;
  }

  public getNode(nodeId: string): TypeNode | null {
    return this.graph.nodes.get(nodeId) || null;
  }

  // Edge management methods
  
  public addEdge(
    source: string,
    target: string,
    relationship: TypeEdge['relationship'],
    strength: number = 5,
    description: string = '',
    examples: string[] = []
  ): TypeEdge {
    if (!this.graph.nodes.has(source) || !this.graph.nodes.has(target)) {
      throw new Error('Source or target node does not exist');
    }

    const edge: TypeEdge = {
      id: this.generateId(),
      source,
      target,
      relationship,
      strength: Math.max(1, Math.min(10, strength)),
      description,
      examples,
      metadata: {}
    };

    this.graph.edges.set(edge.id, edge);
    this.updateMetadata();
    return edge;
  }

  public removeEdge(edgeId: string): boolean {
    const removed = this.graph.edges.delete(edgeId);
    if (removed) this.updateMetadata();
    return removed;
  }

  public getEdgesBetween(sourceId: string, targetId: string): TypeEdge[] {
    const edges: TypeEdge[] = [];
    this.graph.edges.forEach(edge => {
      if (edge.source === sourceId && edge.target === targetId) {
        edges.push(edge);
      }
    });
    return edges;
  }

  public getConnectedNodes(nodeId: string, direction: 'in' | 'out' | 'both' = 'both'): TypeNode[] {
    const connectedIds = new Set<string>();
    
    this.graph.edges.forEach(edge => {
      if (direction !== 'in' && edge.source === nodeId) {
        connectedIds.add(edge.target);
      }
      if (direction !== 'out' && edge.target === nodeId) {
        connectedIds.add(edge.source);
      }
    });

    return Array.from(connectedIds)
      .map(id => this.graph.nodes.get(id))
      .filter((node): node is TypeNode => node !== undefined);
  }

  // Query and search methods
  
  public queryNodes(query: GraphQuery): TypeNode[] {
    let nodes = Array.from(this.graph.nodes.values());

    if (query.nodeTypes && query.nodeTypes.length > 0) {
      nodes = nodes.filter(node => query.nodeTypes!.includes(node.type));
    }

    if (query.categories && query.categories.length > 0) {
      nodes = nodes.filter(node => query.categories!.includes(node.category));
    }

    if (query.complexityRange) {
      const [min, max] = query.complexityRange;
      nodes = nodes.filter(node => node.complexity >= min && node.complexity <= max);
    }

    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      nodes = nodes.filter(node =>
        node.name.toLowerCase().includes(term) ||
        node.description.toLowerCase().includes(term) ||
        (node.documentation && node.documentation.toLowerCase().includes(term)) ||
        node.examples.some(example => example.toLowerCase().includes(term))
      );
    }

    return nodes;
  }

  public findShortestPath(sourceId: string, targetId: string): PathFindingResult | null {
    if (!this.graph.nodes.has(sourceId) || !this.graph.nodes.has(targetId)) {
      return null;
    }

    // Dijkstra's algorithm implementation
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.graph.nodes.forEach((node, nodeId) => {
      distances.set(nodeId, nodeId === sourceId ? 0 : Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      unvisited.forEach(nodeId => {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          current = nodeId;
        }
      });

      if (!current || minDistance === Infinity) break;
      
      unvisited.delete(current);
      
      if (current === targetId) break;

      // Update distances to neighbors
      this.graph.edges.forEach(edge => {
        if (edge.source === current && unvisited.has(edge.target)) {
          const alt = (distances.get(current!) || 0) + (11 - edge.strength);
          if (alt < (distances.get(edge.target) || Infinity)) {
            distances.set(edge.target, alt);
            previous.set(edge.target, current);
          }
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    const relationships: TypeEdge[] = [];
    let current: string | null = targetId;

    while (current !== null) {
      path.unshift(current);
      const prev = previous.get(current);
      if (prev !== null && prev !== undefined) {
        const edge = Array.from(this.graph.edges.values())
          .find(e => e.source === prev && e.target === current);
        if (edge) relationships.unshift(edge);
      }
      current = prev || null;
    }

    const distance = distances.get(targetId) || Infinity;
    if (distance === Infinity) return null;

    const description = this.generatePathDescription(path, relationships);

    return { path, distance, relationships, description };
  }

  private generatePathDescription(path: string[], relationships: TypeEdge[]): string {
    if (path.length < 2) return '';

    const descriptions: string[] = [];
    for (let i = 0; i < relationships.length; i++) {
      const sourceNode = this.graph.nodes.get(path[i]);
      const targetNode = this.graph.nodes.get(path[i + 1]);
      const relationship = relationships[i];
      
      if (sourceNode && targetNode) {
        descriptions.push(
          `${sourceNode.name} ${relationship.relationship} ${targetNode.name}`
        );
      }
    }

    return descriptions.join(' → ');
  }

  // Analysis methods
  
  public analyzeGraph(): GraphAnalysis {
    const nodeCount = this.graph.nodes.size;
    const edgeCount = this.graph.edges.size;
    const complexity = this.calculateGraphComplexity();
    const centralityScores = this.calculateCentralityScores();
    const clusters = this.findClusters();
    const criticalPath = this.findCriticalPath();
    const dependencies = this.buildDependencyMap();
    const dependents = this.buildDependentMap();
    const isolatedNodes = this.findIsolatedNodes();
    const circularDependencies = this.findCircularDependencies();

    return {
      nodeCount,
      edgeCount,
      complexity,
      centralityScores,
      clusters,
      criticalPath,
      dependencies,
      dependents,
      isolatedNodes,
      circularDependencies
    };
  }

  private calculateGraphComplexity(): number {
    let totalComplexity = 0;
    let nodeCount = 0;

    this.graph.nodes.forEach(node => {
      totalComplexity += node.complexity;
      nodeCount++;
    });

    // Factor in edge complexity (connectivity)
    const edgeComplexityFactor = this.graph.edges.size / Math.max(nodeCount, 1);
    
    return nodeCount > 0 ? (totalComplexity / nodeCount) + edgeComplexityFactor : 0;
  }

  private calculateCentralityScores(): Map<string, number> {
    const centralityScores = new Map<string, number>();
    
    // Calculate degree centrality (simple approach)
    this.graph.nodes.forEach((node, nodeId) => {
      let inDegree = 0;
      let outDegree = 0;
      
      this.graph.edges.forEach(edge => {
        if (edge.target === nodeId) inDegree++;
        if (edge.source === nodeId) outDegree++;
      });
      
      const centrality = (inDegree + outDegree) / Math.max(this.graph.nodes.size - 1, 1);
      centralityScores.set(nodeId, centrality);
    });

    return centralityScores;
  }

  private findClusters(): string[][] {
    const visited = new Set<string>();
    const clusters: string[][] = [];

    this.graph.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        const cluster = this.dfsCluster(nodeId, visited);
        if (cluster.length > 1) {
          clusters.push(cluster);
        }
      }
    });

    return clusters;
  }

  private dfsCluster(nodeId: string, visited: Set<string>): string[] {
    visited.add(nodeId);
    const cluster = [nodeId];
    
    const connected = this.getConnectedNodes(nodeId);
    connected.forEach(connectedNode => {
      if (!visited.has(connectedNode.id)) {
        cluster.push(...this.dfsCluster(connectedNode.id, visited));
      }
    });

    return cluster;
  }

  private findCriticalPath(): string[] {
    // Find the longest path in the graph (simplified approach)
    let longestPath: string[] = [];
    
    this.graph.nodes.forEach((node, nodeId) => {
      const path = this.findLongestPathFrom(nodeId, new Set());
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    });

    return longestPath;
  }

  private findLongestPathFrom(nodeId: string, visited: Set<string>): string[] {
    if (visited.has(nodeId)) return [];
    
    visited.add(nodeId);
    let longestPath = [nodeId];
    
    this.graph.edges.forEach(edge => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        const path = [nodeId, ...this.findLongestPathFrom(edge.target, new Set(visited))];
        if (path.length > longestPath.length) {
          longestPath = path;
        }
      }
    });
    
    return longestPath;
  }

  private buildDependencyMap(): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    this.graph.nodes.forEach((node, nodeId) => {
      const deps: string[] = [];
      this.graph.edges.forEach(edge => {
        if (edge.target === nodeId && 
            ['extends', 'uses', 'constrains'].includes(edge.relationship)) {
          deps.push(edge.source);
        }
      });
      dependencies.set(nodeId, deps);
    });

    return dependencies;
  }

  private buildDependentMap(): Map<string, string[]> {
    const dependents = new Map<string, string[]>();
    
    this.graph.nodes.forEach((node, nodeId) => {
      const deps: string[] = [];
      this.graph.edges.forEach(edge => {
        if (edge.source === nodeId && 
            ['extends', 'uses', 'constrains'].includes(edge.relationship)) {
          deps.push(edge.target);
        }
      });
      dependents.set(nodeId, deps);
    });

    return dependents;
  }

  private findIsolatedNodes(): string[] {
    const isolated: string[] = [];
    
    this.graph.nodes.forEach((node, nodeId) => {
      let hasEdges = false;
      this.graph.edges.forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          hasEdges = true;
        }
      });
      
      if (!hasEdges) {
        isolated.push(nodeId);
      }
    });

    return isolated;
  }

  private findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    this.graph.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        const cycle = this.detectCycle(nodeId, visited, recursionStack, []);
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    });

    return cycles;
  }

  private detectCycle(
    nodeId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): string[] {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    this.graph.edges.forEach(edge => {
      if (edge.source === nodeId) {
        if (!visited.has(edge.target)) {
          const cycle = this.detectCycle(edge.target, visited, recursionStack, [...path]);
          if (cycle.length > 0) return cycle;
        } else if (recursionStack.has(edge.target)) {
          // Found a cycle
          const cycleStart = path.indexOf(edge.target);
          return path.slice(cycleStart);
        }
      }
    });

    recursionStack.delete(nodeId);
    return [];
  }

  // Utility methods
  
  private generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetadata(): void {
    this.graph.metadata.updatedAt = new Date();
  }

  // Export and serialization methods
  
  public exportGraph(format: 'json' | 'dot' | 'cytoscape' = 'json'): string {
    switch (format) {
      case 'json':
        return this.exportAsJSON();
      case 'dot':
        return this.exportAsDot();
      case 'cytoscape':
        return this.exportAsCytoscape();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportAsJSON(): string {
    const graphData = {
      metadata: this.graph.metadata,
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values())
    };
    return JSON.stringify(graphData, null, 2);
  }

  private exportAsDot(): string {
    let dot = `digraph "${this.graph.metadata.name}" {\n`;
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add nodes
    this.graph.nodes.forEach(node => {
      const color = this.getNodeColor(node.category);
      dot += `  "${node.id}" [label="${node.name}", fillcolor="${color}", style=filled];\n`;
    });

    dot += '\n';

    // Add edges
    this.graph.edges.forEach(edge => {
      const color = this.getEdgeColor(edge.relationship);
      dot += `  "${edge.source}" -> "${edge.target}" [label="${edge.relationship}", color="${color}", weight=${edge.strength}];\n`;
    });

    dot += '}';
    return dot;
  }

  private exportAsCytoscape(): string {
    const elements = {
      nodes: Array.from(this.graph.nodes.values()).map(node => ({
        data: {
          id: node.id,
          label: node.name,
          type: node.type,
          category: node.category,
          complexity: node.complexity
        }
      })),
      edges: Array.from(this.graph.edges.values()).map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          relationship: edge.relationship,
          strength: edge.strength
        }
      }))
    };

    return JSON.stringify(elements, null, 2);
  }

  private getNodeColor(category: string): string {
    const colors = {
      'built-in': '#3B82F6',      // Blue
      'user-defined': '#10B981',  // Green
      'utility': '#8B5CF6',       // Purple
      'advanced': '#F59E0B',      // Amber
      'custom': '#EF4444'         // Red
    };
    return colors[category] || '#6B7280'; // Gray default
  }

  private getEdgeColor(relationship: string): string {
    const colors = {
      'extends': '#10B981',       // Green
      'implements': '#3B82F6',    // Blue
      'composes': '#8B5CF6',      // Purple
      'uses': '#F59E0B',          // Amber
      'constrains': '#EF4444',    // Red
      'transforms': '#EC4899',    // Pink
      'returns': '#06B6D4',       // Cyan
      'accepts': '#84CC16',       // Lime
      'contains': '#F97316'       // Orange
    };
    return colors[relationship] || '#6B7280'; // Gray default
  }

  // Public accessors
  
  public getGraph(): TypeGraph {
    return {
      nodes: new Map(this.graph.nodes),
      edges: new Map(this.graph.edges),
      metadata: { ...this.graph.metadata }
    };
  }

  public getNodes(): TypeNode[] {
    return Array.from(this.graph.nodes.values());
  }

  public getEdges(): TypeEdge[] {
    return Array.from(this.graph.edges.values());
  }

  public getMetadata() {
    return { ...this.graph.metadata };
  }

  public setMetadata(metadata: Partial<TypeGraph['metadata']>): void {
    this.graph.metadata = { ...this.graph.metadata, ...metadata };
    this.updateMetadata();
  }

  // Static utility methods
  
  public static fromJSON(jsonString: string): TypeGraphBuilder {
    const data = JSON.parse(jsonString);
    const builder = new TypeGraphBuilder(data.metadata?.name || 'Imported Graph');
    
    // Clear default nodes and edges
    builder.graph.nodes.clear();
    builder.graph.edges.clear();
    
    // Import nodes
    if (data.nodes) {
      data.nodes.forEach((node: TypeNode) => {
        builder.graph.nodes.set(node.id, node);
      });
    }
    
    // Import edges
    if (data.edges) {
      data.edges.forEach((edge: TypeEdge) => {
        builder.graph.edges.set(edge.id, edge);
      });
    }
    
    // Import metadata
    if (data.metadata) {
      builder.graph.metadata = { ...builder.graph.metadata, ...data.metadata };
    }
    
    return builder;
  }

  public static createEmpty(name: string = 'Empty Graph'): TypeGraphBuilder {
    const builder = new TypeGraphBuilder(name);
    builder.graph.nodes.clear();
    builder.graph.edges.clear();
    return builder;
  }
}

// Create and export the default type graph
const defaultTypeGraph = new TypeGraphBuilder('TypeScript Type System');

export default defaultTypeGraph;
export { TypeGraphBuilder };