import { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { Entity } from '../ecs/entity.js';
import { Transform, Sprite, Camera } from '../components/index.js';
import type { Renderer } from '../renderer/renderer.js';

/**
 * Render system that interfaces between the ECS world and the OOP renderer.
 */
export class RenderSystem extends System {
  readonly name = 'RenderSystem';

  constructor(private readonly renderer: Renderer) {
    super();
  }

  initialize(_world: World): void {
    // Create a default white texture for sprites without textures
    this.renderer.createSolidTexture('default_white', 1, 1, [1, 1, 1, 1]);
  }

  update(world: World, _deltaTime: number): void {
    // Find active camera (cached lookup)
    const cameraEntities = world.getEntitiesWithComponents(Camera, Transform);
    let activeCamera: Entity | undefined;
    let camera: Camera | undefined;
    let cameraTransform: Transform | undefined;

    for (const entity of cameraEntities) {
      const cam = world.getComponent(entity, Camera)!;
      if (cam.active) {
        activeCamera = entity;
        camera = cam;
        cameraTransform = world.getComponent(entity, Transform)!;
        break;
      }
    }

    if (!activeCamera || !camera || !cameraTransform) {
      return; // No active camera, skip rendering
    }

    // Clear screen
    const [r, g, b, a] = camera.clearColor;
    this.renderer.clear(r, g, b, a);

    // Set view matrix (inverse of camera transform)
    const viewMatrix = this.createViewMatrix(cameraTransform);
    this.renderer.setViewMatrix(viewMatrix);

    this.renderer.beginFrame();

    // Performance optimization: Batch component lookups and reduce allocations
    const spriteEntities = world.getEntitiesWithComponents(Sprite, Transform);
    
    // Pre-allocate arrays for better performance
    const renderData: Array<{
      sprite: Sprite;
      transform: Transform;
      layer: number;
    }> = [];

    // Single pass: get components and filter visible sprites
    for (const entity of spriteEntities) {
      const sprite = world.getComponent(entity, Sprite)!;
      if (sprite.visible) {
        const transform = world.getComponent(entity, Transform)!;
        renderData.push({ sprite, transform, layer: sprite.layer });
      }
    }

    // Sort by layer for proper rendering order (more efficient sort)
    renderData.sort((a, b) => a.layer - b.layer);

    // Render sprites with minimal function calls
    for (const { sprite, transform } of renderData) {
      const position = transform.position;
      const scale = transform.scale;
      
      this.renderer.drawSprite(
        sprite.textureId || 'default_white',
        position.x + sprite.offset.x,
        position.y + sprite.offset.y,
        sprite.size.x * scale.x,
        sprite.size.y * scale.y,
        sprite.tint,
        sprite.layer
      );
    }

    this.renderer.endFrame();
  }

  private createViewMatrix(cameraTransform: Transform): number[] {
    // For 2D rendering, we mainly care about translation
    // More complex view matrices would involve the full transform inverse
    const pos = cameraTransform.position;
    
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -pos.x, -pos.y, -pos.z, 1
    ];
  }
}