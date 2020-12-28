import { ApolloServer } from '@saeris/apollo-server-vercel'
import { schema } from '../src/'

const server = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
})

export default server.createHandler()
