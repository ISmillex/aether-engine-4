import { Multivector } from './multivector.js';

/**
 * Convenience wrapper for 2D and 3D vectors using Geometric Algebra.
 */
export class Vector2 {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2 {
    const len = this.length();
    return len === 0 ? this : this.scale(1 / len);
  }

  toMultivector(): Multivector {
    return Multivector.vector(this.x, this.y, 0);
  }

  equals(other: Vector2, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

export class Vector3 {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  static up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  add(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(factor: number): Vector3 {
    return new Vector3(this.x * factor, this.y * factor, this.z * factor);
  }

  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector3 {
    const len = this.length();
    return len === 0 ? this : this.scale(1 / len);
  }

  toMultivector(): Multivector {
    return Multivector.vector(this.x, this.y, this.z);
  }

  equals(other: Vector3, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}