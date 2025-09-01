// File location: src/components/charts/TypeRelationsGraph.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface TypeNode {
  id: string;
  name: string;
  type: 'primitive' | 'object' | 'array' | 'function' | 'generic' | 'utility' | 'interface' | 'class' | 'enum' | 'union' | 'intersection';
  description: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  category: 'built-in' | 'user-defined' | 'utility' | 'advanced';
  complexity: 1 | 2 | 3 | 4 | 5;
  examples: string[];
}

interface TypeRelation {
  source: string;
  target: string;
  type: 'extends' | 'implements' | 'composes' | 'uses' | 'constrains' | 'transforms';
  strength: number; // 1-10, affects line thickness
  description: string;
}

interface GraphProps {
  width?: number;
  height?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  className?: string;
  selectedTypes?: string[];
  onNodeClick?: (node: TypeNode) => void;
  onRelationClick?: (relation: TypeRelation) => void;
}

// Sample TypeScript type system data
const TYPESCRIPT_NODES: TypeNode[] = [
  // Primitive Types
  {
    id: 'string',
    name: 'string',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Basic string primitive type',
    examples: ['"hello"', "'world'", '`template ${string}`']
  },
  {
    id: 'number',
    name: 'number',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Numeric primitive type',
    examples: ['42', '3.14', '0xff', '1e10']
  },
  {
    id: 'boolean',
    name: 'boolean',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Boolean primitive type',
    examples: ['true', 'false']
  },
  {
    id: 'void',
    name: 'void',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Represents absence of value',
    examples: ['function log(): void {}']
  },
  {
    id: 'null',
    name: 'null',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Null type',
    examples: ['null']
  },
  {
    id: 'undefined',
    name: 'undefined',
    type: 'primitive',
    category: 'built-in',
    complexity: 1,
    description: 'Undefined type',
    examples: ['undefined']
  },
  
  // Object Types
  {
    id: 'object',
    name: 'object',
    type: 'object',
    category: 'built-in',
    complexity: 2,
    description: 'General object type',
    examples: ['{}', '{ key: value }']
  },
  {
    id: 'array',
    name: 'Array<T>',
    type: 'array',
    category: 'built-in',
    complexity: 2,
    description: 'Generic array type',
    examples: ['number[]', 'Array<string>', 'readonly T[]']
  },
  {
    id: 'function',
    name: 'Function',
    type: 'function',
    category: 'built-in',
    complexity: 2,
    description: 'Function type',
    examples: ['() => void', '(x: number) => string', 'Function']
  },
  
  // Interfaces and Classes
  {
    id: 'interface',
    name: 'Interface',
    type: 'interface',
    category: 'user-defined',
    complexity: 3,
    description: 'Contract defining object shape',
    examples: ['interface User { name: string; }']
  },
  {
    id: 'class',
    name: 'Class',
    type: 'class',
    category: 'user-defined',
    complexity: 3,
    description: 'Blueprint for objects',
    examples: ['class Person { constructor() {} }']
  },
  {
    id: 'enum',
    name: 'Enum',
    type: 'enum',
    category: 'user-defined',
    complexity: 2,
    description: 'Named constants',
    examples: ['enum Color { Red, Green, Blue }']
  },
  
  // Generic Types
  {
    id: 'generic',
    name: 'Generic<T>',
    type: 'generic',
    category: 'advanced',
    complexity: 4,
    description: 'Parameterized types',
    examples: ['T', 'K extends keyof T', 'Generic<T, U>']
  },
  
  // Union and Intersection
  {
    id: 'union',
    name: 'Union Types',
    type: 'union',
    category: 'advanced',
    complexity: 3,
    description: 'One of several types',
    examples: ['string | number', 'A | B | C']
  },
  {
    id: 'intersection',
    name: 'Intersection Types',
    type: 'intersection',
    category: 'advanced',
    complexity: 4,
    description: 'Combining multiple types',
    examples: ['A & B', 'User & Admin']
  },
  
  // Utility Types
  {
    id: 'partial',
    name: 'Partial<T>',
    type: 'utility',
    category: 'utility',
    complexity: 3,
    description: 'Makes all properties optional',
    examples: ['Partial<User>', '{ name?: string; age?: number; }']
  },
  {
    id: 'required',
    name: 'Required<T>',
    type: 'utility',
    category: 'utility',
    complexity: 3,
    description: 'Makes all properties required',
    examples: ['Required<User>', '{ name: string; age: number; }']
  },
  {
    id: 'readonly',
    name: 'Readonly<T>',
    type: 'utility',
    category: 'utility',
    complexity: 3,
    description: 'Makes all properties readonly',
    examples: ['Readonly<User>', '{ readonly name: string; }']
  },
  {
    id: 'pick',
    name: 'Pick<T, K>',
    type: 'utility',
    category: 'utility',
    complexity: 4,
    description: 'Picks specific properties',
    examples: ['Pick<User, "name" | "email">']
  },
  {
    id: 'omit',
    name: 'Omit<T, K>',
    type: 'utility',
    category: 'utility',
    complexity: 4,
    description: 'Omits specific properties',
    examples: ['Omit<User, "password">']
  },
  {
    id: 'record',
    name: 'Record<K, T>',
    type: 'utility',
    category: 'utility',
    complexity: 4,
    description: 'Creates object type with specific keys',
    examples: ['Record<string, number>', '{ [key: string]: number }']
  }
];

