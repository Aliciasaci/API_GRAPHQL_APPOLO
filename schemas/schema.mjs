import { gql } from "apollo-server-express";

export const typeDefs = gql`
type User {
  id: ID!
  firstname: String!
  email: String!
}

type Query {
  users: [User]
}
`;