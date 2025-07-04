/**
 * Performance monitoring utilities for the Aether Engine.
 * Tracks FPS, frame times, memory usage, and system performance.
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  averageFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  entityCount: number;
  componentCount: number;
  systemUpdateTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private frameStartTime = 0;
  private frameTimes: number[] = [];
  private maxSamples = 60;
  
  private systemStartTime = 0;
  private renderStartTime = 0;
  
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    averageFrameTime: 0,
    minFrameTime: Infinity,
    maxFrameTime: 0,
    entityCount: 0,
    componentCount: 0,
    systemUpdateTime: 0,
    renderTime: 0
  };

  startFrame(): void {
    this.frameStartTime = performance.now();
  }

  endFrame(): void {
    const currentTime = performance.now();
    const frameTime = currentTime - this.frameStartTime;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    this.frameCount++;
    
    // Update metrics every second
    if (currentTime - this.lastTime >= 1000) {
      this.updateMetrics(currentTime);
      this.lastTime = currentTime;
    }
    
    this.metrics.frameTime = frameTime;
  }

  startSystemUpdate(): void {
    this.systemStartTime = performance.now();
  }

  endSystemUpdate(): void {
    this.metrics.systemUpdateTime = performance.now() - this.systemStartTime;
  }

  startRender(): void {
    this.renderStartTime = performance.now();
  }

  endRender(): void {
    this.metrics.renderTime = performance.now() - this.renderStartTime;
  }

  updateEntityCount(count: number): void {
    this.metrics.entityCount = count;
  }

  updateComponentCount(count: number): void {
    this.metrics.componentCount = count;
  }

  private updateMetrics(currentTime: number): void {
    const timeDelta = currentTime - this.lastTime;
    this.metrics.fps = Math.round((this.frameCount * 1000) / timeDelta);
    this.frameCount = 0;
    
    if (this.frameTimes.length > 0) {
      this.metrics.averageFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
      this.metrics.minFrameTime = Math.min(...this.frameTimes);
      this.metrics.maxFrameTime = Math.max(...this.frameTimes);
    }
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
      averageFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      entityCount: 0,
      componentCount: 0,
      systemUpdateTime: 0,
      renderTime: 0
    };
  }
}