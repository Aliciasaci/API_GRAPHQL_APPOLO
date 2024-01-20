import dgraph from 'dgraph-js-http';
const clientStub = new dgraph.DgraphClientStub("http://alpha:8080");
const dgraphClient = new dgraph.DgraphClient(clientStub);

export async function getUserByUsername(username) {
    const txn = dgraphClient.newTxn();
    try {
        const query = `
        query getUser($uname: string) {
            users(func: eq(username, $uname)) {
                uid
                username
                email
                age
                fullname
                created_at
                follows {
                    username
                }
            }
        }
        `;
        const vars = { $uname: username };
        const response = await txn.queryWithVars(query, vars);

     
        return response.data.users[0];
    }
    catch {
        console.error('Error feteching user :', error);
        throw new Error('Error fetching user');
    }
    finally{
        await txn.discard();
    }
    
}


export async function fetchUsers(txn){
    const query = `query {
        users(func: has(username)) {
            uid
            email
            age
            fullname
            username
            created_at
            follows {
                username
                fullname
            }
            authored {
                tweetText
                tweeted_at
                mentioned {
                    username
                }
            }
        }
    }`;
    const response = await txn.query(query);
    //console.log("usersss : ",response.data.users);
    return response.data.users;
}


export async function fetchUser(txn,username)
{
    console.log("searching user with username : ", username);
            const query = `
                query getUser($uname: string) {
                    getUser(func: eq(username, $uname)) {
                        uid
                        username
                        fullname
                        email
                        age
                        created_at
                        authored {
                            uid
                            tweetText
                            tweeted_at
                        }
                    }
                }
            `;
    const vars = { $uname: username };

    const response = await txn.queryWithVars(query, vars);
    console.log("response :" , response.data);
    const userData = response.data.getUser.length > 0 ? response.data.getUser[0] : null;
    return userData;

}


async function userExists(username){
    console.log("username: ", username);
    const txn = dgraphClient.newTxn();

    try {
        const query = `query getUser($uname: string) {
            users(func: eq(username, $uname)) {
                count(uid)
            }
        }`;
        const vars = { $uname: username };
        const queryResponse = await txn.queryWithVars(query, vars);

        // Vérifier si le nombre d'utilisateurs trouvés est supérieur à 0
        const exists = queryResponse.data.users.length > 0 && queryResponse.data.users[0].count > 0;
        console.log("User found: ", exists);
        console.log("count : ", queryResponse.data.users[0].count);
        console.log("user : ", queryResponse.data.users[0]);

        return exists;
    } catch (error) {
        console.error("Error checking user existence: ", error);
        throw error;
    } finally {
        await txn.discard();
    }
}


export async function addUser(args){

    const txn = dgraphClient.newTxn();
    
    try {
        const exists = await userExists(args.username);
        if (exists) {
            throw new Error('User with that username already exists');
        }

        
        const newUser = {
            uid: '_:newUser',
            fullname: args.fullname,
            username: args.username,
            email: args.email,
            age: args.age,
            created_at: new Date().toISOString()
        };
        const mutation = {
            commitNow: true,
            setJson: newUser,
        };
        await txn.mutate(mutation);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    } finally {
        await txn.discard();
    }
}


export async function followUser(username, followUsername){

    console.log(`user ${username} want to follow ${followUsername}`);
    
   
        
    const currentUser = await getUserByUsername(username);
    console.log("current user : ", currentUser);
    
    const userToFollow = await getUserByUsername(followUsername)
    console.log("user to follow", userToFollow);

    if (!currentUser || !userToFollow) {
        throw new Error("User(s) not found.");
    }

    if(currentUser.follows)
    {
        const alreadyFollowing = currentUser.follows.some(u => u.username === followUsername);
        console.log("already follo");
        if (alreadyFollowing) {
            throw new Error("Already following this user.");
        }
    }

    const txn = dgraphClient.newTxn();
   

    // Création de la mutation pour suivre l'utilisateur
    const mutation = {
        commitNow: true,
        setJson: {
            uid: currentUser.uid,
            follows: userToFollow
        }
    };

    await txn.mutate(mutation);
    console.log("current user :", currentUser);
    return currentUser; 
}