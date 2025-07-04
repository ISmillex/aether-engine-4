import { Engine } from '../core/engine.js';
import { createEntity } from '../ecs/entity.js';
import { Transform, Sprite, Velocity } from '../components/index.js';
import { MovementSystem, RenderSystem } from '../systems/index.js';
import { Vector3, Vector2 } from '../math/index.js';
import { PerformanceMonitor } from './performance-monitor.js';

/**
 * Benchmark suite for testing Aether Engine performance.
 */
export class EngineBenchmark {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private monitor: PerformanceMonitor;

  constructor() {
    // Create offscreen canvas for testing
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.engine = new Engine({ canvas: this.canvas });
    this.monitor = new PerformanceMonitor();
  }

  async runBenchmarks(): Promise<BenchmarkResults> {
    const results: BenchmarkResults = {
      entityCreation: await this.benchmarkEntityCreation(),
      componentOperations: await this.benchmarkComponentOperations(),
      systemPerformance: await this.benchmarkSystemPerformance(),
      renderingPerformance: await this.benchmarkRendering(),
      memoryUsage: await this.benchmarkMemoryUsage()
    };

    return results;
  }

  private async benchmarkEntityCreation(): Promise<BenchmarkResult> {
    const iterations = 10000;
    const startTime = performance.now();
    
    const entities = [];
    for (let i = 0; i < iterations; i++) {
      const entity = createEntity();
      entities.push(entity);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: 'Entity Creation',
      iterations,
      totalTime: duration,
      averageTime: duration / iterations,
      operationsPerSecond: (iterations / duration) * 1000
    };
  }

  private async benchmarkComponentOperations(): Promise<BenchmarkResult> {
    const iterations = 5000;
    const world = this.engine.getWorld();
    
    // Create entities first
    const entities = [];
    for (let i = 0; i < iterations; i++) {
      entities.push(createEntity());
    }
    
    const startTime = performance.now();
    
    // Add components
    for (const entity of entities) {
      world.addComponent(entity, new Transform());
      world.addComponent(entity, new Sprite('test'));
      world.addComponent(entity, new Velocity());
    }
    
    // Query components
    for (const entity of entities) {
      world.getComponent(entity, Transform);
      world.getComponent(entity, Sprite);
      world.hasComponent(entity, Velocity);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const totalOperations = iterations * 6; // 3 adds + 3 queries per entity
    
    return {
      name: 'Component Operations',
      iterations: totalOperations,
      totalTime: duration,
      averageTime: duration / totalOperations,
      operationsPerSecond: (totalOperations / duration) * 1000
    };
  }

  private async benchmarkSystemPerformance(): Promise<BenchmarkResult> {
    const entityCount = 1000;
    const iterations = 100;
    const world = this.engine.getWorld();
    
    // Create entities with components
    for (let i = 0; i < entityCount; i++) {
      const entity = createEntity();
      world.addComponent(entity, new Transform(
        new Vector3(Math.random() * 800, Math.random() * 600, 0)
      ));
      world.addComponent(entity, new Velocity(
        new Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0)
      ));
    }
    
    const movementSystem = new MovementSystem();
    const deltaTime = 1/60; // 60 FPS
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      movementSystem.update(world, deltaTime);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: 'System Performance',
      iterations,
      totalTime: duration,
      averageTime: duration / iterations,
      operationsPerSecond: (iterations / duration) * 1000,
      entitiesProcessed: entityCount
    };
  }

  private async benchmarkRendering(): Promise<BenchmarkResult> {
    const entityCount = 500;
    const iterations = 60;
    const world = this.engine.getWorld();
    
    // Add render system
    const renderSystem = new RenderSystem(this.engine.getRenderer());
    this.engine.addSystem(renderSystem);
    
    // Create camera
    const cameraEntity = createEntity();
    world.addComponent(cameraEntity, new Transform());
    
    // Create renderable entities
    for (let i = 0; i < entityCount; i++) {
      const entity = createEntity();
      world.addComponent(entity, new Transform(
        new Vector3(Math.random() * 800, Math.random() * 600, 0),
        undefined,
        new Vector3(10, 10, 1)
      ));
      world.addComponent(entity, new Sprite(
        'default_white',
        new Vector2(1, 1),
        Vector2.zero(),
        [Math.random(), Math.random(), Math.random(), 1]
      ));
    }
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      renderSystem.update(world, 1/60);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name: 'Rendering Performance',
      iterations,
      totalTime: duration,
      averageTime: duration / iterations,
      operationsPerSecond: (iterations / duration) * 1000,
      entitiesProcessed: entityCount
    };
  }

  private async benchmarkMemoryUsage(): Promise<BenchmarkResult> {
    const entityCount = 10000;
    const world = this.engine.getWorld();
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    const startMemory = this.getMemoryUsage();
    const startTime = performance.now();
    
    // Create many entities
    const entities = [];
    for (let i = 0; i < entityCount; i++) {
      const entity = createEntity();
      world.addComponent(entity, new Transform());
      world.addComponent(entity, new Sprite('test'));
      world.addComponent(entity, new Velocity());
      entities.push(entity);
    }
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    
    return {
      name: 'Memory Usage',
      iterations: entityCount,
      totalTime: duration,
      averageTime: duration / entityCount,
      operationsPerSecond: (entityCount / duration) * 1000,
      memoryUsed: memoryUsed
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  entitiesProcessed?: number;
  memoryUsed?: number;
}

export interface BenchmarkResults {
  entityCreation: BenchmarkResult;
  componentOperations: BenchmarkResult;
  systemPerformance: BenchmarkResult;
  renderingPerformance: BenchmarkResult;
  memoryUsage: BenchmarkResult;
}