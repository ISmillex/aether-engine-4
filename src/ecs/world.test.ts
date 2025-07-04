import { describe, it, expect, beforeEach } from 'vitest';
import { World } from './world.js';
import { createEntity } from './entity.js';
import type { Component } from './component.js';

class TestComponent implements Component {
  readonly type = 'TestComponent';
  constructor(public value: number) {}
}

class AnotherComponent implements Component {
  readonly type = 'AnotherComponent';
  constructor(public name: string) {}
}

describe('World', () => {
  let world: World;
  
  beforeEach(() => {
    world = new World();
  });

  describe('entity management', () => {
    it('should add and track entities', () => {
      const entity = createEntity();
      world.addEntity(entity);
      
      expect(world.getAllEntities()).toContain(entity);
      expect(world.getEntityCount()).toBe(1);
    });

    it('should remove entities and their components', () => {
      const entity = createEntity();
      world.addEntity(entity);
      world.addComponent(entity, new TestComponent(42));
      
      world.removeEntity(entity);
      
      expect(world.getAllEntities()).not.toContain(entity);
      expect(world.getComponent(entity, TestComponent)).toBeUndefined();
    });
  });

  describe('component management', () => {
    it('should add components to entities', () => {
      const entity = createEntity();
      const component = new TestComponent(42);
      
      world.addComponent(entity, component);
      
      expect(world.getComponent(entity, TestComponent)).toBe(component);
      expect(world.hasComponent(entity, TestComponent)).toBe(true);
    });

    it('should remove components from entities', () => {
      const entity = createEntity();
      const component = new TestComponent(42);
      
      world.addComponent(entity, component);
      world.removeComponent(entity, TestComponent);
      
      expect(world.getComponent(entity, TestComponent)).toBeUndefined();
      expect(world.hasComponent(entity, TestComponent)).toBe(false);
    });

    it('should handle multiple components per entity', () => {
      const entity = createEntity();
      const testComp = new TestComponent(42);
      const anotherComp = new AnotherComponent('test');
      
      world.addComponent(entity, testComp);
      world.addComponent(entity, anotherComp);
      
      expect(world.getComponent(entity, TestComponent)).toBe(testComp);
      expect(world.getComponent(entity, AnotherComponent)).toBe(anotherComp);
    });
  });

  describe('querying', () => {
    it('should find entities with specific components', () => {
      const entity1 = createEntity();
      const entity2 = createEntity();
      const entity3 = createEntity();
      
      world.addComponent(entity1, new TestComponent(1));
      world.addComponent(entity2, new TestComponent(2));
      world.addComponent(entity3, new AnotherComponent('test'));
      
      const entitiesWithTest = world.getEntitiesWithComponent(TestComponent);
      
      expect(entitiesWithTest).toContain(entity1);
      expect(entitiesWithTest).toContain(entity2);
      expect(entitiesWithTest).not.toContain(entity3);
    });

    it('should find entities with multiple components', () => {
      const entity1 = createEntity();
      const entity2 = createEntity();
      const entity3 = createEntity();
      
      world.addComponent(entity1, new TestComponent(1));
      world.addComponent(entity1, new AnotherComponent('test1'));
      
      world.addComponent(entity2, new TestComponent(2));
      
      world.addComponent(entity3, new AnotherComponent('test3'));
      
      const entitiesWithBoth = world.getEntitiesWithComponents(TestComponent, AnotherComponent);
      
      expect(entitiesWithBoth).toContain(entity1);
      expect(entitiesWithBoth).not.toContain(entity2);
      expect(entitiesWithBoth).not.toContain(entity3);
    });

    it('should return all entities when no component types specified', () => {
      const entity1 = createEntity();
      const entity2 = createEntity();
      
      world.addEntity(entity1);
      world.addEntity(entity2);
      
      const allEntities = world.getEntitiesWithComponents();
      
      expect(allEntities).toContain(entity1);
      expect(allEntities).toContain(entity2);
      expect(allEntities.length).toBe(2);
    });
  });

  describe('clearing', () => {
    it('should clear all entities and components', () => {
      const entity = createEntity();
      world.addComponent(entity, new TestComponent(42));
      
      world.clear();
      
      expect(world.getEntityCount()).toBe(0);
      expect(world.getAllEntities()).toHaveLength(0);
      expect(world.getComponent(entity, TestComponent)).toBeUndefined();
    });
  });
});