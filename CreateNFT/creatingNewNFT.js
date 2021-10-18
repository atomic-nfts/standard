const Arweave = require('arweave/node');
const fetch = require('node-fetch');
const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443,
});
async function getDataBlob(imageUrl) {
  var res = await fetch(imageUrl);
  var blob = await res.blob();
  var obj = {};
  obj.contentType = blob.type;

  var buffer = await blob.arrayBuffer();
  obj.data = buffer;

  return obj;
}
const fs=require("fs")
async function main() {
  let imageOBJ = await getDataBlob(
    'https://lh3.googleusercontent.com/Rjc-MeXrgBs_fdVHsQsYE7z9rrm4Kx7_SQYLArf56b0AulGT0QLP2kmHqcfN4aBcfANn8mlGGxLmLsX9tie76gPKMVusbGIXUO9SY3E=w600'
  );
  const initialState = {
    "owner": "<Your wallet address>",
    "title": "<title>",
    "name": "Test",
    "description": "testing",
    "ticker": "KOINFT",
    "balances": {
      "<Your wallet address>": 1
    },
    "locked": [
    ],
    "contentType": "image/jpeg",
    "createdAt": "1624057295",
    "tags":[]
  };
  let tx;
  let wallet = JSON.parse(fs.readFileSync("<Your wallet path here>","utf-8"));
  try {
    tx = await arweave.createTransaction(
      {
        data: imageOBJ.data,
      },
      wallet
    );
  } catch (err) {
    console.log('create transaction error');
    console.log('err-transaction', err);
    return false;
  }

  tx.addTag('Content-Type', imageOBJ.contentType);
  tx.addTag('Network', 'Koii');
  tx.addTag('Action', 'KID/Create');
  tx.addTag('App-Name', 'SmartWeaveContract');
  tx.addTag('App-Version', '0.1.0');
  tx.addTag('Contract-Src', 'r_ibeOTHJW8McJvivPJjHxjMwkYfAKRjs-LjAeaBcLc');
  tx.addTag('Init-State', JSON.stringify(initialState));
  try {
    await arweave.transactions.sign(tx, wallet);
  } catch (err) {
    console.log('transaction sign error');
    console.log('err-sign', err);
    return false;
  }
  try {
    // console.log(" wallet : ", wallet);
    console.log('TX', tx.id);
    let uploader = await arweave.transactions.getUploader(tx);
    console.log('uploder', uploader);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(uploader.pctComplete + '% complete', uploader.uploadedChunks + '/' + uploader.totalChunks);
    }
  } catch (err) {
    console.log('err-last', err);
    return false;
  }
}
main();
