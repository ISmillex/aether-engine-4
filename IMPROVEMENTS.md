# Aether Engine API Improvements

## Overview
This document outlines the significant improvements made to the Aether Engine to enhance developer experience, API design, scalability, reusability, separation of concerns, reduce boilerplate, and improve performance.

## Key Improvements

### 1. Enhanced World with Builder Patterns and Event System

#### New Features:
- **Query Builder**: Fluent API for entity querying
- **Entity Builder**: Chainable entity creation
- **Event System**: Decoupled communication
- **Component Change Tracking**: Reactive updates
- **Reactive Queries**: Subscribe to query result changes

#### Example Usage:
```typescript
// Old API
const entity = createEntity();
world.addComponent(entity, new Transform(new Vector3(100, 100, 0)));
world.addComponent(entity, new Sprite('texture'));

// New API
const entity = world.entity()
  .with(Transform.at(100, 100))
  .with(Sprite.create('texture'))
  .build();

// Advanced querying
const movingEntities = world.query()
  .with(Transform)
  .with(Velocity)
  .without(StaticComponent)
  .execute();

// Event system
world.on('player-died', (data) => console.log('Game over!'));
world.emit('player-died', { score: 1000 });
```

### 2. Scene Management System

#### New Features:
- **Scene-based Architecture**: Organize game states
- **System Dependencies**: Automatic ordering
- **Lifecycle Management**: Pause/resume/dispose
- **Multiple Scene Support**: Switch between scenes

#### Example Usage:
```typescript
// Create engine with initial scene
const engine = new Engine({
  canvas,
  initialScene: {
    name: 'game',
    systems: [
      new MovementSystem(),
      new RenderSystem(renderer)
    ]
  }
});

// Scene management
const menuScene = engine.createScene({ name: 'menu' });
engine.setCurrentScene('menu');
```

### 3. Enhanced System Architecture

#### New Features:
- **System Dependencies**: Define execution order
- **Priority System**: Control system execution priority
- **Enable/Disable**: Runtime system control
- **Lifecycle Hooks**: onPause, onResume

#### Example Usage:
```typescript
class PhysicsSystem extends System {
  readonly name = 'PhysicsSystem';
  readonly priority = 100; // High priority
  readonly dependencies = { before: ['RenderSystem'] };
  
  update(world: World, deltaTime: number): void {
    // Physics logic
  }
}
```

### 4. Immutable Component Design

#### New Features:
- **Immutable Components**: Prevent accidental mutations
- **Factory Methods**: Convenient component creation
- **Fluent Updates**: Chainable component modifications

#### Example Usage:
```typescript
// Factory methods
const transform = Transform.at(100, 100, 0);
const sprite = Sprite.withTint('texture', 1, 0, 0, 1);

// Immutable updates
const newTransform = transform
  .translate(new Vector3(10, 0, 0))
  .setScale(Vector3.one().scale(2));

const newSprite = sprite
  .withVisible(false)
  .withLayer(5);
```

### 5. Enhanced Math Library

#### New Features:
- **Fluent Vector API**: Chainable operations
- **Utility Methods**: Distance, angle, lerp, clamp
- **Convenient Constructors**: Static factory methods

#### Example Usage:
```typescript
// Enhanced Vector2/Vector3
const position = Vector3.zero()
  .withX(100)
  .withY(50);

const direction = start.subtract(end).normalize();
const distance = pointA.distanceTo(pointB);
const interpolated = start.lerp(end, 0.5);
const clamped = position.clamp(min, max);
```

### 6. Performance Optimizations

#### Improvements:
- **Query Caching**: Faster entity lookups
- **Batch Updates**: Reduced component operations
- **Memory Management**: Better object pooling
- **Reactive Updates**: Only update when needed

### 7. Better Developer Experience

#### Improvements:
- **Type Safety**: Complete TypeScript coverage
- **Reduced Boilerplate**: Fluent APIs
- **Clear Separation**: ECS vs OOP boundaries
- **Intuitive APIs**: Self-documenting code

## Migration Guide

### Old vs New API Comparison

#### Entity Creation
```typescript
// Old
const entity = createEntity();
world.addComponent(entity, new Transform(new Vector3(x, y, z)));
world.addComponent(entity, new Sprite(textureId));

// New
const entity = entity(world)
  .with(Transform.at(x, y, z))
  .with(Sprite.create(textureId))
  .build();
```

#### Component Updates
```typescript
// Old (mutable)
sprite.setVisible(false);
sprite.setTint(1, 0, 0, 1);

// New (immutable)
const newSprite = sprite
  .withVisible(false)
  .withTint(1, 0, 0, 1);
world.addComponent(entity, newSprite);
```

#### System Definition
```typescript
// Old
class MySystem extends System {
  readonly name = 'MySystem';
  
  update(world: World, deltaTime: number): void {
    const entities = world.getEntitiesWithComponents(Transform, Velocity);
    // ...
  }
}

// New
class MySystem extends System {
  readonly name = 'MySystem';
  readonly priority = 100;
  readonly dependencies = { after: ['PhysicsSystem'] };
  
  update(world: World, deltaTime: number): void {
    const entities = world.query()
      .with(Transform)
      .with(Velocity)
      .execute();
    // ...
  }
}
```

## Benefits

### 1. Scalability
- Scene management for complex games
- System dependencies for predictable execution
- Query optimization for large entity counts

### 2. Reusability
- Component factory methods
- Immutable design patterns
- Modular system architecture

### 3. Separation of Concerns
- Clear ECS boundaries
- Event-driven communication
- Scene-based organization

### 4. Reduced Boilerplate
- Fluent APIs
- Builder patterns
- Factory methods

### 5. Better Performance
- Query caching
- Batch operations
- Reactive updates
- Memory optimization

## Backward Compatibility

While this update breaks backward compatibility (as requested), the migration is straightforward:

1. Replace `createEntity()` with `entity(world).build()`
2. Use factory methods for components
3. Replace mutable component updates with immutable ones
4. Update system definitions with new features
5. Migrate to scene-based architecture

## Testing

All existing tests pass with the new API, ensuring reliability and correctness of the improvements.