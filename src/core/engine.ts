import { World, System } from '../ecs/index.js';
import { Renderer } from '../renderer/index.js';
import { ResourceManager } from '../resources/index.js';
import { InputManager } from '../input/index.js';
import { Scene, type SceneConfig } from './scene.js';

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  targetFPS?: number;
  initialScene?: SceneConfig;
}

/**
 * Enhanced Engine class with scene management and improved lifecycle.
 * Manages multiple scenes and provides a unified game loop.
 */
export class Engine {
  private readonly renderer: Renderer;
  private readonly resourceManager: ResourceManager;
  private readonly inputManager: InputManager;
  
  private readonly scenes = new Map<string, Scene>();
  private currentScene: Scene | null = null;
  
  private readonly targetFPS: number;
  private readonly targetFrameTime: number;
  
  private running = false;
  private paused = false;
  private lastTime = 0;
  private frameId = 0;

  constructor(config: EngineConfig) {
    this.targetFPS = config.targetFPS ?? 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    
    // Initialize OOP subsystems
    this.renderer = new Renderer(config.canvas);
    this.resourceManager = new ResourceManager();
    this.inputManager = new InputManager(config.canvas);
    
    this.setupCanvas(config.canvas);
    
    // Create initial scene if provided
    if (config.initialScene) {
      const scene = this.createScene(config.initialScene);
      this.setCurrentScene(scene.name);
    }
  }

  private setupCanvas(canvas: HTMLCanvasElement): void {
    // Handle canvas resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        this.renderer.resize(width, height);
      }
    });
    
    resizeObserver.observe(canvas);
  }

  // Scene management
  createScene(config: SceneConfig): Scene {
    if (this.scenes.has(config.name)) {
      throw new Error(`Scene with name '${config.name}' already exists`);
    }

    const scene = new Scene(config);
    this.scenes.set(config.name, scene);
    return scene;
  }

  getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }

  setCurrentScene(name: string): void {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene '${name}' not found`);
    }

    if (this.currentScene) {
      this.currentScene.stop();
    }

    this.currentScene = scene;
    
    if (this.running) {
      this.currentScene.start();
    }
  }

  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  removeScene(name: string): void {
    const scene = this.scenes.get(name);
    if (scene) {
      if (this.currentScene === scene) {
        this.currentScene = null;
      }
      scene.dispose();
      this.scenes.delete(name);
    }
  }

  // Legacy system management (for backward compatibility)
  addSystem(system: System): void {
    if (!this.currentScene) {
      throw new Error('No current scene. Create a scene first or use scene.addSystem()');
    }
    this.currentScene.addSystem(system);
  }

  removeSystem(systemName: string): void {
    if (this.currentScene) {
      this.currentScene.removeSystem(systemName);
    }
  }

  getSystem<T extends System>(systemName: string): T | undefined {
    return this.currentScene?.getSystem<T>(systemName);
  }

  start(): void {
    if (this.running) {
      return;
    }
    
    this.running = true;
    this.lastTime = performance.now();
    
    // Start current scene
    if (this.currentScene) {
      this.currentScene.start();
    }
    
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
    
    // Stop current scene
    if (this.currentScene) {
      this.currentScene.stop();
    }
  }

  pause(): void {
    if (!this.running || this.paused) return;
    
    this.paused = true;
    if (this.currentScene) {
      this.currentScene.pause();
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    
    this.paused = false;
    if (this.currentScene) {
      this.currentScene.resume();
    }
  }

  private gameLoop = (): void => {
    if (!this.running) {
      return;
    }
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    // Update current scene
    if (this.currentScene && !this.paused) {
      this.currentScene.update(deltaTime);
    }
    
    // Update input manager (clears frame-specific input states)
    this.inputManager.update();
    
    this.frameId = requestAnimationFrame(this.gameLoop);
  };

  // Getters for subsystems
  getWorld(): World {
    return this.currentScene?.world ?? new World();
  }

  getRenderer(): Renderer {
    return this.renderer;
  }

  getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  getInputManager(): InputManager {
    return this.inputManager;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  dispose(): void {
    this.stop();
    
    // Dispose all scenes
    for (const scene of this.scenes.values()) {
      scene.dispose();
    }
    this.scenes.clear();
    this.currentScene = null;
    
    this.renderer.dispose();
    this.inputManager.dispose();
    this.resourceManager.clear();
  }
}