const TYPESCRIPT_RELATIONS: TypeRelation[] = [
  // Basic type relationships
  { source: 'interface', target: 'object', type: 'extends', strength: 8, description: 'Interfaces define object structure' },
  { source: 'class', target: 'object', type: 'extends', strength: 8, description: 'Classes create objects' },
  { source: 'class', target: 'interface', type: 'implements', strength: 7, description: 'Classes can implement interfaces' },
  { source: 'array', target: 'object', type: 'extends', strength: 6, description: 'Arrays are objects' },
  { source: 'function', target: 'object', type: 'extends', strength: 5, description: 'Functions are objects' },
  
  // Generic relationships
  { source: 'generic', target: 'interface', type: 'constrains', strength: 7, description: 'Generics can constrain interfaces' },
  { source: 'generic', target: 'class', type: 'constrains', strength: 7, description: 'Generics can constrain classes' },
  { source: 'array', target: 'generic', type: 'uses', strength: 9, description: 'Arrays use generic parameters' },
  
  // Union and Intersection
  { source: 'union', target: 'string', type: 'composes', strength: 5, description: 'Unions can include primitives' },
  { source: 'union', target: 'number', type: 'composes', strength: 5, description: 'Unions can include primitives' },
  { source: 'union', target: 'object', type: 'composes', strength: 6, description: 'Unions can include objects' },
  { source: 'intersection', target: 'interface', type: 'composes', strength: 8, description: 'Intersections combine interfaces' },
  { source: 'intersection', target: 'object', type: 'composes', strength: 7, description: 'Intersections combine objects' },
  
  // Utility type relationships
  { source: 'partial', target: 'generic', type: 'uses', strength: 9, description: 'Utility types use generics' },
  { source: 'partial', target: 'interface', type: 'transforms', strength: 8, description: 'Transforms interface properties' },
  { source: 'required', target: 'generic', type: 'uses', strength: 9, description: 'Utility types use generics' },
  { source: 'required', target: 'interface', type: 'transforms', strength: 8, description: 'Transforms interface properties' },
  { source: 'readonly', target: 'generic', type: 'uses', strength: 9, description: 'Utility types use generics' },
  { source: 'readonly', target: 'interface', type: 'transforms', strength: 8, description: 'Transforms interface properties' },
  { source: 'pick', target: 'generic', type: 'uses', strength: 9, description: 'Pick uses generics' },
  { source: 'pick', target: 'interface', type: 'transforms', strength: 8, description: 'Picks from interfaces' },
  { source: 'omit', target: 'generic', type: 'uses', strength: 9, description: 'Omit uses generics' },
  { source: 'omit', target: 'interface', type: 'transforms', strength: 8, description: 'Omits from interfaces' },
  { source: 'record', target: 'generic', type: 'uses', strength: 9, description: 'Record uses generics' },
  { source: 'record', target: 'object', type: 'transforms', strength: 8, description: 'Creates object types' }
];

