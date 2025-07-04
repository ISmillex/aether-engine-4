import { World, System } from '../ecs/index.js';
import { Renderer } from '../renderer/index.js';
import { ResourceManager } from '../resources/index.js';
import { InputManager } from '../input/index.js';

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  targetFPS?: number;
}

/**
 * Main Engine class that orchestrates all subsystems and runs the game loop.
 * This is the central OOP class that manages the hybrid ECS/OOP architecture.
 */
export class Engine {
  private readonly world: World;
  private readonly renderer: Renderer;
  private readonly resourceManager: ResourceManager;
  private readonly inputManager: InputManager;
  
  private readonly systems: System[] = [];
  private readonly targetFPS: number;
  private readonly targetFrameTime: number;
  
  private running = false;
  private lastTime = 0;
  private frameId = 0;

  constructor(config: EngineConfig) {
    this.targetFPS = config.targetFPS ?? 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    
    // Initialize OOP subsystems
    this.renderer = new Renderer(config.canvas);
    this.resourceManager = new ResourceManager();
    this.inputManager = new InputManager(config.canvas);
    
    // Initialize ECS world
    this.world = new World();
    
    this.setupCanvas(config.canvas);
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

  addSystem(system: System): void {
    this.systems.push(system);
    
    // Initialize system if engine is already running
    if (this.running && system.initialize) {
      system.initialize(this.world);
    }
  }

  removeSystem(systemName: string): void {
    const index = this.systems.findIndex(system => system.name === systemName);
    if (index !== -1) {
      const system = this.systems[index]!;
      if (system.cleanup) {
        system.cleanup(this.world);
      }
      this.systems.splice(index, 1);
    }
  }

  getSystem<T extends System>(systemName: string): T | undefined {
    return this.systems.find(system => system.name === systemName) as T | undefined;
  }

  start(): void {
    if (this.running) {
      return;
    }
    
    this.running = true;
    this.lastTime = performance.now();
    
    // Initialize all systems
    for (const system of this.systems) {
      if (system.initialize) {
        system.initialize(this.world);
      }
    }
    
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
    
    // Cleanup all systems
    for (const system of this.systems) {
      if (system.cleanup) {
        system.cleanup(this.world);
      }
    }
  }

  private gameLoop = (): void => {
    if (!this.running) {
      return;
    }
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    // Update all systems
    for (const system of this.systems) {
      system.update(this.world, deltaTime);
    }
    
    // Update input manager (clears frame-specific input states)
    this.inputManager.update();
    
    this.frameId = requestAnimationFrame(this.gameLoop);
  };

  // Getters for subsystems
  getWorld(): World {
    return this.world;
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

  dispose(): void {
    this.stop();
    this.renderer.dispose();
    this.inputManager.dispose();
    this.resourceManager.clear();
    this.world.clear();
  }
}