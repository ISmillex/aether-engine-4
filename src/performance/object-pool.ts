/**
 * Generic object pool for reducing garbage collection pressure.
 * Reuses objects instead of creating new ones.
 */
export class ObjectPool<T> {
  private readonly pool: T[] = [];
  private readonly createFn: () => T;
  private readonly resetFn: ((obj: T) => void) | undefined;

  constructor(createFn: () => T, resetFn?: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    const obj = this.pool.pop();
    if (obj) {
      return obj;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }

  get size(): number {
    return this.pool.length;
  }
}

/**
 * Array pool for reusing arrays and reducing allocations.
 */
export class ArrayPool<T> {
  private readonly pools = new Map<number, T[][]>();

  acquire(size: number): T[] {
    const pool = this.pools.get(size);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return new Array(size);
  }

  release(array: T[]): void {
    const size = array.length;
    array.length = 0; // Clear the array
    
    if (!this.pools.has(size)) {
      this.pools.set(size, []);
    }
    this.pools.get(size)!.push(array);
  }

  clear(): void {
    this.pools.clear();
  }
}