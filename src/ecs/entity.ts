/**
 * Entity type definition for the ECS system.
 * An Entity is simply a unique identifier.
 */
export type Entity = number;

let nextEntityId = 1;

export function createEntity(): Entity {
  return nextEntityId++;
}

export function resetEntityCounter(): void {
  nextEntityId = 1;
}