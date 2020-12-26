import { PrismaClient } from '@prisma/client'

import { naloziOglas } from '../scarpper'

/* Configuration */

const client = new PrismaClient({})

/* Program */

async function main() {
  // Naloži informacije o oglasih.
  const zaznamki = await client.zaznamek.findMany({})

  for (const { url, id, db_id } of zaznamki) {
    const oglas = await naloziOglas(url)

    if (oglas === null) continue

    // Poglej že obstoječ oglas in primerjaj podatke.
    const zaznamek = await client.zaznamek.findUnique({
      where: { db_id: db_id },
      include: {
        oglasi: {
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (zaznamek && zaznamek.oglasi.length > 0) {
      const zadnji_oglas = zaznamek.oglasi[0]

      // Če se cena od zadnjega oglasa ni spremenila ne naredi novega zaznamka.
      if (oglas.cena === zadnji_oglas.cena) {
        console.log(`Nespremenjen ${id}`)
        continue
      }
    }

    // Shrani oglas v bazo.
    const db = await client.oglas.create({
      data: {
        //   Podatki
        zaznamek: { connect: { db_id: db_id } },
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

    console.log(`Oglas ${db.zaznamek_id}...`)
  }
}

/* Poženemo program */

if (require.main === module) {
  main()
}
