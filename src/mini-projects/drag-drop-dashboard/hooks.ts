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

type ActivePointer = 'mouse' | 'touch' | null;

export function useDragAndDrop(options: DragAndDropOptions = {}): DragResult {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    disabled = false,
    dragThreshold = 5
  } = options;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [activePointer, setActivePointer] = useState<ActivePointer>(null);
  const dragRef = useRef<DragState | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  // The latest callbacks are read through a ref so the document listeners stay
  // stable for the whole gesture while still seeing fresh props.
  const callbacksRef = useRef({ onDragStart, onDrag, onDragEnd, dragThreshold });
  useEffect(() => {
    callbacksRef.current = { onDragStart, onDrag, onDragEnd, dragThreshold };
  }, [onDragStart, onDrag, onDragEnd, dragThreshold]);

  const beginDrag = useCallback((x: number, y: number) => {
    startPositionRef.current = { x, y };
    dragRef.current = {
      isDragging: false,
      startPosition: { x, y },
      currentPosition: { x, y },
      offset: { x: 0, y: 0 }
    };
  }, []);

  const moveDrag = useCallback((
    x: number,
    y: number,
    eventFor: (type: 'mousedown' | 'mousemove') => MouseEvent
  ) => {
    if (!dragRef.current || !startPositionRef.current) return;

    const { onDragStart: dragStart, onDrag: drag, dragThreshold: threshold } = callbacksRef.current;
    const deltaX = x - startPositionRef.current.x;
    const deltaY = y - startPositionRef.current.y;

    // Check if we've moved beyond the drag threshold
    if (!dragRef.current.isDragging && 
        Math.abs(deltaX) + Math.abs(deltaY) > threshold) {
      dragRef.current = {
        ...dragRef.current,
        isDragging: true
      };
      setDragState(dragRef.current);
      dragStart?.(eventFor('mousedown'));
    }

    if (dragRef.current.isDragging) {
      dragRef.current = {
        ...dragRef.current,
        currentPosition: { x, y },
        offset: { x: deltaX, y: deltaY }
      };
      setDragState(dragRef.current);
      drag?.(deltaX, deltaY, eventFor('mousemove'));
    }
  }, []);

  const endDrag = useCallback((event: MouseEvent) => {
    if (dragRef.current) {
      callbacksRef.current.onDragEnd?.(event);
      dragRef.current = null;
      startPositionRef.current = null;
      setDragState(null);
    }
    setActivePointer(null);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragRef.current || !startPositionRef.current) return;

    event.preventDefault();
    moveDrag(event.clientX, event.clientY, () => event);
  }, [moveDrag]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    endDrag(event);
  }, [endDrag]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!dragRef.current || !startPositionRef.current) return;

    const touch = event.touches[0];
    if (!touch) return;

    event.preventDefault();
    
    // Touch callbacks receive a synthesized MouseEvent so both input types share one signature
    moveDrag(touch.clientX, touch.clientY, (type) => new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY
    }));
  }, [moveDrag]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const touch = event.changedTouches[0];
    endDrag(new MouseEvent('mouseup', touch ? {
      clientX: touch.clientX,
      clientY: touch.clientY
    } : undefined));
  }, [endDrag]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    beginDrag(event.clientX, event.clientY);
    setActivePointer('mouse');
  }, [disabled, beginDrag]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = event.touches[0];
    if (!touch) return;

    event.preventDefault();
    beginDrag(touch.clientX, touch.clientY);
    setActivePointer('touch');
  }, [disabled, beginDrag]);

  // Document listeners live for exactly one gesture: attached when a pointer
  // goes down, detached when it is released or the component unmounts.
  useEffect(() => {
    if (activePointer === 'mouse') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }

    if (activePointer === 'touch') {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }

    return undefined;
  }, [activePointer, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
  data?: unknown;
}

export interface DraggableBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface DraggableManagerOptions<T extends DraggableItem> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  gridSnap?: GridSnapOptions;
  /**
   * Area items are clamped to. Pass a function when the bounds come from a
   * DOM element: it is called when an item moves, so the measurement is
   * current and is never taken while rendering.
   */
  bounds?: DraggableBounds | (() => DraggableBounds | undefined);
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
    const currentBounds = typeof bounds === 'function' ? bounds() : bounds;
    if (currentBounds) {
      adjustedPosition = {
        x: Math.max(currentBounds.left, Math.min(currentBounds.right - 280, adjustedPosition.x)), // 280 is card width
        y: Math.max(currentBounds.top, Math.min(currentBounds.bottom - 200, adjustedPosition.y)) // 200 is min card height
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