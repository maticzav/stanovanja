/**
 * Checks that the given value is not undefined.
 */
export function defined<T>(val: T | undefined): val is T {
  return val !== undefined
}
