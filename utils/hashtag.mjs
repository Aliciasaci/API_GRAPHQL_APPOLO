import dgraph from 'dgraph-js-http';
const clientStub = new dgraph.DgraphClientStub("http://alpha:8080");
const dgraphClient = new dgraph.DgraphClient(clientStub);



export async function getHashtagByHashtagText(hashtagText) {
    const txn = dgraphClient.newTxn();

    try {
        const query = `
        query getHashtag($htagText: string) {
            hashtags(func: eq(hashtagText, $htagText)) {
                uid
                hashtagText
            }
        }
        `;
        const vars = { $htagText: hashtagText };
        const response = await txn.queryWithVars(query, vars);
        // console.log("hashtag found :", response.data.hashtags);
        return response.data.hashtags.length > 0 ? response.data.hashtags[0] : null;
    } catch (error) {
        console.error('Error feteching hashtag :', error);
        throw new Error('Error fetching hashtag');
    }
    finally{
        await txn.discard();
    }
    
}


export async function fetchHashtags(txn){

    const query = `query {
                    hashtags(func: has(hashtagText)) {
                        uid
                        hashtagText
                        instigated_at
                    }
                }`;
    const response = await txn.query(query);
    console.log("hashtags : ", response.data.hashtags);
    return response.data.hashtags;
}


export async function fetchHashtag(txn, hashtagText){
    console.log("argument hashtagText :", hashtagText);
    const query = `query hashtag($text : string) {
                    hashtag(func: eq(hashtagText, $text)) {
                        uid
                        hashtagText
                        instigated_at
                    }
                }`;
    const vars = { $text: hashtagText };
    const response = await txn.queryWithVars(query, vars);
    console.log("hashtaggg : ", response.data.hashtag[0]);
    return response.data.hashtag.length > 0 ? response.data.hashtag[0] : null ;
}
