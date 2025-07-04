import type { Entity } from './entity.js';
import type { Component } from './component.js';
import type { World } from './world.js';
import { createEntity } from './entity.js';

/**
 * Fluent builder for creating entities with components.
 * Provides a chainable API for entity construction.
 */
export class EntityBuilder {
  private readonly components: Component[] = [];
  private entity: Entity | null = null;

  constructor(private readonly world?: World) {}

  /**
   * Add a component to the entity.
   */
  with<T extends Component>(component: T): EntityBuilder {
    this.components.push(component);
    return this;
  }

  /**
   * Add multiple components to the entity.
   */
  withComponents(...components: Component[]): EntityBuilder {
    this.components.push(...components);
    return this;
  }

  /**
   * Build the entity and add it to the world (if provided).
   */
  build(): Entity {
    if (this.entity === null) {
      this.entity = createEntity();
    }

    if (this.world) {
      this.world.addEntity(this.entity);
      for (const component of this.components) {
        this.world.addComponent(this.entity, component);
      }
    }

    return this.entity;
  }

  /**
   * Get the entity ID without building (useful for references).
   */
  getEntity(): Entity {
    if (this.entity === null) {
      this.entity = createEntity();
    }
    return this.entity;
  }

  /**
   * Clone this builder with the same components.
   */
  clone(): EntityBuilder {
    const builder = new EntityBuilder(this.world);
    builder.components.push(...this.components);
    return builder;
  }
}

/**
 * Create a new entity builder.
 */
export function entity(world?: World): EntityBuilder {
  return new EntityBuilder(world);
}