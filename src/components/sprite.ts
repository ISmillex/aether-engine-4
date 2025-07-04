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
    public textureId: string,
    public size: Vector2 = Vector2.one(),
    public offset: Vector2 = Vector2.zero(),
    public tint: [number, number, number, number] = [1, 1, 1, 1],
    public visible: boolean = true,
    public layer: number = 0
  ) {}

  setTexture(textureId: string): void {
    this.textureId = textureId;
  }

  setSize(size: Vector2): void {
    this.size = size;
  }

  setOffset(offset: Vector2): void {
    this.offset = offset;
  }

  setTint(r: number, g: number, b: number, a: number = 1): void {
    this.tint = [r, g, b, a];
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  setLayer(layer: number): void {
    this.layer = layer;
  }
}