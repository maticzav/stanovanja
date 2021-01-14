import { Posredovanje, PrismaClient } from '@prisma/client'

import { withPrisma } from '../prisma'
import { poisciOglase } from '../scarpper'
import { sum } from '../utils'

/* Configuration */

const posredovanja: Posredovanje[] = ['NAJEM', 'NAKUP', 'PRODAJA', 'ODDAJA']

/**
 * Med izvajanjem računamo še povprečen čas za shranjevanje podatkov.
 */
let benchmarks: number[] = []

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
    /**
     * Poiši oglase in si jih shrani v bazo.
     * Za hitrejše delovanje dobi funkcija skupek oglasov, ne enega po enega.
     */
    for await (const zaznamki of poisciOglase(posredovanje)) {
      // Benchmark
      const start = Date.now()

      /**
       * Vsak zaznamek spremenimo v task in nato vse hkrati poženemo.
       */
      const tasks = await Promise.all(
        zaznamki.map(async ({ id, url }) => {
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
          console.log(`(${st_zaznamkov}) zaznamkov ${zaznamek.id}`)
        }),
      )

      // Benchmark taske.
      const end = Date.now()
      const delta = end - start

      benchmarks.push(delta)

      console.log(`avg: ${Math.floor(sum(benchmarks) / benchmarks.length)} ms`)
    }
  }
}

/* Poženemo program */

if (require.main === module) {
  withPrisma(main)
}
