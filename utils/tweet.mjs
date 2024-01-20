import dgraph from 'dgraph-js-http';



const clientStub = new dgraph.DgraphClientStub("http://alpha:8080");
const dgraphClient = new dgraph.DgraphClient(clientStub);


import {getUserByUsername} from './user.mjs';
import {extractBySymbol} from './extractor.mjs';
import {getHashtagByHashtagText} from './hashtag.mjs';

export async function fetchTweets(txn){

    const query = `query {
        tweets(func: has(tweetText)) {
            uid
            tweetText
            tweeted_at
            tagged_with {
                hashtagText
                instigated_at
            }
            author {
                username
                fullname
            }
        }
    }`;

    const response = await txn.query(query);
    console.log(response.data.tweets);
    return response.data.tweets;

}


export async function fetchTweet(txn,id){

    const query = `
                query getTweet($id: string) {
                    getTweet(func: uid($id)) {
                        uid
                        tweetText
                        tweeted_at
                        author {
                            uid
                            username
                            fullname
                        }
                    }
                }
            `;
            console.log("id : ", id);
            const vars = { $id: id };
            // const txn = dgraphClient.newTxn();
            const response = await txn.queryWithVars(query, vars);
            const tweetData = response.data.getTweet.length > 0 ? response.data.getTweet[0] : null;
            return tweetData;

}



export async function addTweet(tweetText, username){
    
        

    // Récupération de l'UID de l'utilisateur à partir du username
    const user = await getUserByUsername(username);
    if (!user) {
        throw new Error("User not found.");
    }
    
    const hashtags = extractBySymbol(tweetText, "#");
    const mentions = extractBySymbol(tweetText, "@");
    
    console.log("hashtags : ", hashtags);
    console.log("mentions : ", mentions);


    const hashtagMutations = await Promise.all(hashtags.map(async (hashtag,index) => {
        const existingHashtag = await getHashtagByHashtagText(hashtag);
        
        if (existingHashtag) {
            return { uid: existingHashtag.uid };
        } else {
            return {
                uid: '_:newHashtag'+index,
                "dgraph.type": "Hashtag",
                hashtagText: hashtag,
                instigated_at : new Date().toISOString()
            };
        }
    }));

    const usersMentioned = await Promise.all(mentions.map(async mention => {
        return await getUserByUsername(mention);
    }));
    console.log("users mentionned  :" , usersMentioned);
    const txn = dgraphClient.newTxn();
    
    const tweeted_at = new Date().toISOString();
    const tweetMutation = {
        uid: '_:newTweet',
        "dgraph.type": "Tweet",
        tweetText: tweetText,
        tweeted_at : new Date().toISOString(),
        author: { uid: user.uid, username: user.username},
        tagged_with: hashtagMutations,
        mentioned: usersMentioned.map(user =>  ({
            uid: '_:newMention', 
            "dgraph.type": "User",
        }))
    };

    
    const userMutation = {
        uid: user.uid,
        authored: [{ uid: '_:newTweet' }]
    };
    
    const mutation = {
        commitNow: true,
        setJson: [tweetMutation, userMutation]
    };

    await txn.mutate(mutation);

    return { tweetText, author: user , tagged_with: hashtagMutations, tweeted_at, mentioned: usersMentioned };
          
}