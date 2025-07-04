import { Shader } from './shader.js';
import { ObjectPool } from '../performance/object-pool.js';

interface SpriteData {
  x: number;
  y: number;
  width: number;
  height: number;
  textureId: string;
  tint: [number, number, number, number];
  layer: number;
}

/**
 * Efficient sprite batching renderer for 2D graphics.
 * Minimizes draw calls by batching sprites with the same texture.
 */
export class SpriteBatcher {
  private readonly vertexBuffer: WebGLBuffer;
  private readonly indexBuffer: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly shader: Shader;
  
  private readonly vertices: Float32Array;
  private readonly indices: Uint16Array;
  private readonly maxSprites: number;
  private spriteCount = 0;
  
  private readonly sprites: SpriteData[] = [];
  private readonly spritePool: ObjectPool<SpriteData>;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    maxSprites: number = 1000
  ) {
    this.maxSprites = maxSprites;
    
    // Each sprite has 4 vertices, each vertex has 8 floats (x, y, u, v, r, g, b, a)
    this.vertices = new Float32Array(maxSprites * 4 * 8);
    
    // Each sprite has 6 indices (2 triangles)
    this.indices = new Uint16Array(maxSprites * 6);
    
    // Pre-fill indices
    for (let i = 0; i < maxSprites; i++) {
      const offset = i * 6;
      const vertexOffset = i * 4;
      
      this.indices[offset] = vertexOffset;
      this.indices[offset + 1] = vertexOffset + 1;
      this.indices[offset + 2] = vertexOffset + 2;
      this.indices[offset + 3] = vertexOffset + 2;
      this.indices[offset + 4] = vertexOffset + 3;
      this.indices[offset + 5] = vertexOffset;
    }

    this.vertexBuffer = this.createBuffer();
    this.indexBuffer = this.createBuffer();
    this.vao = this.createVAO();
    this.shader = this.createShader();
    
    // Initialize sprite pool for better memory management
    this.spritePool = new ObjectPool<SpriteData>(
      () => ({ x: 0, y: 0, width: 0, height: 0, textureId: '', tint: [1, 1, 1, 1], layer: 0 }),
      (sprite) => {
        sprite.x = 0;
        sprite.y = 0;
        sprite.width = 0;
        sprite.height = 0;
        sprite.textureId = '';
        sprite.tint = [1, 1, 1, 1];
        sprite.layer = 0;
      },
      maxSprites
    );
  }

  private createBuffer(): WebGLBuffer {
    const buffer = this.gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }
    return buffer;
  }

  private createVAO(): WebGLVertexArrayObject {
    const vao = this.gl.createVertexArray();
    if (!vao) {
      throw new Error('Failed to create VAO');
    }

    this.gl.bindVertexArray(vao);
    
    // Bind vertex buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.DYNAMIC_DRAW);
    
    // Position attribute (x, y)
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 8 * 4, 0);
    
    // Texture coordinate attribute (u, v)
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 8 * 4, 2 * 4);
    
    // Color attribute (r, g, b, a)
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 4, this.gl.FLOAT, false, 8 * 4, 4 * 4);
    
    // Bind index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
    
    this.gl.bindVertexArray(null);
    return vao;
  }

  private createShader(): Shader {
    const vertexSource = `#version 300 es
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_texCoord;
      layout(location = 2) in vec4 a_color;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      
      out vec2 v_texCoord;
      out vec4 v_color;
      
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
        v_color = a_color;
      }
    `;

    const fragmentSource = `#version 300 es
      precision mediump float;
      
      in vec2 v_texCoord;
      in vec4 v_color;
      
      uniform sampler2D u_texture;
      
      out vec4 fragColor;
      
      void main() {
        fragColor = texture(u_texture, v_texCoord) * v_color;
      }
    `;

    return new Shader(this.gl, vertexSource, fragmentSource);
  }

  addSprite(spriteData: SpriteData): void {
    if (this.spriteCount >= this.maxSprites) {
      this.flush();
    }
    
    // Use pooled sprite object to reduce allocations
    const sprite = this.spritePool.acquire();
    sprite.x = spriteData.x;
    sprite.y = spriteData.y;
    sprite.width = spriteData.width;
    sprite.height = spriteData.height;
    sprite.textureId = spriteData.textureId;
    sprite.tint = spriteData.tint;
    sprite.layer = spriteData.layer;
    
    this.sprites.push(sprite);
    this.spriteCount++;
  }

  flush(): void {
    if (this.spriteCount === 0) return;
    
    // Sort sprites by layer, then by texture
    this.sprites.sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      return a.textureId.localeCompare(b.textureId);
    });
    
    // Build vertex data
    let vertexIndex = 0;
    for (let i = 0; i < this.spriteCount; i++) {
      const sprite = this.sprites[i]!;
      const { x, y, width, height, tint } = sprite;
      
      // Bottom-left
      this.vertices[vertexIndex++] = x;
      this.vertices[vertexIndex++] = y;
      this.vertices[vertexIndex++] = 0; // u
      this.vertices[vertexIndex++] = 1; // v
      this.vertices[vertexIndex++] = tint[0];
      this.vertices[vertexIndex++] = tint[1];
      this.vertices[vertexIndex++] = tint[2];
      this.vertices[vertexIndex++] = tint[3];
      
      // Bottom-right
      this.vertices[vertexIndex++] = x + width;
      this.vertices[vertexIndex++] = y;
      this.vertices[vertexIndex++] = 1; // u
      this.vertices[vertexIndex++] = 1; // v
      this.vertices[vertexIndex++] = tint[0];
      this.vertices[vertexIndex++] = tint[1];
      this.vertices[vertexIndex++] = tint[2];
      this.vertices[vertexIndex++] = tint[3];
      
      // Top-right
      this.vertices[vertexIndex++] = x + width;
      this.vertices[vertexIndex++] = y + height;
      this.vertices[vertexIndex++] = 1; // u
      this.vertices[vertexIndex++] = 0; // v
      this.vertices[vertexIndex++] = tint[0];
      this.vertices[vertexIndex++] = tint[1];
      this.vertices[vertexIndex++] = tint[2];
      this.vertices[vertexIndex++] = tint[3];
      
      // Top-left
      this.vertices[vertexIndex++] = x;
      this.vertices[vertexIndex++] = y + height;
      this.vertices[vertexIndex++] = 0; // u
      this.vertices[vertexIndex++] = 0; // v
      this.vertices[vertexIndex++] = tint[0];
      this.vertices[vertexIndex++] = tint[1];
      this.vertices[vertexIndex++] = tint[2];
      this.vertices[vertexIndex++] = tint[3];
    }
    
    // Upload vertex data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, vertexIndex));
    
    // Render batches
    this.shader.use();
    this.gl.bindVertexArray(this.vao);
    
    let currentTexture = '';
    let batchStart = 0;
    
    for (let i = 0; i <= this.spriteCount; i++) {
      const sprite = this.sprites[i];
      const textureChanged = !sprite || sprite.textureId !== currentTexture;
      
      if (textureChanged && i > batchStart) {
        // Render current batch
        const spriteCount = i - batchStart;
        this.gl.drawElements(
          this.gl.TRIANGLES,
          spriteCount * 6,
          this.gl.UNSIGNED_SHORT,
          batchStart * 6 * 2
        );
        batchStart = i;
      }
      
      if (sprite && textureChanged) {
        currentTexture = sprite.textureId;
        // Bind texture here when texture management is implemented
      }
    }
    
    this.gl.bindVertexArray(null);
    
    // Clear for next frame and return sprites to pool
    for (const sprite of this.sprites) {
      this.spritePool.release(sprite);
    }
    this.sprites.length = 0;
    this.spriteCount = 0;
  }

  setProjectionMatrix(matrix: number[]): void {
    this.shader.use();
    this.shader.setUniformMatrix4fv('u_projection', matrix);
  }

  setViewMatrix(matrix: number[]): void {
    this.shader.use();
    this.shader.setUniformMatrix4fv('u_view', matrix);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.vertexBuffer);
    this.gl.deleteBuffer(this.indexBuffer);
    this.gl.deleteVertexArray(this.vao);
    this.shader.dispose();
  }
}