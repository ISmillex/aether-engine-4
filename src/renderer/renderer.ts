import { SpriteBatcher } from './sprite-batcher.js';
import { Texture } from './texture.js';

/**
 * Main renderer class that manages WebGL context and rendering operations.
 * This is an OOP subsystem that provides a stable API for the ECS systems.
 */
export class Renderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly spriteBatcher: SpriteBatcher;
  private readonly textures = new Map<string, Texture>();
  
  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    
    this.gl = gl;
    this.spriteBatcher = new SpriteBatcher(gl);
    
    this.setupGL();
    this.resize(canvas.width, canvas.height);
  }

  private setupGL(): void {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.gl.viewport(0, 0, width, height);
    
    // Update projection matrix for 2D rendering
    const projectionMatrix = this.createOrthographicMatrix(0, width, height, 0, -1, 1);
    this.spriteBatcher.setProjectionMatrix(projectionMatrix);
  }

  private createOrthographicMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): number[] {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    return [
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ];
  }

  clear(r: number = 0, g: number = 0, b: number = 0, a: number = 1): void {
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  beginFrame(): void {
    // Prepare for new frame
  }

  endFrame(): void {
    this.spriteBatcher.flush();
  }

  drawSprite(
    textureId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    tint: [number, number, number, number] = [1, 1, 1, 1],
    layer: number = 0
  ): void {
    this.spriteBatcher.addSprite({
      x,
      y,
      width,
      height,
      textureId,
      tint,
      layer
    });
  }

  loadTexture(id: string, image: HTMLImageElement): void {
    const texture = Texture.fromImage(this.gl, image);
    this.textures.set(id, texture);
  }

  createSolidTexture(
    id: string,
    width: number,
    height: number,
    color: [number, number, number, number]
  ): void {
    const texture = Texture.createSolid(this.gl, width, height, color);
    this.textures.set(id, texture);
  }

  getTexture(id: string): Texture | undefined {
    return this.textures.get(id);
  }

  setViewMatrix(matrix: number[]): void {
    this.spriteBatcher.setViewMatrix(matrix);
  }

  getViewportSize(): [number, number] {
    return [this.viewportWidth, this.viewportHeight];
  }

  dispose(): void {
    this.spriteBatcher.dispose();
    for (const texture of this.textures.values()) {
      texture.dispose();
    }
    this.textures.clear();
  }
}