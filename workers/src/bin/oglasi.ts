import { PrismaClient } from '@prisma/client'

import { withPrisma } from '../prisma'
import { naloziOglas } from '../scarpper'
import { sum } from '../utils'

/* Configuration */

const chunk_size = 30

/**
 * Med izvajanjem računamo še povprečen čas za shranjevanje podatkov.
 */
let benchmarks: number[] = []

/* Program */

async function main(client: PrismaClient) {
  let page = 0

  /**
   * Listaj po straneh dokler so še oglasi.
   */

  while (true) {
    // Benchmark
    const start = Date.now()

    // Naloži informacije o oglasih.
    const zaznamki = await client.zaznamek.findMany({
      // Filter
      where: {
        aktiven: true,
        posredovanje: {
          in: ['ODDAJA', 'PRODAJA'],
        },
      },
      // Pagination
      orderBy: { id: 'asc' },
      take: chunk_size,
      skip: page * chunk_size,
      // Selection
      include: {
        oglasi: {
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (zaznamki.length === 0) break

    /**
     * Najdi oglase in si zabeleži spremembe.
     */

    await Promise.all(
      zaznamki.map(async (zaznamek) => {
        // Naloži oglas.
        const oglas = await naloziOglas(zaznamek.url)

        if (oglas === null) return

        // Poglej že obstoječ oglas in primerjaj podatke.
        if (zaznamek && zaznamek.oglasi.length > 0) {
          const zadnji_oglas = zaznamek.oglasi[0]

          // Če se cena od zadnjega oglasa ni spremenila ne naredi novega zaznamka.
          if (oglas.cena === zadnji_oglas.cena) {
            console.log(`Nespremenjen ${zaznamek.id}`)
            return
          }
        }

        // Izračunaj meritve
        let cena_na_m2: number | undefined
        if (oglas.velikost && oglas.cena) {
          cena_na_m2 = oglas.cena / oglas.velikost
        }

        // Shrani oglas v bazo.
        const db = await client.oglas.create({
          data: {
            //   Podatki
            zaznamek: { connect: { db_id: zaznamek.db_id } },
            // Informacije
            naslov: oglas.naslov,
            kratek_opis: oglas.kratek_opis,
            dolg_opis: oglas.daljsi_opis,
            slike: { set: oglas.slike },
            // Lokacija
            vrsta: oglas.vrsta,
            regija: oglas.regija,
            upravna_enota: oglas.enota,
            obcina: oglas.obcina,
            // Meritve
            velikost: oglas.velikost,
            cena: oglas.cena,
            leto: oglas.leto,
            st_sob: oglas.st_sob,
            // Analiza
            cena_na_m2: cena_na_m2,
          },
        })

        console.log(`Oglas ${db.zaznamek_id}...`)
      }),
    )

    // Benchmark taske.
    const end = Date.now()
    const delta = (end - start) / chunk_size
    benchmarks.push(delta)

    // Logs

    const chg = Math.floor(delta)
    const avg = Math.floor(sum(benchmarks) / benchmarks.length)

    console.log(`page(${page}): ${chg}/${avg} ms`)

    // Paginate
    page += 1
  }
}

/* Poženemo program */

if (require.main === module) {
  withPrisma(main)
}
