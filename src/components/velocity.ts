import type { Component } from '../ecs/component.js';
import { Vector3 } from '../math/index.js';

/**
 * Velocity component for physics and movement.
 */
export class Velocity implements Component {
  static readonly TYPE_NAME = 'Velocity';
  readonly type = 'Velocity';

  constructor(
    public linear: Vector3 = Vector3.zero(),
    public angular: Vector3 = Vector3.zero()
  ) {}

  setLinear(velocity: Vector3): void {
    this.linear = velocity;
  }

  setAngular(velocity: Vector3): void {
    this.angular = velocity;
  }

  addLinear(acceleration: Vector3): void {
    this.linear = this.linear.add(acceleration);
  }

  addAngular(acceleration: Vector3): void {
    this.angular = this.angular.add(acceleration);
  }
}