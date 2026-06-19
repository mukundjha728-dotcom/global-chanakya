// Pure TypeScript hooks that do not depend on React/Next.js
export function useDebounceLogic<T>(value: T, delay: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}
