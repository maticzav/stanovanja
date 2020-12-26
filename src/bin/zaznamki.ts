import { Posredovanje, PrismaClient } from '@prisma/client'
import { poisciOglase } from '../scarpper'

/* Configuration */

const posredovanja: Posredovanje[] = ['PRODAJA', 'ODDAJA']

/* Program */

const client = new PrismaClient({})

async function main() {
  // Poišči oglase v vseh posredovanjih.
  for (const posredovanje of posredovanja) {
    /* Poišči oglase */
    for await (const { id, url } of poisciOglase(posredovanje)) {
      // Shrani oglas v bazo.
      const oglas = await client.zaznamek.upsert({
        where: { id },
        create: { id, url, posredovanje },
        update: {},
      })
      console.log(`Zaznamek ${oglas.id}...`)
    }
  }
}

/* Poženemo program */

if (require.main === module) {
  main()
}
