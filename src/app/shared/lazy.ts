// src/app/shared/lazy.ts
export const lazy = <T extends object, K extends keyof T>(p: Promise<T>, key: K) =>
    p.then(m => m[key]);
  