import { describe, it, expect, beforeEach } from 'vitest';
import { MovementSystem } from './movement-system.js';
import { World } from '../ecs/world.js';
import { createEntity } from '../ecs/entity.js';
import { Transform, Velocity } from '../components/index.js';
import { Vector3 } from '../math/index.js';

describe('MovementSystem', () => {
  let system: MovementSystem;
  let world: World;
  
  beforeEach(() => {
    system = new MovementSystem();
    world = new World();
  });

  it('should have correct name', () => {
    expect(system.name).toBe('MovementSystem');
  });

  it('should apply linear velocity to transform', () => {
    const entity = createEntity();
    const transform = new Transform();
    const velocity = new Velocity(new Vector3(10, 20, 30));
    
    world.addComponent(entity, transform);
    world.addComponent(entity, velocity);
    
    const deltaTime = 0.1;
    system.update(world, deltaTime);
    
    const updatedTransform = world.getComponent(entity, Transform)!;
    expect(updatedTransform.position.x).toBeCloseTo(1); // 10 * 0.1
    expect(updatedTransform.position.y).toBeCloseTo(2); // 20 * 0.1
    expect(updatedTransform.position.z).toBeCloseTo(3); // 30 * 0.1
  });

  it('should apply angular velocity to transform', () => {
    const entity = createEntity();
    const transform = new Transform();
    const velocity = new Velocity(Vector3.zero(), new Vector3(1, 0, 0));
    
    world.addComponent(entity, transform);
    world.addComponent(entity, velocity);
    
    const initialRotation = transform.rotation;
    const deltaTime = 0.1;
    system.update(world, deltaTime);
    
    // Rotation should have changed
    const updatedTransform = world.getComponent(entity, Transform)!;
    expect(updatedTransform.rotation.equals(initialRotation)).toBe(false);
  });

  it('should handle multiple entities', () => {
    const entity1 = createEntity();
    const entity2 = createEntity();
    
    const transform1 = new Transform();
    const velocity1 = new Velocity(new Vector3(5, 0, 0));
    
    const transform2 = new Transform();
    const velocity2 = new Velocity(new Vector3(0, 10, 0));
    
    world.addComponent(entity1, transform1);
    world.addComponent(entity1, velocity1);
    world.addComponent(entity2, transform2);
    world.addComponent(entity2, velocity2);
    
    const deltaTime = 0.2;
    system.update(world, deltaTime);
    
    const updatedTransform1 = world.getComponent(entity1, Transform)!;
    const updatedTransform2 = world.getComponent(entity2, Transform)!;
    
    expect(updatedTransform1.position.x).toBeCloseTo(1); // 5 * 0.2
    expect(updatedTransform1.position.y).toBeCloseTo(0);
    
    expect(updatedTransform2.position.x).toBeCloseTo(0);
    expect(updatedTransform2.position.y).toBeCloseTo(2); // 10 * 0.2
  });

  it('should not affect entities without velocity', () => {
    const entity = createEntity();
    const transform = new Transform();
    
    world.addComponent(entity, transform);
    
    const initialPosition = transform.position;
    system.update(world, 0.1);
    
    expect(transform.position.equals(initialPosition)).toBe(true);
  });

  it('should not affect entities without transform', () => {
    const entity = createEntity();
    const velocity = new Velocity(new Vector3(10, 10, 10));
    
    world.addComponent(entity, velocity);
    
    // Should not throw error
    expect(() => system.update(world, 0.1)).not.toThrow();
  });

  it('should handle zero velocity correctly', () => {
    const entity = createEntity();
    const transform = new Transform();
    const velocity = new Velocity();
    
    world.addComponent(entity, transform);
    world.addComponent(entity, velocity);
    
    const initialPosition = transform.position;
    const initialRotation = transform.rotation;
    
    system.update(world, 0.1);
    
    expect(transform.position.equals(initialPosition)).toBe(true);
    expect(transform.rotation.equals(initialRotation)).toBe(true);
  });
});