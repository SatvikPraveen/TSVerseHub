// File: mini-projects/drag-drop-dashboard/Dashboard.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import DraggableCard, { CardData } from './DraggableCard';
import { useDraggableManager, useDropZone, useGridSnap } from './hooks';

interface DashboardCard extends CardData {
  position: { x: number; y: number };
  zIndex: number;
}

interface DashboardProps {
  initialCards?: DashboardCard[];
  gridEnabled?: boolean;
  gridSize?: number;
}

const defaultCards: DashboardCard[] = [
  {
    id: '1',
    title: 'Revenue',
    content: 'Monthly revenue tracking',
    type: 'metric',
    color: '#10B981',
    value: '$45,230',
    trend: 'up',
    position: { x: 50, y: 50 },
    zIndex: 1
  },
  {
    id: '2',
    title: 'User Growth',
    content: 'Active users over time',
    type: 'chart',
    color: '#3B82F6',
    data: [45, 67, 43, 89, 56, 78, 92],
    position: { x: 350, y: 50 },
    zIndex: 1
  },
  {
    id: '3',
    title: 'Recent Tasks',
    content: 'Latest completed tasks',
    type: 'list',
    color: '#8B5CF6',
    data: [
      'Complete dashboard design',
      'Review pull requests',
      'Update documentation',
      'Deploy to staging',
      'Fix responsive issues'
    ],
    position: { x: 650, y: 50 },
    zIndex: 1
  },
  {
    id: '4',
    title: 'System Status',
    content: 'All systems operational. Last check: 5 minutes ago',
    type: 'text',
    color: '#F59E0B',
    position: { x: 200, y: 300 },
    zIndex: 1
  }
];

const Dashboard: React.FC<DashboardProps> = ({
  initialCards = defaultCards,
  gridEnabled = true,
  gridSize = 20
}) => {
  const [cards, setCards] = useState<DashboardCard[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardPosition, setNewCardPosition] = useState<{ x: number; y: number } | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const nextZIndex = useRef(cards.length + 1);

  const { snapToGrid } = useGridSnap({ gridSize, enabled: gridEnabled });
  
  const { updateItemPosition, removeItem, addItem } = useDraggableManager({
    items: cards,
    onItemsChange: setCards,
    gridSnap: { gridSize, enabled: gridEnabled },
    bounds: dashboardRef.current ? {
      left: 0,
      top: 0,
      right: dashboardRef.current.clientWidth,
      bottom: dashboardRef.current.clientHeight
    } : undefined
  });

  const { dropProps, isOver } = useDropZone({
    onDrop: (event) => {
      const rect = dashboardRef.current?.getBoundingClientRect();
      if (rect) {
        const position = {
          x: event.clientX - rect.left - 140, // Center the card
          y: event.clientY - rect.top - 100
        };
        setNewCardPosition(gridEnabled ? snapToGrid(position.x, position.y) : position);
        setIsAddingCard(true);
      }
    }
  });

  const handleCardPositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    updateItemPosition(id, position);
    
    // Bring card to front when dragging
    setCards(prev => prev.map(card => 
      card.id === id 
        ? { ...card, zIndex: nextZIndex.current++ }
        : card
    ));
  }, [updateItemPosition]);

  const handleCardEdit = useCallback((updatedCard: CardData) => {
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id 
        ? { ...card, ...updatedCard }
        : card
    ));
  }, []);

  const handleCardDelete = useCallback((id: string) => {
    removeItem(id);
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
  }, [removeItem, selectedCardId]);

  const handleAddNewCard = useCallback((cardData: Partial<CardData>) => {
    if (!newCardPosition) return;

    const newCard: DashboardCard = {
      id: `card-${Date.now()}`,
      title: cardData.title || 'New Card',
      content: cardData.content || 'Card description',
      type: cardData.type || 'text',
      color: cardData.color || '#6B7280',
      position: newCardPosition,
      zIndex: nextZIndex.current++,
      ...cardData
    };

    addItem(newCard);
    setIsAddingCard(false);
    setNewCardPosition(null);
  }, [newCardPosition, addItem]);

  const handleDashboardClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedCardId(null);
    }
  }, []);

  const exportLayout = useCallback(() => {
    const layoutData = {
      cards: cards.map(({ position, ...card }) => ({
        ...card,
        x: position.x,
        y: position.y
      })),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(layoutData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-layout.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [cards]);

  const clearDashboard = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all cards?')) {
      setCards([]);
      setSelectedCardId(null);
    }
  }, []);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Drag & Drop Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Drag cards to rearrange • Right-click to edit • Drop anywhere to add new cards
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Grid</span>
            </label>
            
            <button
              onClick={exportLayout}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Layout
            </button>
            
            <button
              onClick={clearDashboard}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Canvas */}
      <div
        ref={dashboardRef}
        className={`relative flex-1 overflow-hidden ${
          isOver ? 'bg-blue-50' : 'bg-gray-50'
        } transition-colors duration-200`}
        onClick={handleDashboardClick}
        {...dropProps}
        style={{
          backgroundImage: showGrid ? 
            `radial-gradient(circle, #d1d5db 1px, transparent 1px)` : 'none',
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto'
        }}
      >
        {/* Drop Zone Indicator */}
        {isOver && (
          <div className="absolute inset-0 border-4 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-lg font-semibold text-blue-700">Drop to create new card</div>
                <div className="text-sm text-blue-600">Release mouse to add card here</div>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            position={card.position}
            onPositionChange={handleCardPositionChange}
            onEdit={handleCardEdit}
            onDelete={handleCardDelete}
            zIndex={card.zIndex}
          />
        ))}

        {/* Add Card Modal */}
        {isAddingCard && newCardPosition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
              
              <AddCardForm
                onSubmit={handleAddNewCard}
                onCancel={() => {
                  setIsAddingCard(false);
                  setNewCardPosition(null);
                }}
                position={newCardPosition}
              />
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow px-4 py-2 border">
          <div className="text-sm text-gray-600">
            Cards: {cards.length} | Grid: {gridEnabled ? 'On' : 'Off'} | 
            Size: {gridSize}px
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Card Form Component
interface AddCardFormProps {
  onSubmit: (cardData: Partial<CardData>) => void;
  onCancel: () => void;
  position: { x: number; y: number };
}

const AddCardForm: React.FC<AddCardFormProps> = ({ onSubmit, onCancel, position }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as CardData['type'],
    color: '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const cardTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'metric', label: 'Metric' },
    { value: 'chart', label: 'Chart' },
    { value: 'list', label: 'List' }
  ];

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter card title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter card content"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CardData['type'] }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cardTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex space-x-2">
          {colorOptions.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Position: x:{position.x}, y:{position.y}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default Dashboard;