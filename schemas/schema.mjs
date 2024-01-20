// import { gql } from "apollo-server-express";

// export const typeDefs = gql`
// type User {
//   id: ID!
//   firstname: String!
//   email: String!
//   films: [Film]
// }

// type Film {
//   id : ID!
//   title : String!
//   director_id : Int!
//   director: User
// }

// type Query {
//   users: [User],
//   films: [Film]
// }
// `;

// export default typeDefs;










import { gql } from "apollo-server-express";
export const typeDefs = gql`
    type User {
        username: String!
        fullname: String!
        age : Int!
        email : String!
        created_at : String!
        authored: [Tweet]
        follows: [User]
    }

    type Tweet {
        author : User
        tweetText: String
        tweeted_at : String!
        tagged_with: [Hashtag]
        mentioned: [User]
    }

    type Hashtag {
        hashtagText: String
        instigated_at : String!
    }

    type Query {
        getUser(username: String!): User
        getTweet(id: ID!): Tweet
        getHashtag(hashtagText: String!): Hashtag
        getUsers: [User]
        getTweets: [Tweet]
        getHashtags: [Hashtag]
    }

    type Mutation {
        createUser(username: String!, fullname: String!, age : Int!, email : String!): User
        createTweet(tweetText: String!, username: String!): Tweet
        followUser(username: String!, followUsername: String!): User
    }
    `;
    