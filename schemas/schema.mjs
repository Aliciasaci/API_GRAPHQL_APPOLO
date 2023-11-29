import { gql } from "apollo-server-express";

export const typeDefs = gql`
type User {
  id: ID!
  firstname: String!
  email: String!
  films: [Film]
}

type Film {
  id : ID!
  title : String!
  director_id : Int!
  director: User
}

type Query {
  users: [User],
  films: [Film]
}
`;