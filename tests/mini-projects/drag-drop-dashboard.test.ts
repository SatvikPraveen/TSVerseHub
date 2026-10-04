// File: tests/mini-projects/drag-drop-dashboard.test.ts
//
// Exercises the real drag-and-drop dashboard hooks: useDragAndDrop (mouse and
// touch gestures driven by synthetic document events), useDropZone,
// useGridSnap and useDraggableManager.

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useDraggableManager,
  useDragAndDrop,
  useDropZone,
  useGridSnap,
  type DragAndDropOptions,
  type DraggableItem,
  type DraggableManagerOptions,
} from '@/mini-projects/drag-drop-dashboard/hooks';

/** Minimal React.MouseEvent stand-in for invoking the onMouseDown prop directly. */
const reactMouseDown = (clientX: number, clientY: number) => {
  const preventDefault = vi.fn();
  return { event: { clientX, clientY, preventDefault } as unknown as React.MouseEvent, preventDefault };
};

/** Minimal React.TouchEvent stand-in for invoking the onTouchStart prop directly. */
const reactTouchStart = (touches: Array<{ clientX: number; clientY: number }>) => {
  const preventDefault = vi.fn();
  return { event: { touches, preventDefault } as unknown as React.TouchEvent, preventDefault };
};

const mouse = (type: 'mousemove' | 'mouseup', clientX: number, clientY: number) => {
  const event = new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true });
  act(() => {
    document.dispatchEvent(event);
  });
  return event;
};

/**
 * jsdom does not implement the Touch constructor, so build TouchEvents with
 * plain touch-point objects attached as the touches / changedTouches lists.
 */
const touch = (
  type: 'touchmove' | 'touchend',
  points: Array<{ clientX: number; clientY: number }>,
  list: 'touches' | 'changedTouches' = type === 'touchmove' ? 'touches' : 'changedTouches'
) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: list === 'touches' ? points : [] });
  Object.defineProperty(event, 'changedTouches', { value: list === 'changedTouches' ? points : [] });
  act(() => {
    document.dispatchEvent(event);
  });
  return event;
};

