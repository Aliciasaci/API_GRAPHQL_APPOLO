// import pool from '../database/db.mjs';

// const getFilmsByDirectorId = async (directorId) => {
//     try {
//         const result = await pool.query('SELECT * FROM "films" WHERE director_id = $1', [directorId]);
//         return result.rows;
//     } catch (error) {
//         console.error('Error querying films by director ID:', error);
//         throw error;
//     }
// };

// const getUserById = async (userId) => {
//     try {
//         const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [userId]);
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error querying user by ID:', error);
//         throw error;
//     }
// };

// export const resolvers = {
//     Query: {
//         users: async () => {
//             try {
//                 const result = await pool.query('SELECT * FROM "users"');
//                 return result.rows;
//             } catch (error) {
//                 console.error('Error querying users:', error);
//                 throw error;
//             }
//         },
//         films: async () => {
//             try {
//                 const result = await pool.query('SELECT * FROM "films"');
//                 return result.rows;
//             } catch (error) {
//                 console.error('Error querying films:', error);
//                 throw error;
//             }
//         },
//     },
//     User: {
//         films: (user) => getFilmsByDirectorId(user.id),
//     },
//     Film: {
//         director: (film) => getUserById(film.director_id),
//     },
// };







import {fetchUsers, fetchUser, addUser, followUser} from '../utils/user.mjs';
import {fetchTweets, fetchTweet, addTweet} from '../utils/tweet.mjs';
import {fetchHashtags,fetchHashtag} from '../utils/hashtag.mjs';
import {dgraphTransaction} from '../utils/dgraph.mjs';


import dgraph from 'dgraph-js-http';

const clientStub = new dgraph.DgraphClientStub("http://alpha:8080");
const dgraphClient = new dgraph.DgraphClient(clientStub);


const schema = `
    type User {
        username: string
        fullname: string
        age : int 
        email : string 
        created_at : string
        authored: [uid]
        follows: [uid]
    }

    type Tweet {
        author : uid
        tweetText: string
        tweeted_at : string
        tagged_with: [uid]
        mentioned: [uid]
    }

    type Hashtag {
        hashtagText: string
        instigated_at : string
    }

    username: string @index(exact) @upsert .
    fullname: string .
    age : string . 
    email : string .
    created_at : string .
    authored: [uid] @reverse .
    follows: [uid] @reverse .
    tweetText: string .
    author : uid @reverse .
    tweeted_at : string .
    tagged_with: [uid] @reverse .
    mentioned: [uid] @reverse .
    hashtagText: string @index(exact) @upsert .
    instigated_at : string .
`;

dgraphClient.alter({ schema: schema })
    .then(()=> {
        console.log("Schema updated successfully")
    })
    .catch((err) =>{
        console.log(`Error while updating the schema : ${err} `)
    });

export const resolvers = {
    Query: {
       
        getUsers: async () => {
            return dgraphTransaction(async txn => {
                const result = await fetchUsers(txn);
                console.log("result(users) : ", result)
                return result;
            });
        },
        getUser: async (_, { username }) => {
            return dgraphTransaction(async (txn) => {
                const result = await fetchUser(txn, username);
                return result;
            });
        },
        getTweet: async (_, { id }) => {
            console.log(`searching the tweet with the id : ${id}`);
            return dgraphTransaction(async (txn) => {
                const result = await fetchTweet(txn,id);
                return result;
            });
        },
        getTweets: async () => {
            return dgraphTransaction(async txn => {
                const result = await fetchTweets(txn);
                console.log("result(tweets) : ", result)
                return result;
            });
        },
        getHashtag: async (_,{hashtagText}) => {
            return dgraphTransaction(async (txn) => {
                const result = await fetchHashtag(txn, hashtagText);
                return result;
            });
        },
        getHashtags: async () => {
            return dgraphTransaction(async txn => {
                const result = await fetchHashtags(txn);
                console.log("result(hashtags) : ", result)
                return result;
            });
        },
    },
    Mutation: {
        createUser: async (_ , args) => {
            return dgraphTransaction(async () => {
                const result = await addUser(args);
                return result;
            });
        },

        createTweet: async (_, { tweetText, username }) => {
            
            return dgraphTransaction(async () => {
                const result = await addTweet(tweetText, username);
                return result;
            });
        },
        
        followUser: async (_, { username, followUsername }) => {
            return dgraphTransaction(async () => {
                const result = await followUser(username, followUsername);
                return result;
            });
        }  

    }
};

export default  resolvers;
