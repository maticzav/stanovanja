import { objectType } from 'nexus'

export const stanovanje = objectType({
  name: 'Stanovanje',
  definition(t) {
    t.id('id')

    // Informacije
    t.string('naslov')
    t.nullable.string('kratek_opis')
    t.nullable.string('dolg_opis')
    t.list.string('slike')
    t.nullable.string('vrsta')

    // Lokacija
    t.nullable.string('regija')
    t.nullable.string('upravna_enota')
    t.nullable.string('obcina')

    // Meritve
    t.float('velikost')
    t.float('cena')
    t.nullable.int('leto')
    t.float('st_sob')
  },
})
