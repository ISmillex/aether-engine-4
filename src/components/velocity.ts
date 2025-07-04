import type { Component } from '../ecs/component.js';
import { Vector3 } from '../math/index.js';

/**
 * Velocity component for physics and movement.
 */
export class Velocity implements Component {
  static readonly TYPE_NAME = 'Velocity';
  readonly type = 'Velocity';

  constructor(
    public readonly linear: Vector3 = Vector3.zero(),
    public readonly angular: Vector3 = Vector3.zero()
  ) {}

  // Factory methods
  static linear(x: number, y: number, z: number = 0): Velocity {
    return new Velocity(new Vector3(x, y, z));
  }

  static angular(x: number, y: number, z: number = 0): Velocity {
    return new Velocity(Vector3.zero(), new Vector3(x, y, z));
  }

  static both(linear: Vector3, angular: Vector3): Velocity {
    return new Velocity(linear, angular);
  }

  // Immutable update methods
  withLinear(velocity: Vector3): Velocity {
    return new Velocity(velocity, this.angular);
  }

  withAngular(velocity: Vector3): Velocity {
    return new Velocity(this.linear, velocity);
  }

  addLinear(acceleration: Vector3): Velocity {
    return new Velocity(this.linear.add(acceleration), this.angular);
  }

  addAngular(acceleration: Vector3): Velocity {
    return new Velocity(this.linear, this.angular.add(acceleration));
  }

  scale(factor: number): Velocity {
    return new Velocity(this.linear.scale(factor), this.angular.scale(factor));
  }
}