import * as html from 'node-html-parser'
import fetch from 'node-fetch'

import { defined } from './utils'
import { Posredovanje } from '@prisma/client'

/* Nastavitve */

const NASLOV = 'https://www.nepremicnine.net'

/* Funkcije */

export type Zaznamek = { id: string; url: string }

/**
 * Z listanjem poišče oglase, ki so objavljeni na nepremicine.net.
 */
export async function* poisciOglase(
  posredovanje: Posredovanje,
): AsyncGenerator<Zaznamek[], void, unknown> {
  /* Preglej vsako posredovanje. */
  let stran = 0

  while (true) {
    try {
      /* Naloži stran */
      const url = `${NASLOV}/oglasi-${posredovanje.toLowerCase()}/${stran}/`
      const raw = await fetch(url, {}).then((res) => res.text())

      console.log(`${url}...`)

      /* Preberi podatke */
      const root = html.parse(raw, {})
      const oglasi = root.querySelectorAll('div.oglas_container')

      /* Končaj z listanjem. */
      if (oglasi.length === 0) break

      /* Preberi oglase in izlušči uporabne v zaznamke. */
      let zaznamki: Zaznamek[] = []

      for (const oglas of oglasi) {
        const id = oglas.id
        const naslov = oglas
          .querySelector("meta[itemprop='mainEntityOfPage']")
          ?.getAttribute('content')

        if (naslov === undefined) continue

        zaznamki.push({ id, url: naslov })
      }

      yield zaznamki

      stran += 1
      /* Končaj tako, da listaš na naslednjo stran. */
    } catch (err) {
      /* Če pride do napake vrni najdeno in izpiši napako. */
      console.error(err)
      break
    }
  }

  return
}

export type Oglas = {
  // Id
  url: string
  // Informacije
  naslov: string
  kratek_opis: string
  daljsi_opis: string
  slike: string[]

  // Lokacija
  vrsta?: string
  regija?: string
  enota?: string
  obcina?: string

  // Meritve
  velikost?: number
  cena?: number
  st_sob?: number
  leto?: number
}

/**
 * Naloži informacije o posamezni nepremičnini.
 */
export async function naloziOglas(url: string): Promise<Oglas | null> {
  /* Naloži spletno stran. */
  const raw = await fetch(url, {}).then((res) => res.text())

  /* Analiziraj HTML */
  const root = html.parse(raw, {})

  /* Ignoriraj slabe naslove. */
  if (
    root.rawText === null ||
    ['Not Found', 'Oglas ni več aktiven.'].some((p) => root.rawText.includes(p))
  ) {
    return null
  }

  /* Podatki */
  const naslov = root.querySelector('h1.podrobnosti-naslov').innerText

  const kratek_opis = root.querySelector('div.kratek')?.text?.trim()
  const daljsi_opis = root.querySelector('div.web-opis')?.text?.trim()

  const slike: string[] = root
    .querySelectorAll('a.rsImg')
    .map((el) => el.getAttribute('href')?.replace('sIo', 'slo'))
    .filter<string>(defined)

  const informacije = root.querySelector('div.more_info')?.text
  const vrsta = /Vrsta: ([\w\sščž.]+)/.exec(informacije)?.[1]?.trim()
  const regija = /Regija: ([\w\sščž.]+)/.exec(informacije)?.[1]?.trim()
  const enota = /Upravna enota: ([\w\sščž.]+)/.exec(informacije)?.[1]?.trim()
  const obcina = /Občina: ([\w\sščž.]+)/.exec(informacije)?.[1]?.trim()

  const velikostHTML = root.querySelector('span.velikost')?.text
  const rawVelikost = /([\d,.]+)/.exec(velikostHTML)?.[0]
  let velikost: number | undefined
  if (rawVelikost) velikost = parseFloat(rawVelikost)

  const rawCena = root
    .querySelector("meta[itemprop='price']")
    .getAttribute('content')

  let cena: number | undefined
  if (rawCena) cena = parseFloat(rawCena)

  const st_sobRaw = /(\d(?:[,.]5)?)-sobno/.exec(kratek_opis)?.[0]
  let st_sob: number | undefined
  if (st_sobRaw) st_sob = parseFloat(st_sobRaw)

  const leta = /\d{4}/gm.exec(kratek_opis)?.map((leto) => parseInt(leto))
  const leto = Math.max(...(leta || [0]))

  return {
    url: url,
    // Informacije
    naslov: naslov,
    kratek_opis: kratek_opis,
    daljsi_opis: daljsi_opis,
    slike: slike,

    // Lokacija
    vrsta: vrsta,
    regija: regija,
    enota: enota,
    obcina: obcina,

    // Meritve
    velikost: velikost,
    cena: cena,
    st_sob: st_sob,
    leto: leto,
  }
}

/* Debugger */

if (require.main === module) {
  const naslov =
    'https://www.nepremicnine.net/oglasi-prodaja/senturska-gora-planina-jezerca-krvavec-posest_6316983/'
  naloziOglas(naslov)
}