describe('useDragAndDrop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setup = (options: DragAndDropOptions = {}) => renderHook(props => useDragAndDrop(props), { initialProps: options });

  it('starts idle', () => {
    const { result } = setup();
    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragState).toBeNull();
  });

  it('does not start dragging until the pointer moves beyond the threshold', () => {
    const onDragStart = vi.fn();
    const onDrag = vi.fn();
    const { result } = setup({ onDragStart, onDrag, dragThreshold: 5 });

    const down = reactMouseDown(100, 100);
    act(() => result.current.dragProps.onMouseDown(down.event));
    expect(down.preventDefault).toHaveBeenCalled();

    mouse('mousemove', 102, 102); // |dx| + |dy| = 4 <= 5
    expect(result.current.isDragging).toBe(false);
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDrag).not.toHaveBeenCalled();

    mouse('mousemove', 104, 102); // 6 > 5
    expect(result.current.isDragging).toBe(true);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledWith(4, 2, expect.any(MouseEvent));
  });

  it('tracks offsets for a full mouse gesture and resets on mouseup', () => {
    const onDrag = vi.fn();
    const onDragEnd = vi.fn();
    const { result } = setup({ onDrag, onDragEnd });

    act(() => result.current.dragProps.onMouseDown(reactMouseDown(10, 20).event));
    const move = mouse('mousemove', 60, 5);

    expect(move.defaultPrevented).toBe(true);
    expect(result.current.dragState).toEqual({
      isDragging: true,
      startPosition: { x: 10, y: 20 },
      currentPosition: { x: 60, y: 5 },
      offset: { x: 50, y: -15 },
    });

    mouse('mousemove', 70, 25);
    expect(result.current.dragState?.offset).toEqual({ x: 60, y: 5 });
    expect(onDrag).toHaveBeenLastCalledWith(60, 5, expect.any(MouseEvent));

    const up = mouse('mouseup', 70, 25);
    expect(onDragEnd).toHaveBeenCalledWith(up);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragState).toBeNull();

    // Listeners are detached once the gesture ends
    mouse('mousemove', 200, 200);
    expect(onDrag).toHaveBeenCalledTimes(2);
  });

  it('fires onDragEnd for a click that never crossed the threshold', () => {
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();
    const { result } = setup({ onDragEnd, onDragStart });

    act(() => result.current.dragProps.onMouseDown(reactMouseDown(0, 0).event));
    mouse('mouseup', 0, 0);

    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('ignores document events when no gesture is active', () => {
    const onDrag = vi.fn();
    const onDragEnd = vi.fn();
    setup({ onDrag, onDragEnd });

    mouse('mousemove', 50, 50);
    mouse('mouseup', 50, 50);

    expect(onDrag).not.toHaveBeenCalled();
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('does nothing while disabled', () => {
    const onDragStart = vi.fn();
    const { result } = setup({ disabled: true, onDragStart });

    const down = reactMouseDown(0, 0);
    act(() => result.current.dragProps.onMouseDown(down.event));
    const start = reactTouchStart([{ clientX: 0, clientY: 0 }]);
    act(() => result.current.dragProps.onTouchStart(start.event));
    mouse('mousemove', 100, 100);

    expect(down.preventDefault).not.toHaveBeenCalled();
    expect(start.preventDefault).not.toHaveBeenCalled();
    expect(onDragStart).not.toHaveBeenCalled();
    expect(result.current.isDragging).toBe(false);
  });

  it('uses the latest callbacks mid-gesture', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = setup({ onDrag: first });

    act(() => result.current.dragProps.onMouseDown(reactMouseDown(0, 0).event));
    mouse('mousemove', 10, 0);
    rerender({ onDrag: second });
    mouse('mousemove', 20, 0);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(20, 0, expect.any(MouseEvent));
  });

  it('removes document listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { result, unmount } = setup();

    act(() => result.current.dragProps.onMouseDown(reactMouseDown(0, 0).event));
    unmount();

    const removed = removeSpy.mock.calls.map(call => call[0]);
    expect(removed).toEqual(expect.arrayContaining(['mousemove', 'mouseup']));
  });

  describe('touch', () => {
    it('drives the same gesture from touch events, synthesising MouseEvents for callbacks', () => {
      const onDragStart = vi.fn();
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();
      const { result } = setup({ onDragStart, onDrag, onDragEnd });

      const start = reactTouchStart([{ clientX: 5, clientY: 5 }]);
      act(() => result.current.dragProps.onTouchStart(start.event));
      expect(start.preventDefault).toHaveBeenCalled();

      const move = touch('touchmove', [{ clientX: 25, clientY: 15 }]);
      expect(move.defaultPrevented).toBe(true);
      expect(result.current.dragState).toMatchObject({
        isDragging: true,
        currentPosition: { x: 25, y: 15 },
        offset: { x: 20, y: 10 },
      });

      const startEvent = onDragStart.mock.calls[0]![0] as MouseEvent;
      expect(startEvent).toBeInstanceOf(MouseEvent);
      expect(startEvent.type).toBe('mousedown');
      const dragEvent = onDrag.mock.calls[0]![2] as MouseEvent;
      expect(dragEvent.type).toBe('mousemove');
      expect([dragEvent.clientX, dragEvent.clientY]).toEqual([25, 15]);

      touch('touchend', [{ clientX: 30, clientY: 18 }]);
      const endEvent = onDragEnd.mock.calls[0]![0] as MouseEvent;
      expect(endEvent.type).toBe('mouseup');
      expect([endEvent.clientX, endEvent.clientY]).toEqual([30, 18]);
      expect(result.current.dragState).toBeNull();
    });

    it('ignores touch starts and moves without touch points', () => {
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();
      const { result } = setup({ onDrag, onDragEnd });

      const empty = reactTouchStart([]);
      act(() => result.current.dragProps.onTouchStart(empty.event));
      expect(empty.preventDefault).not.toHaveBeenCalled();

      act(() => result.current.dragProps.onTouchStart(reactTouchStart([{ clientX: 0, clientY: 0 }]).event));
      const move = touch('touchmove', []);
      expect(move.defaultPrevented).toBe(false);
      expect(onDrag).not.toHaveBeenCalled();

      // A touchend with no changed touches still ends the gesture
      touch('touchend', []);
      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect((onDragEnd.mock.calls[0]![0] as MouseEvent).clientX).toBe(0);
    });

    it('does not listen to mouse events during a touch gesture', () => {
      const onDrag = vi.fn();
      const { result } = setup({ onDrag });

      act(() => result.current.dragProps.onTouchStart(reactTouchStart([{ clientX: 0, clientY: 0 }]).event));
      mouse('mousemove', 50, 50);

      expect(onDrag).not.toHaveBeenCalled();
      touch('touchend', [{ clientX: 0, clientY: 0 }]);
    });
  });
});

