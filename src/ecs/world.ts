import type { Entity } from './entity.js';
import { createEntity } from './entity.js';
import type { Component, ComponentConstructor } from './component.js';

export interface QueryBuilder {
  with<T extends Component>(...componentTypes: ComponentConstructor<T>[]): QueryBuilder;
  without<T extends Component>(...componentTypes: ComponentConstructor<T>[]): QueryBuilder;
  execute(): Entity[];
  first(): Entity | undefined;
  count(): number;
}

export interface EntityBuilder {
  with<T extends Component>(component: T): EntityBuilder;
  withComponents(...components: Component[]): EntityBuilder;
  build(): Entity;
}

/**
 * Enhanced World with builder patterns, advanced querying, and event system.
 * Provides efficient storage, querying capabilities, and reactive updates.
 */
export class World {
  private readonly components = new Map<string, Map<Entity, Component>>();
  private readonly entities = new Set<Entity>();
  private readonly entityComponents = new Map<Entity, Set<string>>();
  
  // Enhanced query system with caching
  private readonly queryCache = new Map<string, Entity[]>();
  private readonly querySubscriptions = new Map<string, Set<(entities: Entity[]) => void>>();
  private cacheInvalidated = true;
  
  // Event system
  private readonly eventListeners = new Map<string, Set<(data: any) => void>>();
  
  // Component change tracking
  private readonly componentAddedListeners = new Map<string, Set<(entity: Entity, component: Component) => void>>();
  private readonly componentRemovedListeners = new Map<string, Set<(entity: Entity) => void>>();

  // Entity management
  addEntity(entity: Entity): void {
    this.entities.add(entity);
    if (!this.entityComponents.has(entity)) {
      this.entityComponents.set(entity, new Set());
    }
  }

  removeEntity(entity: Entity): void {
    this.entities.delete(entity);
    
    const entityComponentTypes = this.entityComponents.get(entity);
    if (entityComponentTypes) {
      // Notify component removal listeners
      for (const componentType of entityComponentTypes) {
        const listeners = this.componentRemovedListeners.get(componentType);
        if (listeners) {
          for (const listener of listeners) {
            listener(entity);
          }
        }
      }
    }
    
    // Remove all components for this entity
    for (const componentMap of this.components.values()) {
      componentMap.delete(entity);
    }
    
    this.entityComponents.delete(entity);
    this.invalidateCache();
  }

  // Builder pattern for entity creation
  createEntity(): Entity {
    const entity = createEntity();
    this.addEntity(entity);
    return entity;
  }

  // Entity builder for fluent API
  entity(): EntityBuilder {
    return new EntityBuilderImpl(this);
  }

  // Advanced query builder
  query(): QueryBuilder {
    return new QueryBuilderImpl(this);
  }

  addComponent<T extends Component>(entity: Entity, component: T): void {
    this.addEntity(entity);
    
    const componentType = component.type;
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    this.components.get(componentType)!.set(entity, component);
    
    // Track component types for this entity
    let entityComponentTypes = this.entityComponents.get(entity);
    if (!entityComponentTypes) {
      entityComponentTypes = new Set();
      this.entityComponents.set(entity, entityComponentTypes);
    }
    entityComponentTypes.add(componentType);
    
    // Notify component added listeners
    const listeners = this.componentAddedListeners.get(componentType);
    if (listeners) {
      for (const listener of listeners) {
        listener(entity, component);
      }
    }
    
    this.invalidateCache();
  }

