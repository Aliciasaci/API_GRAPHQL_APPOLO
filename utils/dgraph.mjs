import dgraph from 'dgraph-js-http';

const clientStub = new dgraph.DgraphClientStub("http://alpha:8080");
const dgraphClient = new dgraph.DgraphClient(clientStub);

export async function dgraphTransaction(process) {
    const txn = dgraphClient.newTxn();
    try {
        const result = await process(txn);
        await txn.commit();
        return result;
    } catch (error) {
        console.error('Dgraph transaction error:', error);
        throw error;
    } finally {
        await txn.discard();
    }
}