describe('useDropZone', () => {
  const dragEvent = (types: string[] = []) => {
    const nativeEvent = new DragEvent('drop');
    const preventDefault = vi.fn();
    return {
      event: { preventDefault, nativeEvent, dataTransfer: { types } } as unknown as React.DragEvent,
      nativeEvent,
      preventDefault,
    };
  };

  it('tracks hover state across enter / leave / drop', () => {
    const onDragEnter = vi.fn();
    const onDragLeave = vi.fn();
    const onDragOver = vi.fn();
    const { result } = renderHook(() => useDropZone({ onDragEnter, onDragLeave, onDragOver }));

    expect(result.current.isOver).toBe(false);

    const enter = dragEvent();
    act(() => result.current.dropProps.onDragEnter(enter.event));
    expect(result.current.isOver).toBe(true);
    expect(onDragEnter).toHaveBeenCalledWith(enter.nativeEvent);
    expect(enter.preventDefault).toHaveBeenCalled();

    const over = dragEvent();
    act(() => result.current.dropProps.onDragOver(over.event));
    expect(onDragOver).toHaveBeenCalledWith(over.nativeEvent);
    expect(over.preventDefault).toHaveBeenCalled();

    act(() => result.current.dropProps.onDragLeave(dragEvent().event));
    expect(result.current.isOver).toBe(false);
    expect(onDragLeave).toHaveBeenCalledTimes(1);

    act(() => result.current.dropProps.onDragEnter(dragEvent().event));
    act(() => result.current.dropProps.onDrop(dragEvent().event));
    expect(result.current.isOver).toBe(false);
  });

  it('forwards drops when no accept filter is set', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDropZone({ onDrop }));

    const drop = dragEvent(['text/plain']);
    act(() => result.current.dropProps.onDrop(drop.event));

    expect(drop.preventDefault).toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith(drop.nativeEvent);
  });

  it('filters drops by accepted data types', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDropZone({ onDrop, accept: ['application/json'] }));

    act(() => result.current.dropProps.onDrop(dragEvent(['text/plain']).event));
    expect(onDrop).not.toHaveBeenCalled();

    act(() => result.current.dropProps.onDrop(dragEvent(['text/plain', 'application/json']).event));
    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it('works without any callbacks', () => {
    const { result } = renderHook(() => useDropZone());
    expect(() =>
      act(() => {
        result.current.dropProps.onDragEnter(dragEvent().event);
        result.current.dropProps.onDragOver(dragEvent().event);
        result.current.dropProps.onDragLeave(dragEvent().event);
        result.current.dropProps.onDrop(dragEvent().event);
      })
    ).not.toThrow();
  });
});

describe('useGridSnap', () => {
  it('snaps to the nearest multiple of the default 20px grid', () => {
    const { result } = renderHook(() => useGridSnap());
    expect(result.current.snapToGrid(9, 11)).toEqual({ x: 0, y: 20 });
    expect(result.current.snapToGrid(30, 49)).toEqual({ x: 40, y: 40 });
  });

  it('honours a custom grid size and can be disabled', () => {
    const custom = renderHook(() => useGridSnap({ gridSize: 50 }));
    expect(custom.result.current.snapToGrid(74, 76)).toEqual({ x: 50, y: 100 });

    const disabled = renderHook(() => useGridSnap({ enabled: false }));
    expect(disabled.result.current.snapToGrid(13, 17)).toEqual({ x: 13, y: 17 });
  });
});

