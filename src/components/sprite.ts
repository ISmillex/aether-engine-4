import type { Component } from '../ecs/component.js';
import { Vector2 } from '../math/index.js';

/**
 * Sprite component for 2D rendering.
 * Contains texture information and rendering properties.
 */
export class Sprite implements Component {
  static readonly TYPE_NAME = 'Sprite';
  readonly type = 'Sprite';

  constructor(
    public readonly textureId: string,
    public readonly size: Vector2 = Vector2.one(),
    public readonly offset: Vector2 = Vector2.zero(),
    public readonly tint: [number, number, number, number] = [1, 1, 1, 1],
    public readonly visible: boolean = true,
    public readonly layer: number = 0
  ) {}

  // Factory methods for common sprites
  static create(textureId: string): Sprite {
    return new Sprite(textureId);
  }

  static withSize(textureId: string, width: number, height: number): Sprite {
    return new Sprite(textureId, new Vector2(width, height));
  }

  static withTint(textureId: string, r: number, g: number, b: number, a: number = 1): Sprite {
    return new Sprite(textureId, Vector2.one(), Vector2.zero(), [r, g, b, a]);
  }

  static onLayer(textureId: string, layer: number): Sprite {
    return new Sprite(textureId, Vector2.one(), Vector2.zero(), [1, 1, 1, 1], true, layer);
  }

  // Immutable update methods
  withTexture(textureId: string): Sprite {
    return new Sprite(textureId, this.size, this.offset, this.tint, this.visible, this.layer);
  }

  withSize(size: Vector2): Sprite {
    return new Sprite(this.textureId, size, this.offset, this.tint, this.visible, this.layer);
  }

  withOffset(offset: Vector2): Sprite {
    return new Sprite(this.textureId, this.size, offset, this.tint, this.visible, this.layer);
  }

  withTint(r: number, g: number, b: number, a: number = 1): Sprite {
    return new Sprite(this.textureId, this.size, this.offset, [r, g, b, a], this.visible, this.layer);
  }

  withVisible(visible: boolean): Sprite {
    return new Sprite(this.textureId, this.size, this.offset, this.tint, visible, this.layer);
  }

  withLayer(layer: number): Sprite {
    return new Sprite(this.textureId, this.size, this.offset, this.tint, this.visible, layer);
  }
}