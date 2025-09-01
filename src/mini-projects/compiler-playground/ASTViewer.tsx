// File: mini-projects/compiler-playground/ASTViewer.tsx

import React from 'react';

export interface ASTNode {
  type: string;
  value?: string | number;
  children?: ASTNode[];
  line?: number;
  column?: number;
}

interface ASTViewerProps {
  ast: ASTNode | null;
  className?: string;
}

const ASTViewer: React.FC<ASTViewerProps> = ({ ast, className = '' }) => {
  if (!ast) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500 italic">No AST to display</p>
      </div>
    );
  }

  const renderNode = (node: ASTNode, depth: number = 0): React.ReactElement => {
    const indent = depth * 20;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={`${node.type}-${depth}-${Math.random()}`} className="ast-node">
        <div 
          className="flex items-center py-1 hover:bg-gray-50 rounded"
          style={{ paddingLeft: `${indent}px` }}
        >
          <span className="inline-block w-4 h-4 mr-2 text-xs text-gray-400">
            {hasChildren ? '▼' : '●'}
          </span>
          <span className="font-semibold text-blue-600 mr-2">
            {node.type}
          </span>
          {node.value !== undefined && (
            <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-sm">
              {typeof node.value === 'string' ? `"${node.value}"` : node.value}
            </span>
          )}
          {node.line !== undefined && (
            <span className="ml-auto text-xs text-gray-400">
              {node.line}:{node.column}
            </span>
          )}
        </div>
        {hasChildren && (
          <div className="ast-children">
            {node.children!.map((child, index) => 
              renderNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`ast-viewer bg-white border rounded-lg p-4 font-mono text-sm ${className}`}>
      <div className="mb-3 pb-2 border-b">
        <h3 className="font-bold text-gray-800">Abstract Syntax Tree</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {renderNode(ast)}
      </div>
    </div>
  );
};

export default ASTViewer;