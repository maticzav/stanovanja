import { PrismaClient } from '@prisma/client'

import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { makeSchema } from 'nexus'

import * as path from 'path'

import * as types from './graphql'

/* Schema */

export const schema = makeSchema({
  types: types,
  nonNullDefaults: {
    output: true,
  },
  /* Code Generation */
  sourceTypes: {
    modules: [{ module: '.prisma/client', alias: 'PrismaClient' }],
  },
  contextType: {
    module: path.join(__dirname, '../src/context.ts'),
    export: 'Context',
  },
  outputs: {
    typegen: path.join(
      __dirname,
      '../node_modules/@types/nexus-typegen/index.d.ts',
    ),
    schema: path.join(__dirname, './schema.graphql'),
  },
})

/* Start */

if (require.main === module) {
  /* Data Sources */

  const prisma = new PrismaClient()

  /* Server */

  const apollo = new ApolloServer({
    schema,
    context: () => ({ prisma }),
  })

  /* HTTP */
  const port = parseInt(process.env.PORT || '4000')

  const app = express()

  apollo.applyMiddleware({ app })

  app.listen(port, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`)
  })
}
