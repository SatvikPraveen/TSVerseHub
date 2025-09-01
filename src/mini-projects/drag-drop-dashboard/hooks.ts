// File: mini-projects/drag-drop-dashboard/hooks.ts

import { useCallback, useRef, useState, useEffect } from 'react';

export interface DragState {
  isDragging: boolean;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
}

export interface DragAndDropOptions {
  onDragStart?: (event: MouseEvent) => void;
  onDrag?: (deltaX: number, deltaY: number, event: MouseEvent) => void;
  onDragEnd?: (event: MouseEvent) => void;
  disabled?: boolean;
  dragThreshold?: number;
}

export interface DragResult {
  dragProps: {
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
  };
  isDragging: boolean;
  dragState: DragState | null;
}

export function useDragAndDrop(options: DragAndDropOptions = {}): DragResult {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    disabled = false,
    dragThreshold = 5
  } = options;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragRef.current || !startPositionRef.current) return;

    event.preventDefault();
    
    const deltaX = event.clientX - startPositionRef.current.x;
    const deltaY = event.clientY - startPositionRef.current.y;

    // Check if we've moved beyond the drag threshold
    if (!dragRef.current.isDragging && 
        Math.abs(deltaX) + Math.abs(deltaY) > dragThreshold) {
      dragRef.current = {
        ...dragRef.current,
        isDragging: true
      };
      setDragState(dragRef.current);
      onDragStart?.(event);
    }

    if (dragRef.current.isDragging) {
      dragRef.current = {
        ...dragRef.current,
        currentPosition: { x: event.clientX, y: event.clientY },
        offset: { x: deltaX, y: deltaY }
      };
      setDragState(dragRef.current);
      onDrag?.(deltaX, deltaY, event);
    }
  }, [onDragStart, onDrag, dragThreshold]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (dragRef.current) {
      onDragEnd?.(event);
      dragRef.current = null;
      startPositionRef.current = null;
      setDragState(null);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [onDragEnd, handleMouseMove]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!dragRef.current || !startPositionRef.current) return;

    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - startPositionRef.current.x;
    const deltaY = touch.clientY - startPositionRef.current.y;

    if (!dragRef.current.isDragging && 
        Math.abs(deltaX) + Math.abs(deltaY) > dragThreshold) {
      dragRef.current = {
        ...dragRef.current,
        isDragging: true
      };
      setDragState(dragRef.current);
      // Create a mock MouseEvent for onDragStart
      const mockEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      onDragStart?.(mockEvent);
    }

    if (dragRef.current.isDragging) {
      dragRef.current = {
        ...dragRef.current,
        currentPosition: { x: touch.clientX, y: touch.clientY },
        offset: { x: deltaX, y: deltaY }
      };
      setDragState(dragRef.current);
      
      // Create a mock MouseEvent for onDrag
      const mockEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      onDrag?.(deltaX, deltaY, mockEvent);
    }
  }, [onDragStart, onDrag, dragThreshold]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (dragRef.current) {
      // Create a mock MouseEvent for onDragEnd
      const touch = event.changedTouches[0];
      const mockEvent = new MouseEvent('mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      onDragEnd?.(mockEvent);
      
      dragRef.current = null;
      startPositionRef.current = null;
      setDragState(null);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [onDragEnd, handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    
    startPositionRef.current = { x: event.clientX, y: event.clientY };
    dragRef.current = {
      isDragging: false,
      startPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: event.clientX, y: event.clientY },
      offset: { x: 0, y: 0 }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    dragRef.current = {
      isDragging: false,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      offset: { x: 0, y: 0 }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return {
    dragProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart
    },
    isDragging: dragState?.isDragging ?? false,
    dragState
  };
}

// Hook for drop zones
export interface DropZoneOptions {
  onDrop?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  accept?: string[];
}

export interface DropZoneResult {
  dropProps: {
    onDrop: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    onDragEnter: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
  };
  isOver: boolean;
}

export function useDropZone(options: DropZoneOptions = {}): DropZoneResult {
  const { onDrop, onDragOver, onDragEnter, onDragLeave, accept } = options;
  const [isOver, setIsOver] = useState(false);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsOver(false);
    
    if (accept && accept.length > 0) {
      const types = Array.from(event.dataTransfer.types);
      const hasAcceptedType = accept.some(acceptedType => 
        types.some(type => type.includes(acceptedType))
      );
      if (!hasAcceptedType) return;
    }
    
    onDrop?.(event.nativeEvent);
  }, [onDrop, accept]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    onDragOver?.(event.nativeEvent);
  }, [onDragOver]);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsOver(true);
    onDragEnter?.(event.nativeEvent);
  }, [onDragEnter]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsOver(false);
    onDragLeave?.(event.nativeEvent);
  }, [onDragLeave]);

  return {
    dropProps: {
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave
    },
    isOver
  };
}

// Hook for grid snap functionality
export interface GridSnapOptions {
  gridSize?: number;
  enabled?: boolean;
}

export function useGridSnap(options: GridSnapOptions = {}) {
  const { gridSize = 20, enabled = true } = options;

  const snapToGrid = useCallback((x: number, y: number) => {
    if (!enabled) return { x, y };
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [gridSize, enabled]);

  return { snapToGrid };
}

// Hook for managing multiple draggable items
export interface DraggableItem {
  id: string;
  position: { x: number; y: number };
  data?: any;
}

export interface DraggableManagerOptions<T extends DraggableItem> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  gridSnap?: GridSnapOptions;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export function useDraggableManager<T extends DraggableItem>(
  options: DraggableManagerOptions<T>
) {
  const { items, onItemsChange, gridSnap, bounds } = options;
  const { snapToGrid } = useGridSnap(gridSnap);

  const updateItemPosition = useCallback((id: string, newPosition: { x: number; y: number }) => {
    let adjustedPosition = newPosition;
    
    // Apply grid snapping
    if (gridSnap?.enabled) {
      adjustedPosition = snapToGrid(newPosition.x, newPosition.y);
    }
    
    // Apply bounds constraints
    if (bounds) {
      adjustedPosition = {
        x: Math.max(bounds.left, Math.min(bounds.right - 280, adjustedPosition.x)), // 280 is card width
        y: Math.max(bounds.top, Math.min(bounds.bottom - 200, adjustedPosition.y)) // 200 is min card height
      };
    }

    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, position: adjustedPosition }
        : item
    );
    
    onItemsChange(updatedItems);
  }, [items, onItemsChange, snapToGrid, gridSnap?.enabled, bounds]);

  const getItemById = useCallback((id: string) => {
    return items.find(item => item.id === id);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const addItem = useCallback((item: T) => {
    const updatedItems = [...items, item];
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  return {
    updateItemPosition,
    getItemById,
    removeItem,
    addItem,
    items
  };
}