import { Vector2 } from '../math/index.js';

/**
 * Input management system for handling keyboard, mouse, and touch input.
 */
export class InputManager {
  private readonly keys = new Set<string>();
  private readonly keysPressed = new Set<string>();
  private readonly keysReleased = new Set<string>();
  
  private mousePosition = Vector2.zero();
  private mouseDelta = Vector2.zero();
  private readonly mouseButtons = new Set<number>();
  private readonly mouseButtonsPressed = new Set<number>();
  private readonly mouseButtonsReleased = new Set<number>();
  
  private wheelDelta = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Focus handling
    this.canvas.tabIndex = 0;
    this.canvas.addEventListener('blur', this.handleBlur.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.keys.has(event.code)) {
      this.keysPressed.add(event.code);
    }
    this.keys.add(event.code);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
    this.keysReleased.add(event.code);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.mouseButtons.has(event.button)) {
      this.mouseButtonsPressed.add(event.button);
    }
    this.mouseButtons.add(event.button);
    this.canvas.focus();
  }

  private handleMouseUp(event: MouseEvent): void {
    this.mouseButtons.delete(event.button);
    this.mouseButtonsReleased.add(event.button);
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const newPosition = new Vector2(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    
    this.mouseDelta = newPosition.subtract(this.mousePosition);
    this.mousePosition = newPosition;
  }

  private handleWheel(event: WheelEvent): void {
    this.wheelDelta += event.deltaY;
    event.preventDefault();
  }

  private handleBlur(): void {
    // Clear all input states when losing focus
    this.keys.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtons.clear();
    this.mouseButtonsPressed.clear();
    this.mouseButtonsReleased.clear();
  }

  // Keyboard input
  isKeyDown(key: string): boolean {
    return this.keys.has(key);
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }

  isKeyReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }

  // Mouse input
  isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonsPressed.has(button);
  }

  isMouseButtonReleased(button: number): boolean {
    return this.mouseButtonsReleased.has(button);
  }

  getMousePosition(): Vector2 {
    return this.mousePosition;
  }

  getMouseDelta(): Vector2 {
    return this.mouseDelta;
  }

  getWheelDelta(): number {
    return this.wheelDelta;
  }

  // Called at the end of each frame to clear frame-specific input states
  update(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtonsPressed.clear();
    this.mouseButtonsReleased.clear();
    this.mouseDelta = Vector2.zero();
    this.wheelDelta = 0;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.removeEventListener('blur', this.handleBlur.bind(this));
  }
}