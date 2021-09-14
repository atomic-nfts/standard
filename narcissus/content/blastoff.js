const koiSdk = require("@_koi/sdk/node");
const fs = require("fs");
const Arweave = require("arweave");
const smartweave = require("smartweave");
const KOII_CONTRACT = "13v4C8OEFw2uX3QlR2eSV2eH4Bc0BWuhDjgcFaGVEg0";
const ATTENTION_CONTRACT = "CdPAQNONoR83Shj3CbI_9seC-LqgI1oLaRJhSwP90-o"
var contractSrc = "XpmqD_iaO0mt_IKvVIc7Jg8DX-qDoHpsupI25EmbkAc";

require("dotenv").config();

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https"
  });
  // reRegister()

const tools = new koiSdk.Node(
    "none",
    KOII_CONTRACT
);
var koi = tools;

// const nftToRegister = "-oOWDbhxOlrojzHmIPkuEWOUS61uDex4p1172pO3NdE"

async function main() {
    await tools.loadWallet(await tools.loadFile(process.env.WALLET_LOCATION));
    console.log("Wallet loaded");

    console.log("Deploying NFT");
    const deployedTxId = await deployNFT()
    await checkTxConfirmation(deployedTxId);

    console.log("Burning Koii");
    const burnTxId = await tools.burnKoi(
        ATTENTION_CONTRACT,
        "nft",
        deployedTxId
    );
    await checkTxConfirmation(burnTxId);

    console.log("Migrating content");
    const migrateTxId = await tools.migrate(
        ATTENTION_CONTRACT
    );
    await checkTxConfirmation(migrateTxId);
}

async function checkTxConfirmation(txId) {
    console.log(`TxId: ${txId}\nWaiting for confirmation for ${ txId }`);
    const start = Date.now();
    for (;;) {
        try {
            await tools.getTransaction(txId);
            console.log(`Transaction found`);
            return true;
        } catch (e) {
            if (e.type === "TX_FAILED") {
                console.error(e.type, "While checking tx confirmation");
                return false;
            }
        }
        console.log(Math.round((Date.now() - start) / 60000) + "m waiting");
        await sleepAsync(60000); // Wait 1m before checks to not get rate limited
    }
}

async function sleepAsync(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function deployNFT () {
    let path = __dirname + '/pkg/proxy.html';
    console.log('wallet:', process.env.WALLET_LOCATION)
    let G_WALLET=fs.readFileSync(process.env.WALLET_LOCATION,'utf-8')
    G_WALLET=JSON.parse(G_WALLET)
    console.log("WALLET",G_WALLET)
    // await koi.loadWallet(data);
    var nftData =await getBufferData(__dirname + '/pkg/index.html')
    
    var lastBlock = await koi.getBlockHeight();

    const metadata = {
        "owner": "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0",
        "title": "Narcissus 0.1.1",
        "name": "koii",
        "ticker" : "_koii"
    }

    let balances = {};
    balances[metadata.owner] = 1;
    const initialState = {
        "owner": "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0",
        "title": "Narcissus 0.1.1",
        "name": "koii",
        "description": "The Koii Narcissus Flower blooms only when given attention. Share with a friend to see it open.",
        "ticker": "koii",
        "balances": {
            "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0": 1
        },
        "contentType": "text/html",
        "createdAt": Math.round(Date.now() / 1000),
        "tags": []
    }
    let tx = await arweave.createTransaction({
            data: nftData.data
        }, G_WALLET);
        // reward: "5000000000000"
            // target: "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0",
        tx.addTag('Content-Type', 'text/html')
        tx.addTag('Exchange', 'Verto')
        tx.addTag('Action', 'marketplace/Create')
        tx.addTag('App-Name', 'SmartWeaveContract')
        tx.addTag('App-Version', '0.3.0')
        tx.addTag('Contract-Src', contractSrc)
        tx.addTag('Init-State', JSON.stringify(initialState))
        let newReward = Math.floor(+tx.reward * 1).toString();
        console.log(tx.reward, 'setting new reward', newReward)
        tx.reward = newReward;
        // tx.quantity = "32";

        console.log('tx is about to send', tx)

    await arweave.transactions.sign(tx, G_WALLET);
    
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

    // const response = await arweave.transactions.post(tx);
    // console.log('post', response)
    // registration is now done separately
    // var burnAmount = 5; // the amount of koi to burn on registration (burn more to earn more!)
    // var registration = await koi.registerData(tx.id, initialState.owner)git

    const status = await arweave.transactions.getStatus(tx.id)
    console.log(`Created NFT successfully with ID ${tx.id}`, status)
    // console.log('Registered to koii with txId ', registration)

    return tx.id;
}

// async function reRegister () {
//     console.log('wallet:', process.env.WALLET_LOCATION);
//     await koi.loadWallet(process.env.WALLET_LOCATION);

//     var registration = await koi.registerData("bEL9NuhPDNdqAX5ghwcqbzPFQVgURwfovEFGTWwXiqs", "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0")
//     console.log(registration)
// }
async function getBufferData(path) {
    console.log('starting....');
    const picData = await getBuffer(path);
    var obj = {};
    obj.data = picData;
    return obj;
  }
  
async function getBuffer(path) {
return new Promise(async function(resolve, reject) {
    fs.readFile(path, async function(err, data) {
    if (err) return reject(err);
    console.log('success reading file');
    console.log(data);
    resolve(data);
    });
});
}

main();
