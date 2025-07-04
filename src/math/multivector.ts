/**
 * Geometric Algebra Multivector implementation for the Aether Engine.
 * This is the foundation of all geometric calculations in the engine.
 */

export interface MultivectorComponents {
  readonly scalar: number;
  readonly e1: number;
  readonly e2: number;
  readonly e3: number;
  readonly e12: number;
  readonly e13: number;
  readonly e23: number;
  readonly e123: number;
}

export class Multivector implements MultivectorComponents {
  constructor(
    public readonly scalar: number = 0,
    public readonly e1: number = 0,
    public readonly e2: number = 0,
    public readonly e3: number = 0,
    public readonly e12: number = 0,
    public readonly e13: number = 0,
    public readonly e23: number = 0,
    public readonly e123: number = 0
  ) {}

  static scalar(value: number): Multivector {
    return new Multivector(value);
  }

  static vector(x: number, y: number, z: number = 0): Multivector {
    return new Multivector(0, x, y, z);
  }

  static bivector(xy: number, xz: number = 0, yz: number = 0): Multivector {
    return new Multivector(0, 0, 0, 0, xy, xz, yz);
  }

  static trivector(xyz: number): Multivector {
    return new Multivector(0, 0, 0, 0, 0, 0, 0, xyz);
  }

  add(other: Multivector): Multivector {
    return new Multivector(
      this.scalar + other.scalar,
      this.e1 + other.e1,
      this.e2 + other.e2,
      this.e3 + other.e3,
      this.e12 + other.e12,
      this.e13 + other.e13,
      this.e23 + other.e23,
      this.e123 + other.e123
    );
  }

  subtract(other: Multivector): Multivector {
    return new Multivector(
      this.scalar - other.scalar,
      this.e1 - other.e1,
      this.e2 - other.e2,
      this.e3 - other.e3,
      this.e12 - other.e12,
      this.e13 - other.e13,
      this.e23 - other.e23,
      this.e123 - other.e123
    );
  }

  multiply(other: Multivector): Multivector {
    const s = this.scalar;
    const e1 = this.e1;
    const e2 = this.e2;
    const e3 = this.e3;
    const e12 = this.e12;
    const e13 = this.e13;
    const e23 = this.e23;
    const e123 = this.e123;

    const os = other.scalar;
    const oe1 = other.e1;
    const oe2 = other.e2;
    const oe3 = other.e3;
    const oe12 = other.e12;
    const oe13 = other.e13;
    const oe23 = other.e23;
    const oe123 = other.e123;

    return new Multivector(
      s * os + e1 * oe1 + e2 * oe2 + e3 * oe3 - e12 * oe12 - e13 * oe13 - e23 * oe23 - e123 * oe123,
      s * oe1 + e1 * os - e2 * oe12 - e3 * oe13 + e12 * oe2 + e13 * oe3 - e23 * oe123 - e123 * oe23,
      s * oe2 + e1 * oe12 + e2 * os - e3 * oe23 - e12 * oe1 + e13 * oe123 + e23 * oe3 - e123 * oe13,
      s * oe3 + e1 * oe13 + e2 * oe23 + e3 * os - e12 * oe123 - e13 * oe1 - e23 * oe2 + e123 * oe12,
      s * oe12 + e1 * oe2 - e2 * oe1 + e3 * oe123 + e12 * os - e13 * oe23 + e23 * oe13 + e123 * oe3,
      s * oe13 + e1 * oe3 - e2 * oe123 - e3 * oe1 + e12 * oe23 + e13 * os - e23 * oe12 - e123 * oe2,
      s * oe23 + e1 * oe123 + e2 * oe3 - e3 * oe2 - e12 * oe13 + e13 * oe12 + e23 * os + e123 * oe1,
      s * oe123 + e1 * oe23 - e2 * oe13 + e3 * oe12 + e12 * oe3 - e13 * oe2 + e23 * oe1 + e123 * os
    );
  }

  scale(factor: number): Multivector {
    return new Multivector(
      this.scalar * factor,
      this.e1 * factor,
      this.e2 * factor,
      this.e3 * factor,
      this.e12 * factor,
      this.e13 * factor,
      this.e23 * factor,
      this.e123 * factor
    );
  }

  reverse(): Multivector {
    return new Multivector(
      this.scalar,
      this.e1,
      this.e2,
      this.e3,
      -this.e12,
      -this.e13,
      -this.e23,
      -this.e123
    );
  }

  conjugate(): Multivector {
    return new Multivector(
      this.scalar,
      -this.e1,
      -this.e2,
      -this.e3,
      -this.e12,
      -this.e13,
      -this.e23,
      this.e123
    );
  }

  norm(): number {
    return Math.sqrt(this.multiply(this.reverse()).scalar);
  }

  normalize(): Multivector {
    const n = this.norm();
    return n === 0 ? this : this.scale(1 / n);
  }

  equals(other: Multivector, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.scalar - other.scalar) < epsilon &&
      Math.abs(this.e1 - other.e1) < epsilon &&
      Math.abs(this.e2 - other.e2) < epsilon &&
      Math.abs(this.e3 - other.e3) < epsilon &&
      Math.abs(this.e12 - other.e12) < epsilon &&
      Math.abs(this.e13 - other.e13) < epsilon &&
      Math.abs(this.e23 - other.e23) < epsilon &&
      Math.abs(this.e123 - other.e123) < epsilon
    );
  }

  toString(): string {
    const terms: string[] = [];
    
    if (Math.abs(this.scalar) > 1e-10) terms.push(this.scalar.toString());
    if (Math.abs(this.e1) > 1e-10) terms.push(`${this.e1}e1`);
    if (Math.abs(this.e2) > 1e-10) terms.push(`${this.e2}e2`);
    if (Math.abs(this.e3) > 1e-10) terms.push(`${this.e3}e3`);
    if (Math.abs(this.e12) > 1e-10) terms.push(`${this.e12}e12`);
    if (Math.abs(this.e13) > 1e-10) terms.push(`${this.e13}e13`);
    if (Math.abs(this.e23) > 1e-10) terms.push(`${this.e23}e23`);
    if (Math.abs(this.e123) > 1e-10) terms.push(`${this.e123}e123`);
    
    return terms.length > 0 ? terms.join(' + ') : '0';
  }
}