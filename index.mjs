import { ApolloServer } from 'apollo-server'
import { typeDefs } from './schemas/schema.mjs'
import { resolvers } from './resolvers/resolvers.mjs'

const API_PORT = 4000
const server = new ApolloServer({
    typeDefs,
    resolvers
})
server.listen({ port: API_PORT || 4000 }).then(({ url }) => {
    console.log(`Server is ready at ` + `${url}`)
}).catch(error => {
    console.log(error)
})

