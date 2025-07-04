/**
 * Resource management system for loading and caching assets.
 * Handles textures, audio, and other game assets.
 */
export interface Resource {
  readonly id: string;
  readonly type: string;
  readonly data: unknown;
}

export class ResourceManager {
  private readonly resources = new Map<string, Resource>();
  private readonly loadingPromises = new Map<string, Promise<Resource>>();

  async loadImage(id: string, url: string): Promise<HTMLImageElement> {
    if (this.resources.has(id)) {
      const resource = this.resources.get(id)!;
      if (resource.type === 'image') {
        return resource.data as HTMLImageElement;
      }
    }

    if (this.loadingPromises.has(id)) {
      const resource = await this.loadingPromises.get(id)!;
      return resource.data as HTMLImageElement;
    }

    const promise = this.loadImageInternal(id, url);
    this.loadingPromises.set(id, promise);

    try {
      const resource = await promise;
      this.resources.set(id, resource);
      this.loadingPromises.delete(id);
      return resource.data as HTMLImageElement;
    } catch (error) {
      this.loadingPromises.delete(id);
      throw error;
    }
  }

  private async loadImageInternal(id: string, url: string): Promise<Resource> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        resolve({
          id,
          type: 'image',
          data: image
        });
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      image.src = url;
    });
  }

  async loadJSON(id: string, url: string): Promise<unknown> {
    if (this.resources.has(id)) {
      const resource = this.resources.get(id)!;
      if (resource.type === 'json') {
        return resource.data;
      }
    }

    if (this.loadingPromises.has(id)) {
      const resource = await this.loadingPromises.get(id)!;
      return resource.data;
    }

    const promise = this.loadJSONInternal(id, url);
    this.loadingPromises.set(id, promise);

    try {
      const resource = await promise;
      this.resources.set(id, resource);
      this.loadingPromises.delete(id);
      return resource.data;
    } catch (error) {
      this.loadingPromises.delete(id);
      throw error;
    }
  }

  private async loadJSONInternal(id: string, url: string): Promise<Resource> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url} (${response.status})`);
    }
    
    const data = await response.json() as unknown;
    return {
      id,
      type: 'json',
      data
    };
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  isLoading(id: string): boolean {
    return this.loadingPromises.has(id);
  }

  unloadResource(id: string): void {
    this.resources.delete(id);
    this.loadingPromises.delete(id);
  }

  clear(): void {
    this.resources.clear();
    this.loadingPromises.clear();
  }

  getLoadedResourceIds(): string[] {
    return Array.from(this.resources.keys());
  }

  getLoadingResourceIds(): string[] {
    return Array.from(this.loadingPromises.keys());
  }
}