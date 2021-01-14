/**
 * Checks that the given value is not undefined.
 */
export function defined<T>(val: T | undefined): val is T {
  return val !== undefined
}

/**
 * Returns the sum of all numbers.
 */
export function sum(xs: number[]): number {
  return xs.reduce((acc, x) => acc + x, 0)
}