describe('useDraggableManager', () => {
  interface Card extends DraggableItem {
    title: string;
  }

  const cards: Card[] = [
    { id: 'a', title: 'A', position: { x: 0, y: 0 } },
    { id: 'b', title: 'B', position: { x: 300, y: 0 } },
  ];

  const setup = (overrides: Partial<DraggableManagerOptions<Card>> = {}) => {
    const onItemsChange = vi.fn<(items: Card[]) => void>();
    const hook = renderHook(() => useDraggableManager<Card>({ items: cards, onItemsChange, ...overrides }));
    return { ...hook, onItemsChange };
  };

  it('moves a single item and leaves the others untouched', () => {
    const { result, onItemsChange } = setup();

    act(() => result.current.updateItemPosition('a', { x: 13, y: 27 }));

    const next = onItemsChange.mock.calls[0]![0];
    expect(next[0]).toEqual({ id: 'a', title: 'A', position: { x: 13, y: 27 } });
    expect(next[1]).toBe(cards[1]);
    expect(cards[0]!.position).toEqual({ x: 0, y: 0 });
  });

  it('snaps positions to the grid when enabled', () => {
    const { result, onItemsChange } = setup({ gridSnap: { enabled: true, gridSize: 10 } });

    act(() => result.current.updateItemPosition('a', { x: 13, y: 27 }));

    expect(onItemsChange.mock.calls[0]![0][0]!.position).toEqual({ x: 10, y: 30 });
  });

  it('clamps positions inside the bounds, accounting for card size', () => {
    const bounds = { left: 0, top: 0, right: 1000, bottom: 800 };
    const { result, onItemsChange } = setup({ bounds });

    act(() => result.current.updateItemPosition('a', { x: -50, y: -10 }));
    act(() => result.current.updateItemPosition('a', { x: 5000, y: 5000 }));
    act(() => result.current.updateItemPosition('a', { x: 400, y: 300 }));

    const positions = onItemsChange.mock.calls.map(call => call[0][0]!.position);
    expect(positions).toEqual([
      { x: 0, y: 0 },
      { x: 720, y: 600 },
      { x: 400, y: 300 },
    ]);
  });

  it('measures lazily supplied bounds when an item moves', () => {
    const container: { bounds?: { left: number; top: number; right: number; bottom: number } } = {};
    const getBounds = vi.fn(() => container.bounds);
    const { result, onItemsChange } = setup({ bounds: getBounds });
    expect(getBounds).not.toHaveBeenCalled();

    // Not measurable yet (e.g. the container is not mounted): no clamping.
    act(() => result.current.updateItemPosition('a', { x: 5000, y: 5000 }));
    // The current measurement is used, not one taken at render time.
    container.bounds = { left: 0, top: 0, right: 600, bottom: 500 };
    act(() => result.current.updateItemPosition('a', { x: 5000, y: 5000 }));

    expect(getBounds).toHaveBeenCalledTimes(2);
    expect(onItemsChange.mock.calls.map(call => call[0][0]!.position)).toEqual([
      { x: 5000, y: 5000 },
      { x: 320, y: 300 },
    ]);
  });

  it('adds, removes and looks up items', () => {
    const { result, onItemsChange } = setup();

    expect(result.current.items).toBe(cards);
    expect(result.current.getItemById('b')).toBe(cards[1]);
    expect(result.current.getItemById('missing')).toBeUndefined();

    act(() => result.current.removeItem('a'));
    expect(onItemsChange).toHaveBeenLastCalledWith([cards[1]]);

    const c: Card = { id: 'c', title: 'C', position: { x: 1, y: 1 } };
    act(() => result.current.addItem(c));
    expect(onItemsChange).toHaveBeenLastCalledWith([...cards, c]);
  });
});
