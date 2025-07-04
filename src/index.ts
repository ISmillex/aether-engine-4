// Core engine
export { Engine, type EngineConfig } from './core/index.js';

// ECS system
export { 
  type Entity, 
  createEntity, 
  resetEntityCounter,
  type Component,
  type ComponentConstructor,
  World,
  System
} from './ecs/index.js';

// Math library
export { 
  Multivector, 
  type MultivectorComponents,
  Rotor,
  Vector2,
  Vector3
} from './math/index.js';

// Components
export {
  Transform,
  Sprite,
  Velocity,
  Camera
} from './components/index.js';

// Systems
export {
  MovementSystem,
  RenderSystem
} from './systems/index.js';

// Renderer
export {
  Shader,
  Texture,
  SpriteBatcher,
  Renderer
} from './renderer/index.js';

// Resources
export {
  ResourceManager,
  type Resource
} from './resources/index.js';

// Input
export {
  InputManager
} from './input/index.js';