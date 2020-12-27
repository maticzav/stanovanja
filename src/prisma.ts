import { PrismaClient } from '@prisma/client'

const client = new PrismaClient({})

/**
 * Executes the function and makes sure that client is released after completion.
 */
export async function withPrisma<T>(
  fn: (client: PrismaClient) => Promise<T>,
): Promise<T> {
  try {
    /* Execute the function in a boxed environment. */
    return await fn(client)
  } catch (err) {
    throw err
  } finally {
    await client.$disconnect()
  }
}
