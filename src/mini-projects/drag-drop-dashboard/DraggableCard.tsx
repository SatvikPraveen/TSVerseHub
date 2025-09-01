// File: mini-projects/drag-drop-dashboard/DraggableCard.tsx

import React, { useRef, useState, useCallback } from 'react';
import { useDragAndDrop } from './hooks';

export interface CardData {
  id: string;
  title: string;
  content: string;
  type: 'metric' | 'chart' | 'list' | 'text';
  color?: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  data?: any[];
}

interface DraggableCardProps {
  card: CardData;
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onEdit?: (card: CardData) => void;
  onDelete?: (id: string) => void;
  isDragging?: boolean;
  zIndex?: number;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  position,
  onPositionChange,
  onEdit,
  onDelete,
  isDragging = false,
  zIndex = 1
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localCard, setLocalCard] = useState(card);

  const { dragProps, isDragging: dragState } = useDragAndDrop({
    onDrag: useCallback((deltaX: number, deltaY: number) => {
      onPositionChange(card.id, {
        x: position.x + deltaX,
        y: position.y + deltaY
      });
    }, [card.id, position, onPositionChange])
  });

  const handleEdit = () => {
    if (onEdit) {
      onEdit(localCard);
    }
    setIsEditing(false);
  };

  const handleLocalChange = (field: keyof CardData, value: any) => {
    setLocalCard(prev => ({ ...prev, [field]: value }));
  };

  const renderCardContent = () => {
    switch (card.type) {
      case 'metric':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {card.value}
            </div>
            {card.trend && (
              <div className={`text-sm flex items-center justify-center ${
                card.trend === 'up' ? 'text-green-600' : 
                card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <span className="mr-1">
                  {card.trend === 'up' ? '↗' : card.trend === 'down' ? '↘' : '→'}
                </span>
                {card.trend.charAt(0).toUpperCase() + card.trend.slice(1)}
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-end justify-around p-2">
            {/* Simple bar chart simulation */}
            {(card.data || [40, 60, 30, 80, 45, 70]).map((value, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-t"
                style={{
                  height: `${value}%`,
                  width: '12px',
                  minHeight: '4px'
                }}
              />
            ))}
          </div>
        );

      case 'list':
        const items = card.data || ['Item 1', 'Item 2', 'Item 3'];
        return (
          <ul className="space-y-2">
            {items.slice(0, 4).map((item, index) => (
              <li key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {item}
              </li>
            ))}
            {items.length > 4 && (
              <li className="text-xs text-gray-500">+{items.length - 4} more</li>
            )}
          </ul>
        );

      case 'text':
      default:
        return (
          <p className="text-sm text-gray-600 leading-relaxed">
            {card.content}
          </p>
        );
    }
  };

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white rounded-lg shadow-lg border transition-all duration-200 ${
        dragState || isDragging 
          ? 'shadow-2xl scale-105 border-blue-300 cursor-grabbing' 
          : 'hover:shadow-xl cursor-grab border-gray-200'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        minHeight: '200px',
        zIndex: dragState ? 1000 : zIndex,
        borderLeftColor: card.color || '#3B82F6',
        borderLeftWidth: '4px'
      }}
      {...dragProps}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <input
              type="text"
              value={localCard.title}
              onChange={(e) => handleLocalChange('title', e.target.value)}
              className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              onBlur={handleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              autoFocus
            />
          ) : (
            <h3 
              className="text-lg font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditing(true)}
            >
              {card.title}
            </h3>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit card"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {onDelete && (
              <button
                onClick={() => onDelete(card.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete card"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Card Type Indicator */}
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
            card.type === 'metric' ? 'bg-green-100 text-green-800' :
            card.type === 'chart' ? 'bg-blue-100 text-blue-800' :
            card.type === 'list' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {renderCardContent()}
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
          {isEditing ? (
            <textarea
              value={localCard.content}
              onChange={(e) => handleLocalChange('content', e.target.value)}
              className="w-full text-xs bg-transparent border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
              placeholder="Card description..."
              onBlur={handleEdit}
            />
          ) : (
            <p className="line-clamp-2">
              {card.content || 'No description available'}
            </p>
          )}
        </div>
      </div>

      {/* Drag Handle */}
      <div 
        className="absolute top-2 right-12 opacity-30 hover:opacity-60 cursor-grab active:cursor-grabbing"
        {...dragProps}
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-1 right-1 w-3 h-3 opacity-30 hover:opacity-60 cursor-se-resize"
        style={{
          background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #9CA3AF 40%, #9CA3AF 60%, transparent 60%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default DraggableCard;