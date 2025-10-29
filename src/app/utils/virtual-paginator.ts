// core/utils/virtual-paginator.ts

/** Total “virtual” cuando el backend NO entrega total real. */
export function computeVirtualTotal(pageIndex: number, pageSize: number, receivedCount: number): number {
    // Si el backend devolvió página “llena”, asumimos que hay más.
    const hasMore = receivedCount === pageSize;
  
    // total virtual = elementos vistos + (margen de avance si hay más)
    // margen = una página extra (pageSize) + otra de seguridad (pageSize) → UX fluida
    return hasMore
      ? (pageIndex * pageSize) + (pageSize * 2)
      : (pageIndex * pageSize) + receivedCount;
  }
  
  /** ¿Debemos retroceder? (cuando el backend devuelve vacío al avanzar) */
  export function shouldStepBack(pageIndex: number, receivedCount: number): boolean {
    return pageIndex > 0 && receivedCount === 0;
  }
  
  /** Cache simple por clave (útil si quieres back/forward instantáneo). */
  export class PageCache<T> {
    private map = new Map<string, T[]>();
    key(q: string, pageIndex: number, pageSize: number): string {
      return `${(q ?? '').trim()}::${pageIndex}::${pageSize}`;
    }
    get(key: string): T[] | undefined { return this.map.get(key); }
    set(key: string, data: T[]): void { this.map.set(key, data); }
    clear(prefix?: string): void {
      if (!prefix) return this.map.clear();
      [...this.map.keys()].forEach(k => { if (k.startsWith(prefix)) this.map.delete(k); });
    }
  }
  