import { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { Entity } from '../ecs/entity.js';
import { Transform, Velocity } from '../components/index.js';
import { Rotor } from '../math/index.js';

/**
 * Enhanced movement system that applies velocity to transform components.
 * Uses immutable component updates for better performance and predictability.
 */
export class MovementSystem extends System {
  readonly name = 'MovementSystem';
  readonly priority = 100; // High priority for movement

  update(world: World, deltaTime: number): void {
    // Use the new query builder for better performance
    const entities = world.query()
      .with(Transform)
      .with(Velocity)
      .execute();
    
    // Performance optimization: Batch component updates
    const updates: Array<{ entity: Entity; transform: Transform }> = [];
    
    for (const entity of entities) {
      const transform = world.getComponent(entity, Transform)!;
      const velocity = world.getComponent(entity, Velocity)!;
      
      let newTransform = transform;
      let hasChanges = false;
      
      // Apply linear velocity
      if (velocity.linear.length() > 0) {
        const displacement = velocity.linear.scale(deltaTime);
        newTransform = newTransform.translate(displacement);
        hasChanges = true;
      }
      
      // Apply angular velocity
      if (velocity.angular.length() > 0) {
        const angularDisplacement = velocity.angular.scale(deltaTime);
        const rotationDelta = Rotor.fromEulerAngles(
          angularDisplacement.x,
          angularDisplacement.y,
          angularDisplacement.z
        );
        newTransform = newTransform.rotate(rotationDelta);
        hasChanges = true;
      }
      
      if (hasChanges) {
        updates.push({ entity, transform: newTransform });
      }
    }
    
    // Batch apply all updates
    for (const { entity, transform } of updates) {
      world.addComponent(entity, transform);
    }
  }
}