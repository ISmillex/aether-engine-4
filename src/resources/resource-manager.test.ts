import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourceManager } from './resource-manager.js';

// Mock global fetch
global.fetch = vi.fn();

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  
  constructor() {
    // Simulate async loading
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as unknown as typeof Image;

describe('ResourceManager', () => {
  let resourceManager: ResourceManager;
  
  beforeEach(() => {
    resourceManager = new ResourceManager();
    vi.clearAllMocks();
  });

  describe('image loading', () => {
    it('should load images successfully', async () => {
      const image = await resourceManager.loadImage('test-image', 'test.png');
      
      expect(image).toBeInstanceOf(Image);
      expect(resourceManager.hasResource('test-image')).toBe(true);
      expect(resourceManager.getResource('test-image')?.type).toBe('image');
    });

    it('should return cached image on subsequent loads', async () => {
      const image1 = await resourceManager.loadImage('test-image', 'test.png');
      const image2 = await resourceManager.loadImage('test-image', 'different.png');
      
      expect(image1).toBe(image2);
    });

    it('should handle concurrent loading of same resource', async () => {
      const promise1 = resourceManager.loadImage('test-image', 'test.png');
      const promise2 = resourceManager.loadImage('test-image', 'test.png');
      
      const [image1, image2] = await Promise.all([promise1, promise2]);
      
      expect(image1).toBe(image2);
    });
  });

  describe('JSON loading', () => {
    it('should load JSON successfully', async () => {
      const mockData = { test: 'data' };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const data = await resourceManager.loadJSON('test-json', 'test.json');
      
      expect(data).toEqual(mockData);
      expect(resourceManager.hasResource('test-json')).toBe(true);
      expect(resourceManager.getResource('test-json')?.type).toBe('json');
    });

    it('should handle fetch errors', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      await expect(resourceManager.loadJSON('test-json', 'missing.json'))
        .rejects.toThrow('Failed to load JSON');
    });

    it('should return cached JSON on subsequent loads', async () => {
      const mockData = { test: 'data' };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const data1 = await resourceManager.loadJSON('test-json', 'test.json');
      const data2 = await resourceManager.loadJSON('test-json', 'different.json');
      
      expect(data1).toBe(data2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('resource management', () => {
    it('should track loading state', () => {
      expect(resourceManager.isLoading('test')).toBe(false);
      
      const promise = resourceManager.loadImage('test', 'test.png');
      expect(resourceManager.isLoading('test')).toBe(true);
      
      return promise.then(() => {
        expect(resourceManager.isLoading('test')).toBe(false);
      });
    });

    it('should unload resources', async () => {
      await resourceManager.loadImage('test-image', 'test.png');
      
      expect(resourceManager.hasResource('test-image')).toBe(true);
      
      resourceManager.unloadResource('test-image');
      
      expect(resourceManager.hasResource('test-image')).toBe(false);
    });

    it('should clear all resources', async () => {
      await resourceManager.loadImage('image1', 'test1.png');
      await resourceManager.loadImage('image2', 'test2.png');
      
      expect(resourceManager.getLoadedResourceIds()).toHaveLength(2);
      
      resourceManager.clear();
      
      expect(resourceManager.getLoadedResourceIds()).toHaveLength(0);
    });

    it('should list loaded and loading resources', () => {
      const promise = resourceManager.loadImage('loading', 'test.png');
      
      expect(resourceManager.getLoadingResourceIds()).toContain('loading');
      
      return promise.then(() => {
        expect(resourceManager.getLoadedResourceIds()).toContain('loading');
        expect(resourceManager.getLoadingResourceIds()).not.toContain('loading');
      });
    });
  });
});