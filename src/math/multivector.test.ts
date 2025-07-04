import { describe, it, expect } from 'vitest';
import { Multivector } from './multivector.js';

describe('Multivector', () => {
  describe('construction', () => {
    it('should create a zero multivector by default', () => {
      const mv = new Multivector();
      expect(mv.scalar).toBe(0);
      expect(mv.e1).toBe(0);
      expect(mv.e2).toBe(0);
      expect(mv.e3).toBe(0);
      expect(mv.e12).toBe(0);
      expect(mv.e13).toBe(0);
      expect(mv.e23).toBe(0);
      expect(mv.e123).toBe(0);
    });

    it('should create scalar multivectors', () => {
      const mv = Multivector.scalar(5);
      expect(mv.scalar).toBe(5);
      expect(mv.e1).toBe(0);
    });

    it('should create vector multivectors', () => {
      const mv = Multivector.vector(1, 2, 3);
      expect(mv.scalar).toBe(0);
      expect(mv.e1).toBe(1);
      expect(mv.e2).toBe(2);
      expect(mv.e3).toBe(3);
    });
  });

  describe('arithmetic operations', () => {
    it('should add multivectors correctly', () => {
      const a = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Multivector(8, 7, 6, 5, 4, 3, 2, 1);
      const result = a.add(b);
      
      expect(result.scalar).toBe(9);
      expect(result.e1).toBe(9);
      expect(result.e2).toBe(9);
      expect(result.e3).toBe(9);
      expect(result.e12).toBe(9);
      expect(result.e13).toBe(9);
      expect(result.e23).toBe(9);
      expect(result.e123).toBe(9);
    });

    it('should subtract multivectors correctly', () => {
      const a = new Multivector(10, 8, 6, 4, 2, 0, -2, -4);
      const b = new Multivector(5, 3, 1, -1, -3, -5, -7, -9);
      const result = a.subtract(b);
      
      expect(result.scalar).toBe(5);
      expect(result.e1).toBe(5);
      expect(result.e2).toBe(5);
      expect(result.e3).toBe(5);
      expect(result.e12).toBe(5);
      expect(result.e13).toBe(5);
      expect(result.e23).toBe(5);
      expect(result.e123).toBe(5);
    });

    it('should scale multivectors correctly', () => {
      const mv = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const result = mv.scale(2);
      
      expect(result.scalar).toBe(2);
      expect(result.e1).toBe(4);
      expect(result.e2).toBe(6);
      expect(result.e3).toBe(8);
      expect(result.e12).toBe(10);
      expect(result.e13).toBe(12);
      expect(result.e23).toBe(14);
      expect(result.e123).toBe(16);
    });
  });

  describe('geometric product', () => {
    it('should multiply scalars correctly', () => {
      const a = Multivector.scalar(3);
      const b = Multivector.scalar(4);
      const result = a.multiply(b);
      
      expect(result.scalar).toBe(12);
      expect(result.e1).toBe(0);
    });

    it('should multiply vectors correctly', () => {
      const a = Multivector.vector(1, 0, 0);
      const b = Multivector.vector(0, 1, 0);
      const result = a.multiply(b);
      
      expect(result.scalar).toBe(0);
      expect(result.e12).toBe(1);
    });

    it('should satisfy e1*e1 = 1', () => {
      const e1 = Multivector.vector(1, 0, 0);
      const result = e1.multiply(e1);
      
      expect(result.scalar).toBe(1);
      expect(result.e1).toBe(0);
    });
  });

  describe('operations', () => {
    it('should compute reverse correctly', () => {
      const mv = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const result = mv.reverse();
      
      expect(result.scalar).toBe(1);
      expect(result.e1).toBe(2);
      expect(result.e2).toBe(3);
      expect(result.e3).toBe(4);
      expect(result.e12).toBe(-5);
      expect(result.e13).toBe(-6);
      expect(result.e23).toBe(-7);
      expect(result.e123).toBe(-8);
    });

    it('should compute norm correctly', () => {
      const mv = Multivector.vector(3, 4, 0);
      const norm = mv.norm();
      
      expect(norm).toBe(5);
    });

    it('should normalize correctly', () => {
      const mv = Multivector.vector(3, 4, 0);
      const normalized = mv.normalize();
      
      expect(normalized.e1).toBeCloseTo(0.6);
      expect(normalized.e2).toBeCloseTo(0.8);
      expect(normalized.norm()).toBeCloseTo(1);
    });
  });

  describe('equality', () => {
    it('should detect equal multivectors', () => {
      const a = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      
      expect(a.equals(b)).toBe(true);
    });

    it('should detect unequal multivectors', () => {
      const a = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Multivector(1, 2, 3, 4, 5, 6, 7, 9);
      
      expect(a.equals(b)).toBe(false);
    });

    it('should handle epsilon tolerance', () => {
      const a = new Multivector(1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Multivector(1.0001, 2, 3, 4, 5, 6, 7, 8);
      
      expect(a.equals(b, 0.001)).toBe(true);
      expect(a.equals(b, 0.00001)).toBe(false);
    });
  });
});