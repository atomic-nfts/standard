const fs = require("fs");
const Arweave = require("arweave");
const smartweave = require("smartweave");
const eol = require('eol')

var koii = require('@_koi/sdk/common');
require("dotenv").config();
var koi = new koii.Common(process.env.WALLET_LOCATION)
var contractSrc = "Constract ID";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false
});

mintNFT(__dirname + '/pkg/index.html');


async function mintNFT(path) {
    console.log('wallet:', process.env.WALLET_LOCATION)
    await koi.loadWallet(process.env.WALLET_LOCATION);
    const contractSrc = process.argv[2];;
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
    console.log('data type', nftData.contentType)
    var lastBlock = await koi.getBlockHeight();

    const metadata = {
        "owner": "yourown",
        "title": "Narcissus 0.0.1",
        "name": "koii",
        "ticker" : "_koii"
    }

    let balances = {};
    balances[metadata.owner] = 1;
    const initialState = {
        "owner": "yourown",
        "title": "Narcissus 0.0.1",
        "name": "koii",
        "description": "The Koii Narcissus Flower blooms only when given attention. If the flower receives attention, it will earn KOII tokens, which will be deposited into it's Koii Task. The Task rewards anyone who updates the lock state (locking in the latest attention scores) which improves the viewing experience for others by reducing the load time required when the NFT is viewed. The NFT can be viewed as an iframe using any Arweave gateway, and will eventually be expanded to submit it's own Proofs of Real Traffic.",
        "ticker": "koii",
        "balances": {
            "yourown": 1
        },
        "contentType": "text/html",
        "createdAt": "1624057295",
        "decay":{ 
            "minted": lastBlock,
            "lastLock": lastBlock,
            "lockState" : "65",
            "lastMax" : "0"
        },
        "tags": []
    }
    let tx = await arweave.createTransaction({
            // eslint-disable-next-line no-undef
            data: Buffer.from(nftData)
        }, koi.wallet);
        tx.addTag('Content-Type', 'text/html')
        tx.addTag('Exchange', '')
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

    var burnAmount = 5; // the amount of koi to burn on registration (burn more to earn more!)
    var registration = await koi.registerData(tx.id, initialState.owner)

    const status = await arweave.transactions.getStatus(tx.id)
    console.log(`Transaction ${tx.id} status code is ${status.status}`)
    console.log('registered to koii under ', registration)

    return result;
}