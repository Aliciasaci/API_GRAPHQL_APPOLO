import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schemas/schema.mjs';
import { resolvers } from './resolvers/resolvers.mjs';

const API_PORT = 8081;
const server = new ApolloServer({
    typeDefs,
    resolvers
});
server.listen({ port: API_PORT || 8081 }).then(({ url }) => {
    console.log(`Server is ready at ` + `${url}`);
}).catch(error => {
    console.log(error);
})