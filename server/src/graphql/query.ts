import { intArg, queryType } from 'nexus'

import { Stanovanje } from '../context'

export const queryObject = queryType({
  definition(t) {
    t.string('hello', {
      resolve: () => 'world',
    })

    /* Iskalnik */
    t.list.field('stanovanja', {
      type: 'Stanovanje',
      args: {
        page: intArg(),
      },
      resolve: async (root, { page }, ctx) => {
        const oglasi = await ctx.prisma.oglas.findMany({
          // Pagnation
          skip: (page || 0) * 50,
          take: 50,

          where: {
            // Filter
            zaznamek: {
              aktiven: true,
              posredovanje: 'PRODAJA',
            },
            // Nullability
            st_sob: { not: null },
            velikost: { not: null },
            cena: { not: null },
          },
          orderBy: {
            created_at: 'desc',
          },
        })

        const stanovanja: Stanovanje[] = oglasi.map(
          (oglas: any) => oglas as Stanovanje,
        )

        return stanovanja
      },
    })
  },
})
