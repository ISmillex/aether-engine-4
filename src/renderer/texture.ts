/**
 * WebGL texture management.
 */
export class Texture {
  private texture: WebGLTexture;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    public readonly width: number,
    public readonly height: number
  ) {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }
    this.texture = texture;
  }

  static fromImageData(
    gl: WebGL2RenderingContext,
    imageData: ImageData
  ): Texture {
    const texture = new Texture(gl, imageData.width, imageData.height);
    texture.bind();
    
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data
    );
    
    texture.setParameters();
    return texture;
  }

  static fromImage(
    gl: WebGL2RenderingContext,
    image: HTMLImageElement
  ): Texture {
    const texture = new Texture(gl, image.width, image.height);
    texture.bind();
    
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
    
    texture.setParameters();
    return texture;
  }

  static createSolid(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    color: [number, number, number, number]
  ): Texture {
    const texture = new Texture(gl, width, height);
    texture.bind();
    
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = color[0] * 255;
      data[i + 1] = color[1] * 255;
      data[i + 2] = color[2] * 255;
      data[i + 3] = color[3] * 255;
    }
    
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data
    );
    
    texture.setParameters();
    return texture;
  }

  bind(unit: number = 0): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  private setParameters(): void {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  }

  dispose(): void {
    this.gl.deleteTexture(this.texture);
  }
}