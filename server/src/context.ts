import { Oglas, PrismaClient } from '@prisma/client'

/* Context */

export type Context = {
  prisma: PrismaClient
}

/* Types */

export interface Stanovanje extends Oglas {
  cena: number
  velikost: number
  st_sob: number
}
