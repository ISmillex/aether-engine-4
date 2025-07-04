import type { Entity } from './entity.js';
import type { Component, ComponentConstructor } from './component.js';

/**
 * The World manages all entities and their components in the ECS system.
 * It provides efficient storage and querying capabilities.
 */
export class World {
  private readonly components = new Map<string, Map<Entity, Component>>();
  private readonly entities = new Set<Entity>();
  
  // Performance optimization: Cache query results
  private readonly queryCache = new Map<string, Entity[]>();
  private cacheInvalidated = true;

  addEntity(entity: Entity): void {
    this.entities.add(entity);
  }

  removeEntity(entity: Entity): void {
    this.entities.delete(entity);
    
    // Remove all components for this entity
    for (const componentMap of this.components.values()) {
      componentMap.delete(entity);
    }
  }

  addComponent<T extends Component>(entity: Entity, component: T): void {
    this.addEntity(entity);
    
    const componentType = component.type;
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    this.components.get(componentType)!.set(entity, component);
    this.cacheInvalidated = true; // Invalidate query cache
  }

  removeComponent<T extends Component>(entity: Entity, componentType: ComponentConstructor<T>): void {
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    const componentMap = this.components.get(typeName);
    if (componentMap) {
      componentMap.delete(entity);
      this.cacheInvalidated = true; // Invalidate query cache
    }
  }

  getComponent<T extends Component>(entity: Entity, componentType: ComponentConstructor<T>): T | undefined {
    // Performance optimization: Use static type name instead of creating instance
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    const componentMap = this.components.get(typeName);
    return componentMap?.get(entity) as T | undefined;
  }

  hasComponent<T extends Component>(entity: Entity, componentType: ComponentConstructor<T>): boolean {
    // Performance optimization: Use static type name instead of creating instance
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    const componentMap = this.components.get(typeName);
    return componentMap?.has(entity) ?? false;
  }

  getEntitiesWithComponent<T extends Component>(componentType: ComponentConstructor<T>): Entity[] {
    const instance = new componentType();
    const typeName = instance.type;
    const componentMap = this.components.get(typeName);
    return componentMap ? Array.from(componentMap.keys()) : [];
  }

  getEntitiesWithComponents(...componentTypes: ComponentConstructor[]): Entity[] {
    if (componentTypes.length === 0) {
      return Array.from(this.entities);
    }

    // Performance optimization: Use cached results
    const cacheKey = componentTypes.map(ct => (ct as any).TYPE_NAME || new ct().type).sort().join('|');
    
    if (!this.cacheInvalidated && this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    this.clearQueryCache();

    // Find the component type with the smallest entity set to minimize iterations
    let smallestSet: Entity[] | undefined;
    let smallestSize = Infinity;
    
    for (const componentType of componentTypes) {
      const entities = this.getEntitiesWithComponent(componentType);
      if (entities.length < smallestSize) {
        smallestSize = entities.length;
        smallestSet = entities;
      }
    }
    
    if (!smallestSet) {
      return [];
    }
    
    // Filter the smallest set against all other component types
    const result = smallestSet.filter(entity => 
      componentTypes.every(componentType => this.hasComponent(entity, componentType))
    );
    
    // Cache the result
    this.queryCache.set(cacheKey, result);
    
    return result;
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities);
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  clear(): void {
    this.entities.clear();
    this.components.clear();
    this.queryCache.clear();
    this.cacheInvalidated = true;
  }

  // Performance optimization: Clear cache when needed
  private clearQueryCache(): void {
    if (this.cacheInvalidated) {
      this.queryCache.clear();
      this.cacheInvalidated = false;
    }
  }
}