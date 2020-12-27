import { Posredovanje, PrismaClient } from '@prisma/client'

import { withPrisma } from '../prisma'
import { poisciOglase } from '../scarpper'

/* Configuration */

const posredovanja: Posredovanje[] = ['NAJEM', 'NAKUP', 'PRODAJA', 'ODDAJA']

/* Program */

async function main(client: PrismaClient) {
  /**
   * Najprej popravimo vse zaznamke na neaktivne, nato pa pogledamo katere smo spet našli.
   */
  const popravljeni = await client.zaznamek.updateMany({
    where: {
      aktiven: true,
    },
    data: {
      aktiven: false,
    },
  })

  console.log(`Popravil ${popravljeni.count}`)

  let st_zaznamkov = 0

  // Poišči oglase v vseh posredovanjih.
  for (const posredovanje of posredovanja) {
    /* Poišči oglase */
    for await (const { id, url } of poisciOglase(posredovanje)) {
      // Shrani oglas v bazo.
      const zaznamek = await client.zaznamek.upsert({
        where: { id },
        // Naredi nov zaznamek v bazi, ki je aktiven.
        create: {
          id,
          url,
          posredovanje,
          aktiven: true,
        },
        // Naredi zaznamek, da je še vedno aktiven.
        update: { aktiven: true },
      })

      // Posodobi stanje
      st_zaznamkov += 1

      // Izpiši stanje
      console.log(`(${st_zaznamkov}) Zaznamek ${zaznamek.id}...`)
    }
  }
}

/* Poženemo program */

if (require.main === module) {
  withPrisma(main)
}
