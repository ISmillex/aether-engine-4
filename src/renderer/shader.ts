/**
 * WebGL shader management and compilation utilities.
 */
export class Shader {
  private program: WebGLProgram;
  private uniformLocations = new Map<string, WebGLUniformLocation>();
  private attributeLocations = new Map<string, number>();

  constructor(
    private readonly gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    this.program = this.createProgram(vertexSource, fragmentSource);
    this.cacheLocations();
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create shader program');
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Failed to link shader program: ${info}`);
    }

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${info}`);
    }

    return shader;
  }

  private cacheLocations(): void {
    const numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = this.gl.getActiveUniform(this.program, i);
      if (info) {
        const location = this.gl.getUniformLocation(this.program, info.name);
        if (location) {
          this.uniformLocations.set(info.name, location);
        }
      }
    }

    const numAttributes = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const info = this.gl.getActiveAttrib(this.program, i);
      if (info) {
        const location = this.gl.getAttribLocation(this.program, info.name);
        this.attributeLocations.set(info.name, location);
      }
    }
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  setUniform1f(name: string, value: number): void {
    const location = this.uniformLocations.get(name);
    if (location) {
      this.gl.uniform1f(location, value);
    }
  }

  setUniform2f(name: string, x: number, y: number): void {
    const location = this.uniformLocations.get(name);
    if (location) {
      this.gl.uniform2f(location, x, y);
    }
  }

  setUniform3f(name: string, x: number, y: number, z: number): void {
    const location = this.uniformLocations.get(name);
    if (location) {
      this.gl.uniform3f(location, x, y, z);
    }
  }

  setUniform4f(name: string, x: number, y: number, z: number, w: number): void {
    const location = this.uniformLocations.get(name);
    if (location) {
      this.gl.uniform4f(location, x, y, z, w);
    }
  }

  setUniformMatrix4fv(name: string, matrix: number[]): void {
    const location = this.uniformLocations.get(name);
    if (location) {
      this.gl.uniformMatrix4fv(location, false, matrix);
    }
  }

  getAttributeLocation(name: string): number {
    return this.attributeLocations.get(name) ?? -1;
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
    this.uniformLocations.clear();
    this.attributeLocations.clear();
  }
}