const TypeRelationsGraph: React.FC<GraphProps> = ({
  width = 800,
  height = 600,
  showLabels = true,
  showLegend = true,
  interactive = true,
  className = '',
  selectedTypes = [],
  onNodeClick,
  onRelationClick
}) => {
  const { isDarkMode } = useDarkMode();
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<TypeNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<any>(null);

  // Color schemes
  const colors = {
    primitive: isDarkMode ? '#60A5FA' : '#2563EB',    // Blue
    object: isDarkMode ? '#10B981' : '#059669',       // Green
    array: isDarkMode ? '#8B5CF6' : '#7C3AED',        // Purple
    function: isDarkMode ? '#F59E0B' : '#D97706',     // Amber
    generic: isDarkMode ? '#EF4444' : '#DC2626',      // Red
    utility: isDarkMode ? '#EC4899' : '#DB2777',      // Pink
    interface: isDarkMode ? '#06B6D4' : '#0891B2',    // Cyan
    class: isDarkMode ? '#84CC16' : '#65A30D',        // Lime
    enum: isDarkMode ? '#F97316' : '#EA580C',         // Orange
    union: isDarkMode ? '#A855F7' : '#9333EA',        // Violet
    intersection: isDarkMode ? '#14B8A6' : '#0D9488', // Teal
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    border: isDarkMode ? '#4B5563' : '#D1D5DB',
    grid: isDarkMode ? '#374151' : '#E5E7EB'
  };

  const relationColors = {
    extends: '#10B981',     // Green
    implements: '#3B82F6',  // Blue
    composes: '#8B5CF6',    // Purple
    uses: '#F59E0B',        // Amber
    constrains: '#EF4444',  // Red
    transforms: '#EC4899'   // Pink
  };

  // Initialize force simulation
  useEffect(() => {
    const d3 = (window as any).d3;
    if (!d3) {
      // Load D3 if not available
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
      script.onload = () => initializeSimulation();
      document.head.appendChild(script);
    } else {
      initializeSimulation();
    }
  }, [width, height]);

  const initializeSimulation = () => {
    const d3 = (window as any).d3;
    if (!d3) return;

    const nodesCopy = TYPESCRIPT_NODES.map(node => ({
      ...node,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50
    }));

    const sim = d3.forceSimulation(nodesCopy)
      .force('link', d3.forceLink(TYPESCRIPT_RELATIONS)
        .id((d: any) => d.id)
        .distance((d: any) => 80 + (5 - d.strength) * 10)
        .strength(0.8)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))
      .on('tick', () => {
        setNodes([...nodesCopy]);
      });

    setSimulation(sim);
    setNodes(nodesCopy);
  };

  const filteredNodes = useMemo(() => {
    if (selectedTypes.length === 0) return nodes;
    return nodes.filter(node => selectedTypes.includes(node.id));
  }, [nodes, selectedTypes]);

  const filteredRelations = useMemo(() => {
    if (selectedTypes.length === 0) return TYPESCRIPT_RELATIONS;
    return TYPESCRIPT_RELATIONS.filter(rel => 
      selectedTypes.includes(rel.source) || selectedTypes.includes(rel.target)
    );
  }, [selectedTypes]);

  const handleNodeClick = (node: TypeNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    onNodeClick?.(node);
  };

  const handleNodeMouseEnter = (nodeId: string) => {
    setHoveredNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  const getNodeRadius = (node: TypeNode) => {
    let baseRadius = 20;
    if (node.complexity >= 4) baseRadius += 8;
    else if (node.complexity >= 3) baseRadius += 4;
    
    if (hoveredNode === node.id || selectedNode === node.id) {
      baseRadius += 5;
    }
    
    return baseRadius;
  };

  const getNodeOpacity = (node: TypeNode) => {
    if (!hoveredNode && !selectedNode) return 1;
    if (hoveredNode === node.id || selectedNode === node.id) return 1;
    
    // Check if node is connected to hovered/selected node
    const isConnected = TYPESCRIPT_RELATIONS.some(rel => 
      (rel.source === node.id || rel.target === node.id) && 
      (rel.source === hoveredNode || rel.target === hoveredNode ||
       rel.source === selectedNode || rel.target === selectedNode)
    );
    
    return isConnected ? 0.8 : 0.3;
  };

  const getRelationOpacity = (relation: TypeRelation) => {
    if (!hoveredNode && !selectedNode) return 0.6;
    return (relation.source === hoveredNode || relation.target === hoveredNode ||
            relation.source === selectedNode || relation.target === selectedNode) ? 1 : 0.2;
  };

  const getRelationWidth = (relation: TypeRelation) => {
    return Math.max(1, relation.strength / 2);
  };

  return (
    <div className={`type-relations-graph bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          TypeScript Type System Graph
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => simulation?.restart()}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
          >
            🔄 Reset Layout
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredNodes.length} types, {filteredRelations.length} relations
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border border-gray-200 dark:border-gray-600 rounded-lg"
          style={{ background: colors.background }}
        >
          {/* Grid Pattern */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke={colors.grid}
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
            
            {/* Arrow markers for relations */}
            <defs>
              {Object.entries(relationColors).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  viewBox="0 -5 10 10"
                  refX="8"
                  refY="0"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5" fill={color} />
                </marker>
              ))}
            </defs>
          </defs>
          
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Relations */}
          <g className="relations">
            {TYPESCRIPT_RELATIONS.map((relation, index) => {
              const sourceNode = nodes.find(n => n.id === relation.source);
              const targetNode = nodes.find(n => n.id === relation.target);
              
              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={`${relation.source}-${relation.target}-${index}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={relationColors[relation.type]}
                  strokeWidth={getRelationWidth(relation)}
                  opacity={getRelationOpacity(relation)}
                  markerEnd={`url(#arrow-${relation.type})`}
                  className={interactive ? 'cursor-pointer' : ''}
                  onClick={() => interactive && onRelationClick?.(relation)}
                >
                  <title>{`${relation.type}: ${relation.description}`}</title>
                </line>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map(node => (
              <g key={node.id} className={interactive ? 'cursor-pointer' : ''}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeRadius(node)}
                  fill={colors[node.type]}
                  opacity={getNodeOpacity(node)}
                  stroke={selectedNode === node.id ? '#FFFFFF' : colors.border}
                  strokeWidth={selectedNode === node.id ? 3 : 1}
                  onClick={() => interactive && handleNodeClick(node)}
                  onMouseEnter={() => interactive && handleNodeMouseEnter(node.id)}
                  onMouseLeave={() => interactive && handleNodeMouseLeave()}
                  className="transition-all duration-200"
                />
                
                {/* Node labels */}
                {showLabels && (
                  <text
                    x={node.x}
                    y={node.y + getNodeRadius(node) + 15}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="10"
                    fontWeight="500"
                    opacity={getNodeOpacity(node)}
                    className="pointer-events-none select-none"
                  >
                    {node.name}
                  </text>
                )}
                
                {/* Complexity indicator */}
                {node.complexity >= 3 && (
                  <circle
                    cx={node.x + getNodeRadius(node) - 5}
                    cy={node.y - getNodeRadius(node) + 5}
                    r="4"
                    fill={node.complexity >= 4 ? '#EF4444' : '#F59E0B'}
                    opacity={getNodeOpacity(node)}
                    className="pointer-events-none"
                  >
                    <title>Complexity: {node.complexity}/5</title>
                  </circle>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Node Info Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-600">
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {node.name}
                    </h3>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colors[node.type] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {node.type} • {node.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      {node.description}
                    </p>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-700 dark:text-gray-300">Complexity:</span>
                      {[1, 2, 3, 4, 5].map(i => (
                        <span
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i <= node.complexity 
                              ? 'bg-red-400' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Examples:
                      </h4>
                      <div className="space-y-1">
                        {node.examples.map((example, idx) => (
                          <code 
                            key={idx}
                            className="block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono"
                          >
                            {example}
                          </code>
                        ))}
                      </div>
                    </div>
                    
                    {/* Connected types */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Connections:
                      </h4>
                      <div className="space-y-1">
                        {TYPESCRIPT_RELATIONS
                          .filter(rel => rel.source === node.id || rel.target === node.id)
                          .map((rel, idx) => {
                            const connectedNode = rel.source === node.id 
                              ? nodes.find(n => n.id === rel.target)
                              : nodes.find(n => n.id === rel.source);
                            
                            if (!connectedNode) return null;
                            
                            return (
                              <div 
                                key={idx}
                                className="flex items-center space-x-2 text-xs"
                              >
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: relationColors[rel.type] }}
                                />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {rel.type} {connectedNode.name}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node Types Legend */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Type Categories
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(colors).slice(0, 11).map(([type, color]) => (
                <div key={type} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {type.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Relation Types Legend */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Relationship Types
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {Object.entries(relationColors).map(([type, color]) => (
                <div key={type} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-1 rounded" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {(() => {
                      switch(type) {
                        case 'extends': return 'inheritance relationship';
                        case 'implements': return 'contract implementation';
                        case 'composes': return 'composition relationship';
                        case 'uses': return 'utilization dependency';
                        case 'constrains': return 'generic constraint';
                        case 'transforms': return 'type transformation';
                        default: return '';
                      }
                    })()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>💡 Tip: Click nodes to explore relationships</span>
          {interactive && (
            <>
              <span>•</span>
              <span>Hover for quick info</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Complexity:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" title="Medium complexity" />
            <span className="w-2 h-2 rounded-full bg-red-400" title="High complexity" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeRelationsGraph;