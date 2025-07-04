import { describe, it, expect } from 'vitest';
import { Transform } from './transform.js';
import { Vector3, Rotor } from '../math/index.js';

describe('Transform', () => {
  describe('construction', () => {
    it('should create with default values', () => {
      const transform = new Transform();
      
      expect(transform.type).toBe('Transform');
      expect(transform.position.equals(Vector3.zero())).toBe(true);
      expect(transform.rotation.equals(Rotor.identity())).toBe(true);
      expect(transform.scale.equals(Vector3.one())).toBe(true);
    });

    it('should create with custom values', () => {
      const position = new Vector3(1, 2, 3);
      const rotation = Rotor.fromEulerAngles(0.1, 0.2, 0.3);
      const scale = new Vector3(2, 2, 2);
      
      const transform = new Transform(position, rotation, scale);
      
      expect(transform.position).toBe(position);
      expect(transform.rotation).toBe(rotation);
      expect(transform.scale).toBe(scale);
    });
  });

  describe('operations', () => {
    it('should translate correctly', () => {
      const transform = new Transform();
      const offset = new Vector3(1, 2, 3);
      
      const newTransform = transform.translate(offset);
      
      expect(newTransform.position.equals(offset)).toBe(true);
    });

    it('should rotate correctly', () => {
      const transform = new Transform();
      const rotation = Rotor.fromEulerAngles(0.1, 0, 0);
      
      const newTransform = transform.rotate(rotation);
      
      expect(newTransform.rotation.equals(rotation)).toBe(true);
    });

    it('should set position correctly', () => {
      const transform = new Transform();
      const newPosition = new Vector3(5, 6, 7);
      
      const newTransform = transform.setPosition(newPosition);
      
      expect(newTransform.position).toBe(newPosition);
    });

    it('should set rotation correctly', () => {
      const transform = new Transform();
      const newRotation = Rotor.fromEulerAngles(0.5, 0.6, 0.7);
      
      const newTransform = transform.setRotation(newRotation);
      
      expect(newTransform.rotation).toBe(newRotation);
    });

    it('should set scale correctly', () => {
      const transform = new Transform();
      const newScale = new Vector3(3, 4, 5);
      
      const newTransform = transform.setScale(newScale);
      
      expect(newTransform.scale).toBe(newScale);
    });
  });

  describe('world matrix', () => {
    it('should generate identity matrix for default transform', () => {
      const transform = new Transform();
      const matrix = transform.getWorldMatrix();
      
      const expectedIdentity = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      
      for (let i = 0; i < 16; i++) {
        expect(matrix[i]).toBeCloseTo(expectedIdentity[i]!);
      }
    });

    it('should include translation in matrix', () => {
      const transform = new Transform(new Vector3(10, 20, 30));
      
      const matrix = transform.getWorldMatrix();
      
      expect(matrix[12]).toBe(10); // x translation
      expect(matrix[13]).toBe(20); // y translation
      expect(matrix[14]).toBe(30); // z translation
    });

    it('should include scale in matrix', () => {
      const transform = new Transform(Vector3.zero(), Rotor.identity(), new Vector3(2, 3, 4));
      
      const matrix = transform.getWorldMatrix();
      
      // Check diagonal elements for scale
      expect(matrix[0]).toBeCloseTo(2);  // x scale
      expect(matrix[5]).toBeCloseTo(3);  // y scale
      expect(matrix[10]).toBeCloseTo(4); // z scale
    });
  });
});