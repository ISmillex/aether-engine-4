import type { Component } from '../ecs/component.js';

/**
 * Camera component for rendering viewpoints.
 */
export class Camera implements Component {
  static readonly TYPE_NAME = 'Camera';
  readonly type = 'Camera';

  constructor(
    public fov: number = 60,
    public near: number = 0.1,
    public far: number = 1000,
    public active: boolean = true,
    public clearColor: [number, number, number, number] = [0, 0, 0, 1]
  ) {}

  setFov(fov: number): void {
    this.fov = fov;
  }

  setClipPlanes(near: number, far: number): void {
    this.near = near;
    this.far = far;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setClearColor(r: number, g: number, b: number, a: number = 1): void {
    this.clearColor = [r, g, b, a];
  }

  getProjectionMatrix(aspectRatio: number): number[] {
    const fovRad = (this.fov * Math.PI) / 180;
    const f = 1.0 / Math.tan(fovRad / 2);
    const rangeInv = 1.0 / (this.near - this.far);

    return [
      f / aspectRatio, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (this.near + this.far) * rangeInv, -1,
      0, 0, this.near * this.far * rangeInv * 2, 0
    ];
  }
}