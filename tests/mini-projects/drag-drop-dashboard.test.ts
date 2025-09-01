// File: tests/mini-projects/drag-drop-dashboard.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Drag and Drop Dashboard', () => {
  // Mock DOM environment for testing
  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div id="dashboard">
        <div id="widget-container"></div>
        <div id="sidebar"></div>
      </div>
    `;
  });

  describe('Widget System', () => {
    it('should create and manage widgets', () => {
      interface WidgetConfig {
        id: string;
        type: WidgetType;
        title: string;
        position: Position;
        size: Size;
        data?: any;
      }
      
      interface Position {
        x: number;
        y: number;
      }
      
      interface Size {
        width: number;
        height: number;
      }
      
      enum WidgetType {
        CHART = 'chart',
        TABLE = 'table',
        TEXT = 'text',
        IMAGE = 'image'
      }
      
      abstract class Widget {
        protected config: WidgetConfig;
        protected element: HTMLElement;
        
        constructor(config: WidgetConfig) {
          this.config = config;
          this.element = this.createElement();
        }
        
        protected createElement(): HTMLElement {
          const element = document.createElement('div');
          element.className = 'widget';
          element.id = this.config.id;
          element.style.position = 'absolute';
          element.style.left = `${this.config.position.x}px`;
          element.style.top = `${this.config.position.y}px`;
          element.style.width = `${this.config.size.width}px`;
          element.style.height = `${this.config.size.height}px`;
          element.style.border = '1px solid #ccc';
          element.style.backgroundColor = 'white';
          return element;
        }
        
        abstract render(): void;
        
        getElement(): HTMLElement {
          return this.element;
        }
        
        getId(): string {
          return this.config.id;
        }
        
        getType(): WidgetType {
          return this.config.type;
        }
        
        setPosition(position: Position): void {
          this.config.position = position;
          this.element.style.left = `${position.x}px`;
          this.element.style.top = `${position.y}px`;
        }
        
        getPosition(): Position {
          return { ...this.config.position };
        }
        
        setSize(size: Size): void {
          this.config.size = size;
          this.element.style.width = `${size.width}px`;
          this.element.style.height = `${size.height}px`;
        }
        
        getSize(): Size {
          return { ...this.config.size };
        }
        
        getConfig(): WidgetConfig {
          return { ...this.config };
        }
      }
      
      class ChartWidget extends Widget {
        render(): void {
          this.element.innerHTML = `
            <div class="widget-header">${this.config.title}</div>
            <div class="widget-content">
              <canvas id="chart-${this.config.id}" width="${this.config.size.width - 20}" height="${this.config.size.height - 40}"></canvas>
            </div>
          `;
        }
      }
      
      class TableWidget extends Widget {
        render(): void {
          const data = this.config.data || [];
          const tableRows = data.map((row: any[]) => 
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('');
          
          this.element.innerHTML = `
            <div class="widget-header">${this.config.title}</div>
            <div class="widget-content">
              <table style="width: 100%">
                <tbody>${tableRows}</tbody>
              </table>
            </div>
          `;
        }
      }
      
      class TextWidget extends Widget {
        render(): void {
          this.element.innerHTML = `
            <div class="widget-header">${this.config.title}</div>
            <div class="widget-content">
              <p>${this.config.data || 'Default text content'}</p>
            </div>
          `;
        }
      }
      
      class WidgetFactory {
        static createWidget(config: WidgetConfig): Widget {
          switch (config.type) {
            case WidgetType.CHART:
              return new ChartWidget(config);
            case WidgetType.TABLE:
              return new TableWidget(config);
            case WidgetType.TEXT:
              return new TextWidget(config);
            default:
              throw new Error(`Unknown widget type: ${config.type}`);
          }
        }
      }
      
      // Test widget creation and basic functionality
      const chartConfig: WidgetConfig = {
        id: 'chart-1',
        type: WidgetType.CHART,
        title: 'Sales Chart',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 }
      };
      
      const chartWidget = WidgetFactory.createWidget(chartConfig);
      chartWidget.render();
      
      expect(chartWidget.getId()).toBe('chart-1');
      expect(chartWidget.getType()).toBe(WidgetType.CHART);
      expect(chartWidget.getPosition()).toEqual({ x: 0, y: 0 });
      expect(chartWidget.getSize()).toEqual({ width: 300, height: 200 });
      expect(chartWidget.getElement().id).toBe('chart-1');
      expect(chartWidget.getElement().innerHTML).toContain('Sales Chart');
      
      // Test position and size updates
      chartWidget.setPosition({ x: 100, y: 50 });
      expect(chartWidget.getPosition()).toEqual({ x: 100, y: 50 });
      expect(chartWidget.getElement().style.left).toBe('100px');
      expect(chartWidget.getElement().style.top).toBe('50px');
      
      chartWidget.setSize({ width: 400, height: 300 });
      expect(chartWidget.getSize()).toEqual({ width: 400, height: 300 });
      expect(chartWidget.getElement().style.width).toBe('400px');
      expect(chartWidget.getElement().style.height).toBe('300px');
      
      // Test table widget with data
      const tableConfig: WidgetConfig = {
        id: 'table-1',
        type: WidgetType.TABLE,
        title: 'User Data',
        position: { x: 350, y: 0 },
        size: { width: 250, height: 150 },
        data: [
          ['John', '25', 'Engineer'],
          ['Jane', '30', 'Designer'],
          ['Bob', '28', 'Manager']
        ]
      };
      
      const tableWidget = WidgetFactory.createWidget(tableConfig);
      tableWidget.render();
      
      expect(tableWidget.getElement().innerHTML).toContain('User Data');
      expect(tableWidget.getElement().innerHTML).toContain('John');
      expect(tableWidget.getElement().innerHTML).toContain('Engineer');
    });
  });

  describe('Dashboard Manager', () => {
    it('should manage widgets and dashboard state', () => {
      interface DashboardState {
        widgets: { [id: string]: WidgetConfig };
        layout: string;
      }
      
      interface WidgetConfig {
        id: string;
        type: string;
        title: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
        data?: any;
      }
      
      class DashboardManager {
        private widgets: Map<string, any> = new Map();
        private container: HTMLElement;
        private state: DashboardState;
        
        constructor(containerId: string) {
          const container = document.getElementById(containerId);
          if (!container) {
            throw new Error(`Container with id ${containerId} not found`);
          }
          this.container = container;
          this.state = {
            widgets: {},
            layout: 'default'
          };
        }
        
        addWidget(config: WidgetConfig): void {
          // Mock widget creation for testing
          const widget = {
            id: config.id,
            config: config,
            element: document.createElement('div'),
            render: () => {},
            setPosition: (pos: { x: number; y: number }) => {
              config.position = pos;
            },
            getPosition: () => config.position,
            setSize: (size: { width: number; height: number }) => {
              config.size = size;
            },
            getSize: () => config.size
          };
          
          widget.element.id = config.id;
          this.widgets.set(config.id, widget);
          this.state.widgets[config.id] = config;
          this.container.appendChild(widget.element);
        }
        
        removeWidget(id: string): void {
          const widget = this.widgets.get(id);
          if (widget) {
            this.container.removeChild(widget.element);
            this.widgets.delete(id);
            delete this.state.widgets[id];
          }
        }
        
        getWidget(id: string): any {
          return this.widgets.get(id);
        }
        
        getAllWidgets(): any[] {
          return Array.from(this.widgets.values());
        }
        
        moveWidget(id: string, position: { x: number; y: number }): void {
          const widget = this.widgets.get(id);
          if (widget) {
            widget.setPosition(position);
            this.state.widgets[id].position = position;
          }
        }
        
        resizeWidget(id: string, size: { width: number; height: number }): void {
          const widget = this.widgets.get(id);
          if (widget) {
            widget.setSize(size);
            this.state.widgets[id].size = size;
          }
        }
        
        getState(): DashboardState {
          return JSON.parse(JSON.stringify(this.state));
        }
        
        loadState(state: DashboardState): void {
          // Clear existing widgets
          this.widgets.clear();
          this.container.innerHTML = '';
          
          // Load widgets from state
          this.state = state;
          for (const config of Object.values(state.widgets)) {
            this.addWidget(config);
          }
        }
        
        exportLayout(): string {
          return JSON.stringify(this.state);
        }
        
        importLayout(layoutJson: string): void {
          try {
            const state = JSON.parse(layoutJson);
            this.loadState(state);
          } catch (error) {
            throw new Error('Invalid layout format');
          }
        }
      }
      
      const dashboard = new DashboardManager('widget-container');
      
      // Test adding widgets
      const widget1Config: WidgetConfig = {
        id: 'widget-1',
        type: 'chart',
        title: 'Chart Widget',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 }
      };
      
      const widget2Config: WidgetConfig = {
        id: 'widget-2',
        type: 'table',
        title: 'Table Widget',
        position: { x: 350, y: 0 },
        size: { width: 250, height: 150 }
      };
      
      dashboard.addWidget(widget1Config);
      dashboard.addWidget(widget2Config);
      
      expect(dashboard.getAllWidgets()).toHaveLength(2);
      expect(dashboard.getWidget('widget-1')).toBeDefined();
      expect(dashboard.getWidget('widget-2')).toBeDefined();
      
      // Test moving widgets
      dashboard.moveWidget('widget-1', { x: 100, y: 50 });
      const widget1 = dashboard.getWidget('widget-1');
      expect(widget1.getPosition()).toEqual({ x: 100, y: 50 });
      
      // Test resizing widgets
      dashboard.resizeWidget('widget-2', { width: 400, height: 200 });
      const widget2 = dashboard.getWidget('widget-2');
      expect(widget2.getSize()).toEqual({ width: 400, height: 200 });
      
      // Test state management
      const state = dashboard.getState();
      expect(state.widgets['widget-1'].position).toEqual({ x: 100, y: 50 });
      expect(state.widgets['widget-2'].size).toEqual({ width: 400, height: 200 });
      
      // Test export/import
      const exportedLayout = dashboard.exportLayout();
      expect(typeof exportedLayout).toBe('string');
      
      dashboard.removeWidget('widget-1');
      expect(dashboard.getAllWidgets()).toHaveLength(1);
      
      dashboard.importLayout(exportedLayout);
      expect(dashboard.getAllWidgets()).toHaveLength(2);
      expect(dashboard.getWidget('widget-1')).toBeDefined();
    });
  });

  describe('Drag and Drop System', () => {
    it('should handle drag and drop interactions', () => {
      interface DragDropHandler {
        onDragStart(event: DragEvent): void;
        onDragOver(event: DragEvent): void;
        onDrop(event: DragEvent): void;
        onDragEnd(event: DragEvent): void;
      }
      
      class WidgetDragDrop implements DragDropHandler {
        private draggedElement: HTMLElement | null = null;
        private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
        private dropZone: HTMLElement;
        
        constructor(dropZoneId: string) {
          const dropZone = document.getElementById(dropZoneId);
          if (!dropZone) {
            throw new Error(`Drop zone with id ${dropZoneId} not found`);
          }
          this.dropZone = dropZone;
          this.setupDropZone();
        }
        
        private setupDropZone(): void {
          this.dropZone.addEventListener('dragover', this.onDragOver.bind(this));
          this.dropZone.addEventListener('drop', this.onDrop.bind(this));
        }
        
        makeElementDraggable(element: HTMLElement): void {
          element.draggable = true;
          element.addEventListener('dragstart', this.onDragStart.bind(this));
          element.addEventListener('dragend', this.onDragEnd.bind(this));
        }
        
        onDragStart(event: DragEvent): void {
          if (!event.target || !(event.target instanceof HTMLElement)) return;
          
          this.draggedElement = event.target;
          const rect = this.draggedElement.getBoundingClientRect();
          
          // Calculate offset from mouse to element origin
          this.dragOffset.x = event.clientX - rect.left;
          this.dragOffset.y = event.clientY - rect.top;
          
          // Store widget data for transfer
          if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', this.draggedElement.id);
            event.dataTransfer.effectAllowed = 'move';
          }
          
          // Visual feedback
          this.draggedElement.style.opacity = '0.5';
        }
        
        onDragOver(event: DragEvent): void {
          event.preventDefault();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
          }
        }
        
        onDrop(event: DragEvent): void {
          event.preventDefault();
          
          if (!this.draggedElement || !event.dataTransfer) return;
          
          const widgetId = event.dataTransfer.getData('text/plain');
          
          // Calculate new position relative to drop zone
          const dropZoneRect = this.dropZone.getBoundingClientRect();
          const newX = event.clientX - dropZoneRect.left - this.dragOffset.x;
          const newY = event.clientY - dropZoneRect.top - this.dragOffset.y;
          
          // Update element position
          this.draggedElement.style.left = `${Math.max(0, newX)}px`;
          this.draggedElement.style.top = `${Math.max(0, newY)}px`;
          
          // Reset visual feedback
          this.draggedElement.style.opacity = '1';
          
          // Notify about position change
          this.onPositionChanged(widgetId, { x: Math.max(0, newX), y: Math.max(0, newY) });
        }
        
        onDragEnd(event: DragEvent): void {
          if (this.draggedElement) {
            this.draggedElement.style.opacity = '1';
            this.draggedElement = null;
          }
        }
        
        private onPositionChanged(widgetId: string, position: { x: number; y: number }): void {
          console.log(`Widget ${widgetId} moved to position:`, position);
        }
        
        getDraggedElement(): HTMLElement | null {
          return this.draggedElement;
        }
        
        getDragOffset(): { x: number; y: number } {
          return { ...this.dragOffset };
        }
      }
      
      class ResizeHandler {
        private resizeHandles: HTMLElement[] = [];
        private currentTarget: HTMLElement | null = null;
        private startPosition: { x: number; y: number } = { x: 0, y: 0 };
        private startSize: { width: number; height: number } = { width: 0, height: 0 };
        
        makeElementResizable(element: HTMLElement): void {
          const handle = document.createElement('div');
          handle.className = 'resize-handle';
          handle.style.position = 'absolute';
          handle.style.bottom = '0';
          handle.style.right = '0';
          handle.style.width = '10px';
          handle.style.height = '10px';
          handle.style.backgroundColor = '#666';
          handle.style.cursor = 'se-resize';
          
          element.appendChild(handle);
          this.resizeHandles.push(handle);
          
          handle.addEventListener('mousedown', (e) => this.startResize(e, element));
        }
        
        private startResize(event: MouseEvent, target: HTMLElement): void {
          event.preventDefault();
          this.currentTarget = target;
          this.startPosition = { x: event.clientX, y: event.clientY };
          
          const rect = target.getBoundingClientRect();
          this.startSize = { width: rect.width, height: rect.height };
          
          document.addEventListener('mousemove', this.doResize.bind(this));
          document.addEventListener('mouseup', this.stopResize.bind(this));
        }
        
        private doResize(event: MouseEvent): void {
          if (!this.currentTarget) return;
          
          const deltaX = event.clientX - this.startPosition.x;
          const deltaY = event.clientY - this.startPosition.y;
          
          const newWidth = Math.max(100, this.startSize.width + deltaX);
          const newHeight = Math.max(100, this.startSize.height + deltaY);
          
          this.currentTarget.style.width = `${newWidth}px`;
          this.currentTarget.style.height = `${newHeight}px`;
          
          this.onSizeChanged(this.currentTarget.id, { width: newWidth, height: newHeight });
        }
        
        private stopResize(): void {
          this.currentTarget = null;
          document.removeEventListener('mousemove', this.doResize.bind(this));
          document.removeEventListener('mouseup', this.stopResize.bind(this));
        }
        
        private onSizeChanged(widgetId: string, size: { width: number; height: number }): void {
          console.log(`Widget ${widgetId} resized to:`, size);
        }
      }
      
      // Mock drag and drop functionality for testing
      const dragDrop = new WidgetDragDrop('widget-container');
      const resizeHandler = new ResizeHandler();
      
      // Create test elements
      const widget1 = document.createElement('div');
      widget1.id = 'test-widget-1';
      widget1.style.position = 'absolute';
      widget1.style.left = '0px';
      widget1.style.top = '0px';
      widget1.style.width = '200px';
      widget1.style.height = '150px';
      widget1.style.backgroundColor = 'lightblue';
      
      const container = document.getElementById('widget-container');
      container?.appendChild(widget1);
      
      // Make elements draggable and resizable
      dragDrop.makeElementDraggable(widget1);
      resizeHandler.makeElementResizable(widget1);
      
      // Test drag start
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        clientX: 10,
        clientY: 10
      });
      
      // Mock dataTransfer
      Object.defineProperty(dragStartEvent, 'target', {
        value: widget1,
        writable: false
      });
      
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          setData: vi.fn(),
          getData: vi.fn().mockReturnValue('test-widget-1'),
          effectAllowed: '',
          dropEffect: ''
        },
        writable: false
      });
      
      // Test drag start
      dragDrop.onDragStart(dragStartEvent);
      expect(dragDrop.getDraggedElement()).toBe(widget1);
      expect(widget1.style.opacity).toBe('0.5');
      
      // Test drop
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        clientX: 150,
        clientY: 100
      });
      
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: vi.fn().mockReturnValue('test-widget-1'),
          dropEffect: 'move'
        },
        writable: false
      });
      
      // Mock getBoundingClientRect for container
      const containerRect = {
        left: 0,
        top: 0,
        right: 800,
        bottom: 600
      };
      
      container!.getBoundingClientRect = vi.fn().mockReturnValue(containerRect);
      
      dragDrop.onDrop(dropEvent);
      
      expect(widget1.style.opacity).toBe('1');
      expect(parseInt(widget1.style.left)).toBeGreaterThan(0);
      expect(parseInt(widget1.style.top)).toBeGreaterThan(0);
    });
  });

  describe('Layout Management', () => {
    it('should handle different layout modes', () => {
      enum LayoutMode {
        FREE = 'free',
        GRID = 'grid',
        FLOW = 'flow'
      }
      
      interface GridConfig {
        columns: number;
        rows: number;
        cellWidth: number;
        cellHeight: number;
        gap: number;
      }
      
      class LayoutManager {
        private mode: LayoutMode = LayoutMode.FREE;
        private gridConfig: GridConfig = {
          columns: 12,
          rows: 8,
          cellWidth: 100,
          cellHeight: 100,
          gap: 10
        };
        
        setLayoutMode(mode: LayoutMode): void {
          this.mode = mode;
        }
        
        getLayoutMode(): LayoutMode {
          return this.mode;
        }
        
        setGridConfig(config: Partial<GridConfig>): void {
          this.gridConfig = { ...this.gridConfig, ...config };
        }
        
        getGridConfig(): GridConfig {
          return { ...this.gridConfig };
        }
        
        snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
          if (this.mode !== LayoutMode.GRID) {
            return position;
          }
          
          const { cellWidth, cellHeight, gap } = this.gridConfig;
          const cellTotalWidth = cellWidth + gap;
          const cellTotalHeight = cellHeight + gap;
          
          const gridX = Math.round(position.x / cellTotalWidth) * cellTotalWidth;
          const gridY = Math.round(position.y / cellTotalHeight) * cellTotalHeight;
          
          return { x: gridX, y: gridY };
        }
        
        getGridPosition(position: { x: number; y: number }): { col: number; row: number } {
          const { cellWidth, cellHeight, gap } = this.gridConfig;
          const cellTotalWidth = cellWidth + gap;
          const cellTotalHeight = cellHeight + gap;
          
          return {
            col: Math.floor(position.x / cellTotalWidth),
            row: Math.floor(position.y / cellTotalHeight)
          };
        }
        
        getPositionFromGrid(col: number, row: number): { x: number; y: number } {
          const { cellWidth, cellHeight, gap } = this.gridConfig;
          const cellTotalWidth = cellWidth + gap;
          const cellTotalHeight = cellHeight + gap;
          
          return {
            x: col * cellTotalWidth,
            y: row * cellTotalHeight
          };
        }
        
        validatePosition(position: { x: number; y: number }, size: { width: number; height: number }): boolean {
          if (this.mode === LayoutMode.FREE) {
            return position.x >= 0 && position.y >= 0;
          }
          
          if (this.mode === LayoutMode.GRID) {
            const gridPos = this.getGridPosition(position);
            const gridSize = {
              cols: Math.ceil(size.width / (this.gridConfig.cellWidth + this.gridConfig.gap)),
              rows: Math.ceil(size.height / (this.gridConfig.cellHeight + this.gridConfig.gap))
            };
            
            return gridPos.col >= 0 && 
                   gridPos.row >= 0 && 
                   gridPos.col + gridSize.cols <= this.gridConfig.columns &&
                   gridPos.row + gridSize.rows <= this.gridConfig.rows;
          }
          
          return true;
        }
        
        autoArrange(widgets: Array<{ id: string; size: { width: number; height: number } }>): Array<{ id: string; position: { x: number; y: number } }> {
          const arrangements: Array<{ id: string; position: { x: number; y: number } }> = [];
          
          if (this.mode === LayoutMode.GRID) {
            let currentCol = 0;
            let currentRow = 0;
            
            for (const widget of widgets) {
              const widgetCols = Math.ceil(widget.size.width / (this.gridConfig.cellWidth + this.gridConfig.gap));
              const widgetRows = Math.ceil(widget.size.height / (this.gridConfig.cellHeight + this.gridConfig.gap));
              
              // Check if widget fits in current row
              if (currentCol + widgetCols > this.gridConfig.columns) {
                currentCol = 0;
                currentRow += 1;
              }
              
              const position = this.getPositionFromGrid(currentCol, currentRow);
              arrangements.push({
                id: widget.id,
                position
              });
              
              currentCol += widgetCols;
            }
          } else if (this.mode === LayoutMode.FLOW) {
            let currentX = 0;
            let currentY = 0;
            let rowHeight = 0;
            const containerWidth = 800; // Assume container width
            
            for (const widget of widgets) {
              // Check if widget fits in current row
              if (currentX + widget.size.width > containerWidth && currentX > 0) {
                currentX = 0;
                currentY += rowHeight + 10; // 10px gap
                rowHeight = 0;
              }
              
              arrangements.push({
                id: widget.id,
                position: { x: currentX, y: currentY }
              });
              
              currentX += widget.size.width + 10; // 10px gap
              rowHeight = Math.max(rowHeight, widget.size.height);
            }
          }
          
          return arrangements;
        }
      }
      
      const layoutManager = new LayoutManager();
      
      // Test layout mode switching
      expect(layoutManager.getLayoutMode()).toBe(LayoutMode.FREE);
      
      layoutManager.setLayoutMode(LayoutMode.GRID);
      expect(layoutManager.getLayoutMode()).toBe(LayoutMode.GRID);
      
      // Test grid snapping
      const position = { x: 55, y: 73 };
      const snappedPosition = layoutManager.snapToGrid(position);
      expect(snappedPosition.x % 110).toBe(0); // Should snap to grid
      expect(snappedPosition.y % 110).toBe(0);
      
      // Test grid position conversion
      const gridPos = layoutManager.getGridPosition({ x: 220, y: 110 });
      expect(gridPos).toEqual({ col: 2, row: 1 });
      
      const posFromGrid = layoutManager.getPositionFromGrid(2, 1);
      expect(posFromGrid).toEqual({ x: 220, y: 110 });
      
      // Test position validation
      const validPosition = layoutManager.validatePosition({ x: 0, y: 0 }, { width: 100, height: 100 });
      expect(validPosition).toBe(true);
      
      const invalidPosition = layoutManager.validatePosition({ x: 1100, y: 0 }, { width: 200, height: 100 });
      expect(invalidPosition).toBe(false);
      
      // Test auto arrangement
      const widgets = [
        { id: 'w1', size: { width: 200, height: 150 } },
        { id: 'w2', size: { width: 150, height: 100 } },
        { id: 'w3', size: { width: 300, height: 200 } }
      ];
      
      const arrangements = layoutManager.autoArrange(widgets);
      expect(arrangements).toHaveLength(3);
      expect(arrangements[0].id).toBe('w1');
      expect(arrangements[0].position).toEqual({ x: 0, y: 0 });
    });
  });
});