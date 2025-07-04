import type { World } from './world.js';

export interface SystemDependencies {
  before?: string[];
  after?: string[];
  requires?: string[];
}

/**
 * Enhanced base class for all systems in the ECS architecture.
 * Systems contain the logic that operates on entities with specific components.
 * Supports dependencies, priorities, and lifecycle management.
 */
export abstract class System {
  abstract readonly name: string;
  readonly priority: number = 0;
  readonly dependencies: SystemDependencies = {};
  protected enabled = true;
  
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

  /**
   * Called when the system is paused.
   */
  onPause?(world: World): void;

  /**
   * Called when the system is resumed.
   */
  onResume?(world: World): void;

  /**
   * Enable or disable the system.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if the system is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}