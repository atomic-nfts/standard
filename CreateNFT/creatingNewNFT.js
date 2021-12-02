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
    'https://i0.hdslb.com/bfs/album/94731fefec0d6b1b9f0ab17bb97f66466d7e3886.png'
  );
  const initialState = {
    "title": "avatar test soma",
    "name": "Soma's avatar",
    "description": "avatar testing",
    "ticker": "KOINFT",
    "balances": {
      "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0": 1
    },
    "owners": {
      "1": "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0"
    },
    "maxSupply": 5,
    "locked": [],
    "contentType": "image/png",
    "createdAt": "1624057295",
    "tags": [
      "avatar"
    ]
  }
  let tx;
  let wallet = JSON.parse(fs.readFileSync("/Users/dongyue/atomic-nft/arweaveWallet.json","utf-8"));
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
  tx.addTag('Action', 'marketplace/Create');
  tx.addTag('App-Name', 'SmartWeaveContract');
  tx.addTag('App-Version', '0.3.0');
  tx.addTag('Contract-Src', 'l_n7gXxwzY3pgOZSu7RPOO27JDKApY9VKIgmQOoO09U');
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
