# Aether Engine

A modern, data-driven 2D/3D game engine built with TypeScript and Geometric Algebra.

## Features

- **Entity-Component-System (ECS) Architecture**: Data-driven game object management
- **Geometric Algebra Math**: Elegant mathematical foundation using multivectors and rotors
- **Type-Safe TypeScript**: Complete type safety with no `any` types
- **WebGL Rendering**: High-performance graphics with sprite batching
- **Hybrid Architecture**: ECS for game logic, OOP for engine subsystems
- **Resource Management**: Efficient asset loading and caching
- **Input System**: Comprehensive keyboard, mouse, and touch input handling

## Architecture

The Aether Engine follows a pragmatic hybrid design:

- **ECS for Game World**: All game entities, components, and systems use the ECS pattern
- **OOP for Engine Subsystems**: Core engine systems (Renderer, ResourceManager, InputManager) are object-oriented classes
- **Geometric Algebra**: All transformations and geometric calculations use GA instead of traditional matrices

## Core Modules

- `core/`: Main Engine class and game loop
- `ecs/`: Entity-Component-System implementation
- `math/`: Geometric Algebra library (Multivector, Rotor, Vector)
- `renderer/`: WebGL abstraction and sprite batching
- `components/`: Core component definitions (Transform, Sprite, Velocity, Camera)
- `systems/`: Core system implementations (Movement, Render)
- `resources/`: Asset management and loading
- `input/`: Input handling and management

## Quick Start

```typescript
import { 
  Engine, 
  createEntity, 
  Transform, 
  Sprite, 
  MovementSystem, 
  RenderSystem,
  Vector3 
} from 'aether-engine';

// Create engine
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const engine = new Engine({ canvas });

// Add systems
engine.addSystem(new MovementSystem());
engine.addSystem(new RenderSystem(engine.getRenderer()));

// Create an entity
const entity = createEntity();
const transform = new Transform(new Vector3(100, 100, 0));
const sprite = new Sprite('my-texture');

engine.getWorld().addComponent(entity, transform);
engine.getWorld().addComponent(entity, sprite);

// Start the engine
engine.start();
```

## Building and Testing

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Run all checks (build + test + lint)
pnpm run preflight
```

## Mathematical Foundation

The engine uses Geometric Algebra (GA) as its mathematical foundation:

- **Multivectors**: Unified representation of scalars, vectors, bivectors, and trivectors
- **Rotors**: GA equivalent of quaternions for rotations
- **No Matrices**: Traditional matrices are only generated at the final WebGL interface

This provides a more elegant and unified approach to 3D mathematics compared to traditional vector/matrix approaches.

## License

ISC