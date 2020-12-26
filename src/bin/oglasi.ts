import { PrismaClient } from '@prisma/client'

import { naloziOglas } from '../scarpper'

/* Configuration */

const client = new PrismaClient({})

/* Program */

async function main() {
  // Naloži informacije o oglasih.
  const zaznamki = await client.zaznamek.findMany({})

  for (const zaznamek of zaznamki) {
    const oglas = await naloziOglas(zaznamek.url)

    if (oglas === null) continue

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
      },
    })

    console.log(`Oglas ${db.id}...`)
  }
}

/* Poženemo program */

if (require.main === module) {
  main()
}
