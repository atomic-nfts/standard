const fs = require("fs");
const Arweave = require("arweave");
let koii = require('@_koi/sdk/common');
require("dotenv").config();
let koi = new koii.Common(process.env.WALLET_LOCATION)
let contractSrc = "< Contract transaction id Here >";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false
});

mintNFT();

async function getNetworkBlockHeight() {
  const network = await arweave.network.getInfo()
  return network.height
}

async function mintNFT() {
    console.log('wallet:', process.env.WALLET_LOCATION)
    await koi.loadWallet(process.env.WALLET_LOCATION);
    let readStream = fs.createReadStream('./pkg/index.html');
    let fileBuffer;
    let chunks = [];

    readStream.once('error', (err) => {
        // console.error(err); 
    });

    readStream.once('end', () => {
        fileBuffer = Buffer.concat(chunks);
        handleData(fileBuffer)
    });
    
    readStream.on('data', (chunk) => {
        chunks.push(chunk); 
    });
}

async function handleData (nftData) {
    console.log('Uploading the HTML NFT located at ./pkg/index.html')
    const initialState = {
        "owner": "<Wallet Address>",
        "title": "Narcissus 0.0.1",
        "name": "Koii",
        "description": "The Koii Narcissus Flower blooms only when given attention. If the flower receives attention, it will earn KOII tokens, which will be deposited into it's Koii Task. The Task rewards anyone who updates the lock state (locking in the latest attention scores) which improves the viewing experience for others by reducing the load time required when the NFT is viewed. The NFT can be viewed as an iframe using any Arweave gateway, and will eventually be expanded to submit it's own Proofs of Real Traffic.",
        "ticker": "KOINFT",
        "balances": {
            "<Wallet Address>": 1
        },
        "locked": [],
        "contentType": "text/html",
        "createdAtHeight": await getNetworkBlockHeight(),
        "tags":[]
    }
    let tx = await arweave.createTransaction({
            // eslint-disable-next-line no-undef
            data: Buffer.from(nftData)
        }, koi.wallet);
        tx.addTag('Content-Type', 'text/html')
        tx.addTag('Network', 'Koi')
        tx.addTag('Action', 'marketplace/Create')
        tx.addTag('App-Name', 'SmartWeaveContract')
        tx.addTag('App-Version', '0.3.0')
        tx.addTag('Contract-Src', contractSrc)
        tx.addTag('Init-State', JSON.stringify(initialState))

    await arweave.transactions.sign(tx, koi.wallet);
    
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

    let registration = await koi.registerData(tx.id, initialState.owner)

    const status = await arweave.transactions.getStatus(tx.id)
    console.log(`Transaction ${tx.id} status code is ${status.status}`)
    console.log('registered to koii under ', registration)

    return result;
}
