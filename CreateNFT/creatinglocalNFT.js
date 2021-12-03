const Arweave = require('arweave/node');
const fetch = require('node-fetch');
const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443,
});

async function mintNFT(path) {
await ktools.loadWallet(walletKeyLocation)
    const contractSrc = 'r_ibeOTHJW8McJvivPJjHxjMwkYfAKRjs-LjAeaBcLc';
    const nftData = await getBufferData(path);

    const metadata = {
        owner: '<wallet address>', 
        name: '',
        description: '',
        ticker: ''
    }

    let balances = {};
    balances[metadata.owner] = 1000;
    const initialState = {
        "owner": metadata.owner,
        "name": metadata.name,
        "description": metadata.description,
        "ticker": metadata.ticker,
        "balances": balances,
        "locked":[]
    }

    let tx = await arweave.createTransaction({
        // eslint-disable-next-line no-undef
        data: nftData.data
    }, ktools.wallet);
    tx.addTag('Content-Type', nftData.contentType)
    tx.addTag('Exchange', 'Verto')
    tx.addTag('Action', 'marketplace/Create')
    tx.addTag('App-Name', 'SmartWeaveContract')
    tx.addTag('App-Version', '0.3.0')
    tx.addTag('Contract-Src', contractSrc)
    tx.addTag('Init-State', JSON.stringify(initialState))

    await arweave.transactions.sign(tx, ktools.wallet);
    const result = {};
    result.id = tx.id;
    console.log(tx);
    console.log(tx.id);

    let uploader = await arweave.transactions.getUploader(tx)
    while (!uploader.isComplete) {
        await uploader.uploadChunk()
        console.log(
            uploader.pctComplete + '% complete',
            uploader.uploadedChunks + '/' + uploader.totalChunks
        )
    }
    const status = await arweave.transactions.getStatus(tx.id)
    console.log(`Transaction ${tx.id} status code is ${status.status}`)
    return result;
}

async function getBufferData(path){
console.log('starting....');
const picData = await getBuffer(path);
const mediaType = await FileType.fromBuffer(picData)
console.log(mediaType);
var obj = {};
obj.contentType = mediaType.mime;
    obj.data = picData;
    return obj;
}


async function getBuffer(path){
    return new Promise(async function (resolve, reject) {
        fs.readFile(path, async function(err, data){
        if (err) return reject(err);
        console.log("success reading file");
        console.log(data); 
        resolve(data) 
    });
    });
}

mintNFT()