  removeComponent<T extends Component>(entity: Entity, componentType: ComponentConstructor<T>): void {
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    const componentMap = this.components.get(typeName);
    if (componentMap && componentMap.has(entity)) {
      componentMap.delete(entity);
      
      // Update entity component tracking
      const entityComponentTypes = this.entityComponents.get(entity);
      if (entityComponentTypes) {
        entityComponentTypes.delete(typeName);
      }
      
      // Notify component removal listeners
      const listeners = this.componentRemovedListeners.get(typeName);
      if (listeners) {
        for (const listener of listeners) {
          listener(entity);
        }
      }
      
      this.invalidateCache();
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

  // Event system
  emit(eventType: string, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  on(eventType: string, listener: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  // Component change listeners
  onComponentAdded<T extends Component>(
    componentType: ComponentConstructor<T>, 
    listener: (entity: Entity, component: T) => void
  ): () => void {
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    if (!this.componentAddedListeners.has(typeName)) {
      this.componentAddedListeners.set(typeName, new Set());
    }
    this.componentAddedListeners.get(typeName)!.add(listener as any);
    
    return () => {
      const listeners = this.componentAddedListeners.get(typeName);
      if (listeners) {
        listeners.delete(listener as any);
      }
    };
  }

  onComponentRemoved<T extends Component>(
    componentType: ComponentConstructor<T>,
    listener: (entity: Entity) => void
  ): () => void {
    const typeName = (componentType as any).TYPE_NAME || new componentType().type;
    if (!this.componentRemovedListeners.has(typeName)) {
      this.componentRemovedListeners.set(typeName, new Set());
    }
    this.componentRemovedListeners.get(typeName)!.add(listener);
    
    return () => {
      const listeners = this.componentRemovedListeners.get(typeName);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  // Reactive queries
  subscribeToQuery(queryKey: string, callback: (entities: Entity[]) => void): () => void {
    if (!this.querySubscriptions.has(queryKey)) {
      this.querySubscriptions.set(queryKey, new Set());
    }
    this.querySubscriptions.get(queryKey)!.add(callback);
    
    return () => {
      const subscriptions = this.querySubscriptions.get(queryKey);
      if (subscriptions) {
        subscriptions.delete(callback);
      }
    };
  }

  clear(): void {
    this.entities.clear();
    this.components.clear();
    this.entityComponents.clear();
    this.queryCache.clear();
    this.querySubscriptions.clear();
    this.eventListeners.clear();
    this.componentAddedListeners.clear();
    this.componentRemovedListeners.clear();
    this.cacheInvalidated = true;
  }

  // Performance optimization: Clear cache when needed
  private invalidateCache(): void {
    this.cacheInvalidated = true;
    
    // Notify query subscribers
    for (const [queryKey, subscriptions] of this.querySubscriptions) {
      const entities = this.queryCache.get(queryKey);
      if (entities) {
        for (const callback of subscriptions) {
          callback(entities);
        }
      }
    }
  }

  private clearQueryCache(): void {
    if (this.cacheInvalidated) {
      this.queryCache.clear();
      this.cacheInvalidated = false;
    }
  }
}

// Implementation classes for builders
class EntityBuilderImpl implements EntityBuilder {
  private readonly components: Component[] = [];

  constructor(private readonly world: World) {}

  with<T extends Component>(component: T): EntityBuilder {
    this.components.push(component);
    return this;
  }

  withComponents(...components: Component[]): EntityBuilder {
    this.components.push(...components);
    return this;
  }

  build(): Entity {
    const entity = createEntity();
    this.world.addEntity(entity);
    for (const component of this.components) {
      this.world.addComponent(entity, component);
    }
    return entity;
  }
}

class QueryBuilderImpl implements QueryBuilder {
  private readonly withComponents: ComponentConstructor[] = [];
  private readonly withoutComponents: ComponentConstructor[] = [];

  constructor(private readonly world: World) {}

  with<T extends Component>(...componentTypes: ComponentConstructor<T>[]): QueryBuilder {
    this.withComponents.push(...componentTypes);
    return this;
  }

  without<T extends Component>(...componentTypes: ComponentConstructor<T>[]): QueryBuilder {
    this.withoutComponents.push(...componentTypes);
    return this;
  }

  execute(): Entity[] {
    const withEntities = this.withComponents.length > 0 
      ? this.world.getEntitiesWithComponents(...this.withComponents)
      : this.world.getAllEntities();

    if (this.withoutComponents.length === 0) {
      return withEntities;
    }

    return withEntities.filter(entity => {
      return !this.withoutComponents.some(componentType => 
        this.world.hasComponent(entity, componentType)
      );
    });
  }

  first(): Entity | undefined {
    const entities = this.execute();
    return entities.length > 0 ? entities[0] : undefined;
  }

  count(): number {
    return this.execute().length;
  }
}