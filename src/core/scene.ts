import { World } from '../ecs/world.js';
import type { System } from '../ecs/system.js';

export interface SceneConfig {
  name: string;
  systems?: System[];
  autoStart?: boolean;
}

/**
 * Scene management for organizing game states and systems.
 * Each scene has its own world and systems.
 */
export class Scene {
  readonly name: string;
  readonly world: World;
  private readonly systems: System[] = [];
  private readonly systemMap = new Map<string, System>();
  private running = false;
  private paused = false;

  constructor(config: SceneConfig) {
    this.name = config.name;
    this.world = new World();
    
    if (config.systems) {
      for (const system of config.systems) {
        this.addSystem(system);
      }
    }
  }

  addSystem(system: System): void {
    if (this.systemMap.has(system.name)) {
      throw new Error(`System with name '${system.name}' already exists in scene '${this.name}'`);
    }

    this.systems.push(system);
    this.systemMap.set(system.name, system);
    
    // Sort systems by priority and dependencies
    this.sortSystems();

    if (this.running && system.initialize) {
      system.initialize(this.world);
    }
  }

  removeSystem(systemName: string): void {
    const system = this.systemMap.get(systemName);
    if (!system) return;

    const index = this.systems.indexOf(system);
    if (index !== -1) {
      if (system.cleanup) {
        system.cleanup(this.world);
      }
      this.systems.splice(index, 1);
      this.systemMap.delete(systemName);
    }
  }

  getSystem<T extends System>(systemName: string): T | undefined {
    return this.systemMap.get(systemName) as T | undefined;
  }

  private sortSystems(): void {
    // Simple topological sort based on dependencies
    const sorted: System[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (system: System) => {
      if (visiting.has(system.name)) {
        throw new Error(`Circular dependency detected involving system '${system.name}'`);
      }
      if (visited.has(system.name)) return;

      visiting.add(system.name);

      // Visit dependencies first
      if (system.dependencies.after) {
        for (const depName of system.dependencies.after) {
          const depSystem = this.systemMap.get(depName);
          if (depSystem) {
            visit(depSystem);
          }
        }
      }

      visiting.delete(system.name);
      visited.add(system.name);
      sorted.push(system);
    };

    for (const system of this.systems) {
      visit(system);
    }

    // Sort by priority within dependency order
    sorted.sort((a, b) => b.priority - a.priority);
    
    this.systems.length = 0;
    this.systems.push(...sorted);
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    
    for (const system of this.systems) {
      if (system.initialize) {
        system.initialize(this.world);
      }
    }
  }

  stop(): void {
    if (!this.running) return;

    this.running = false;
    
    for (const system of this.systems) {
      if (system.cleanup) {
        system.cleanup(this.world);
      }
    }
  }

  pause(): void {
    if (!this.running || this.paused) return;

    this.paused = true;
    
    for (const system of this.systems) {
      if (system.onPause) {
        system.onPause(this.world);
      }
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;

    this.paused = false;
    
    for (const system of this.systems) {
      if (system.onResume) {
        system.onResume(this.world);
      }
    }
  }

  update(deltaTime: number): void {
    if (!this.running || this.paused) return;

    for (const system of this.systems) {
      if (system.isEnabled()) {
        system.update(this.world, deltaTime);
      }
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  dispose(): void {
    this.stop();
    this.world.clear();
    this.systems.length = 0;
    this.systemMap.clear();
  }
}