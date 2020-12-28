import { PrismaClient } from '@prisma/client'

import { withPrisma } from '../prisma'
import { naloziOglas } from '../scarpper'

/* Configuration */

/* Program */

async function main(client: PrismaClient) {
  // Naloži informacije o oglasih.
  const zaznamki = await client.zaznamek.findMany({
    where: {
      aktiven: true,
      posredovanje: {
        in: ['ODDAJA', 'PRODAJA'],
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
    include: {
      oglasi: {
        orderBy: { created_at: 'desc' },
      },
    },
  })

  const st_zaznamkov = zaznamki.length

  console.log(`Našel ${st_zaznamkov} aktivnih zaznamkov...`)

  for (const [index, zaznamek] of zaznamki.entries()) {
    const oglas = await naloziOglas(zaznamek.url)

    if (oglas === null) continue

    // Poglej že obstoječ oglas in primerjaj podatke.

    if (zaznamek && zaznamek.oglasi.length > 0) {
      const zadnji_oglas = zaznamek.oglasi[0]

      // Če se cena od zadnjega oglasa ni spremenila ne naredi novega zaznamka.
      if (oglas.cena === zadnji_oglas.cena) {
        console.log(`(${index}/${st_zaznamkov}) Nespremenjen ${zaznamek.id}`)
        continue
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

    console.log(`(${index}/${st_zaznamkov}) Oglas ${db.zaznamek_id}...`)
  }
}

/* Poženemo program */

if (require.main === module) {
  withPrisma(main)
}
