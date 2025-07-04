import { Multivector } from './multivector.js';

/**
 * Rotor class for representing rotations in Geometric Algebra.
 * Rotors are the GA equivalent of quaternions but more general.
 */
export class Rotor {
  constructor(private readonly mv: Multivector) {}

  static identity(): Rotor {
    return new Rotor(Multivector.scalar(1));
  }

  static fromAngleAxis(angle: number, axis: Multivector): Rotor {
    const halfAngle = angle * 0.5;
    const cos = Math.cos(halfAngle);
    const sin = Math.sin(halfAngle);
    
    const normalizedAxis = axis.normalize();
    const bivector = Multivector.bivector(
      normalizedAxis.e12,
      normalizedAxis.e13,
      normalizedAxis.e23
    );
    
    return new Rotor(
      Multivector.scalar(cos).add(bivector.scale(sin))
    );
  }

  static fromEulerAngles(x: number, y: number, z: number): Rotor {
    const rx = Rotor.fromAngleAxis(x, Multivector.bivector(0, 1, 0));
    const ry = Rotor.fromAngleAxis(y, Multivector.bivector(0, 0, 1));
    const rz = Rotor.fromAngleAxis(z, Multivector.bivector(1, 0, 0));
    
    return rz.multiply(ry).multiply(rx);
  }

  multiply(other: Rotor): Rotor {
    return new Rotor(this.mv.multiply(other.mv));
  }

  apply(vector: Multivector): Multivector {
    return this.mv.multiply(vector).multiply(this.mv.reverse());
  }

  inverse(): Rotor {
    return new Rotor(this.mv.reverse().scale(1 / this.mv.norm()));
  }

  normalize(): Rotor {
    return new Rotor(this.mv.normalize());
  }

  toMatrix4(): number[] {
    const r = this.mv;
    const s = r.scalar;
    const xy = r.e12;
    const xz = r.e13;
    const yz = r.e23;
    
    const s2 = s * s;
    const xy2 = xy * xy;
    const xz2 = xz * xz;
    const yz2 = yz * yz;
    
    const sxy = s * xy;
    const sxz = s * xz;
    const syz = s * yz;
    const xyxz = xy * xz;
    const xyyz = xy * yz;
    const xzyz = xz * yz;
    
    return [
      s2 + xy2 - xz2 - yz2, 2 * (xyxz + syz), 2 * (xyyz - sxz), 0,
      2 * (xyxz - syz), s2 - xy2 + xz2 - yz2, 2 * (xzyz + sxy), 0,
      2 * (xyyz + sxz), 2 * (xzyz - sxy), s2 - xy2 - xz2 + yz2, 0,
      0, 0, 0, 1
    ];
  }

  equals(other: Rotor, epsilon: number = 1e-10): boolean {
    return this.mv.equals(other.mv, epsilon);
  }

  getMultivector(): Multivector {
    return this.mv;
  }
}