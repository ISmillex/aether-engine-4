import type { Component } from '../ecs/component.js';
import { Vector3, Rotor } from '../math/index.js';

/**
 * Transform component representing position, rotation, and scale in 3D space.
 * Uses Geometric Algebra for rotations instead of traditional matrices.
 */
export class Transform implements Component {
  static readonly TYPE_NAME = 'Transform';
  readonly type = 'Transform';

  constructor(
    public readonly position: Vector3 = Vector3.zero(),
    public readonly rotation: Rotor = Rotor.identity(),
    public readonly scale: Vector3 = Vector3.one()
  ) {}

  translate(offset: Vector3): Transform {
    return new Transform(
      this.position.add(offset),
      this.rotation,
      this.scale
    );
  }

  rotate(rotor: Rotor): Transform {
    return new Transform(
      this.position,
      this.rotation.multiply(rotor),
      this.scale
    );
  }

  setPosition(position: Vector3): Transform {
    return new Transform(position, this.rotation, this.scale);
  }

  setRotation(rotation: Rotor): Transform {
    return new Transform(this.position, rotation, this.scale);
  }

  setScale(scale: Vector3): Transform {
    return new Transform(this.position, this.rotation, scale);
  }

  getWorldMatrix(): number[] {
    const rotationMatrix = this.rotation.toMatrix4();
    const s = this.scale;
    const p = this.position;

    return [
      rotationMatrix[0]! * s.x, rotationMatrix[1]! * s.x, rotationMatrix[2]! * s.x, 0,
      rotationMatrix[4]! * s.y, rotationMatrix[5]! * s.y, rotationMatrix[6]! * s.y, 0,
      rotationMatrix[8]! * s.z, rotationMatrix[9]! * s.z, rotationMatrix[10]! * s.z, 0,
      p.x, p.y, p.z, 1
    ];
  }
}