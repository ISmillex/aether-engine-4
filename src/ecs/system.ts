import type { World } from './world.js';

/**
 * Base class for all systems in the ECS architecture.
 * Systems contain the logic that operates on entities with specific components.
 */
export abstract class System {
  abstract readonly name: string;
  
  /**
   * Called once when the system is added to the engine.
   */
  initialize?(world: World): void;

  /**
   * Called every frame to update the system.
   */
  abstract update(world: World, deltaTime: number): void;

  /**
   * Called once when the system is removed from the engine.
   */
  cleanup?(world: World): void;
}