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
async function main() {
  let imageOBJ = await getDataBlob(
    'https://prd-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/styles/full_width/public/thumbnails/image/Placeholder_person.png'
  );
  const initialState = {
    "owner": "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0",
    "title": "Soma Test NFT",
    "name": "SomaTest",
    "description": "Soma is testing",
    "ticker": "KOINFT",
    "balances": {
      "oDApIgwavkt2Ks2egnIF27iMMLMaVY41raK2l07ONp0": 1
    },
    "locked": [],
    "contentType": "image/jpeg",
    "createdAt": "1624057295",
    "tags":[]
  };
  let tx;
  let wallet = {"kty":"RSA","e":"AQAB","n":"qrLm8_MInRngunr9LbEfCuKO-L_PoZvQD7Jw4uxxfOswOwdDJnFj7U-NpyuQpDnD1Ui2YLoXxoJqupT9UKd4qqAkB5qbDkjKKUtDoSTXJty_PskYQNjVcu9SROryruYt8IoRSOp3ePlSjaJ1m-5ugb2aU7iK0-MmeyLUMt3WSKvL-erQvaRuSgL9qUTjW4eZeUFnpJIjJp9_8Ma337Yc1ktBsAtFpu9vuNYedvLIDTAg2QIcH0SKGHpGRYOQnynplbjvvobzmpr9CONadReF9Uc5ab2CK8MEjAwBSIPvGBhA2f4X3-Rb2moIfo-eySLsIOgzpnPyo3IsfuN0lVv7BKY0R8G40NMxzNuhdCtpo11XOjsyu9u1tVSzZMEtjf0funOgdZk1ZiLkgHTLH4b0yiT22Azt1qwJFR7cQaBBv_IDCwxTUCI6C94p6b2ghhDEIc6VQI8PbZhXXAvuv2laPap97H-D-qhXSu9R8TcAWn0Wocrjw_TLN2NTdjbPZdmGWWWl6TwTRcjU4WR_usr9YAr-y5v5PcVHPr1MFsIEaiENTKORI9f9GJ07-FHzwJSbSEoxl3bmell0CfbeaMVR4gnuT6jkOYlCSrNUQVYKMjzivp4Y75BVHg-ely2k_iV-VBAwYYa3LNgW0BgBspJu2R321CWTthQRCzJyLFkkm9s","d":"H3ZlIj6_7jD4XnbP1o2ogpmar5evHgL5mQMTUogxLMyusZqXkmzg9bstiUv614I8KcJCt1ZljnW4VVaj0CtmDtEAgxRIkxvwgyb3uqpvK58RcvGe0kkFIq-g0soZXApaGlVgdTeeOMJ_qFJy6gBLBwfa-6ZulDpwe87CHPQNjIx5xsE0o1e86lBdz8a-Pz8hlxtqjodPCk3ox4jhGE9ZRlhNrbSOLIRCa-evas45-FBQJZ-BbnP0HinfbO2giO2xO6MAMXZvTSZXED3TjPR-gOSVXPuMlCNYYbXOwL5sodzKi0ONw_szwPC9SxKOulUA_9m8t2f0p5KiR-sFsIfpHrdR3vSawW9Ek2z7Z5_KrwDyn8rXThfr7ygSyhN8lE65caheD81tFnyn214a2bNcgiG1NpK471b31t3BLtFndTQgDJ1LpDkSWOoyoi3NHX5nN0fnK0vgEL27_1CKlLTO-07rZiUZvJwdLcanPuh7s8HJUTyhFaAquG_C8YT-GHKuUCxwRa8sylgnTEnDB8yBC2b-46QaP9jZWYGupN3oMhbWKuYlZZqPq5Yr7URntLsCidFWZR1_hV2egcslf6Gi1s6S6qevCbY3MgXWBl3bRw8VWjvcjF03WTE7tqB3FCVZssBxQcLIiwf5pGP1PeK57VHysFG96pqkeVe_4YYjirE","p":"5rzTkRwseovDiVJ0l7fxDUEI4gyscaHtq0bIP6g4tZjgQXQ0_pBjoU1_pn4UOuGlF8Dq1e9o0BW2jxMlVocEiFNE2m132gorMh5LcuanEu257hX5WxRRoWV94F3aeUC72f52rbxi7wcaRNhAdnueeBVt9Hi9bBmti51mZxIMUz9siqrH4ezFMMO1yr649BsHDEOUn1zKCZU2k8dp1o_QKZK8FTPG1NeuaFHYGyRQKtXYSTJQStoNnT_2BSfZMtC-i9jMiYgnInDiV9ayukjTCMpBaC4zI9liTLTwhyGUxgMOiwldI7VN3H2RWc5GAo3GdubGML-iPpxPMn_LJdSSEQ","q":"vWNLJnopBi0S22t6uZHpVmZD4ddMTrS9E2aRdWUqp2tg0UYtpbLyLAFpkDYuWzvgsHEfhIG_87mvjGd-jBQh1iWMgB2SPtQvy36ijZVhlP3c9Gtqh92NoGX-VGLDO53ddGu6bnuRtU_wKH-nqn8n1r0sNZFIsWXVybHRNXwGFQQ5Orifz71qsTsMfPTi3X001BW_gwTe51v7JifvJYXU1FMpekczaVUozwTG-WeERuc2TFViyelqur5qpt01-e_qUNqETqMSBn-DW0RU9J_2iNka3Duqw7LF_u7eDjon6NYSDNRRaV6NOFgvhjpAYtO1sURU8YyTZ0W1I57PZzvjKw","dp":"P_GAaCx4nxVwgPPa39jX8qZdQdflSjBn3xlkkU-bN6hALaN4tDtrgN4rTAaQsKiryeNqsRMB5vi9ePUDWfFc7jK1WBsSJdi_k8oVeqg1EOfUqQhp7DW7UZEAy1b3Hrcz1_vPA-K7QCalvwJ3Ct7DUeAOcrurMvQCxjg-kr3LsJ5ZBCzD6_Zjx1nVXXRxaSS8VUe9PlTGoNU7JMUUraN5Oqwxd2a76WxEJyDXVN5BYT2WDOLmoXfAYh3Bnjgm1xBGXhccx9h1j_Pcph8XtMxNv5fdfHOhNIQf28YhCjHiOuXJ9_oGV8j85OffihXCDR8hKv5VWlkhK1zCDeqgb8FzIQ","dq":"eAQDbKe_dZ18tLXguNZhcxItdGHWho38v92g0i9BH4VpflUlujqzQvXGKtBbAg_o7IdTfMoolVAXkjdHt4dOhgGXjtyuf8hBXYirhGOkyiEyM2YaxWy-QmZADMPlitMYsp1OMJN4G9lDjLaQzvfzjB6ndG7UDS9GkqFvvaARzqG1jqPPCnuzsAqGeG1Lkya0Iq6BhYrBowXkGyL1Zubvn3nv8ABM8TQ5Py981DIoXjJJc4gsqV2U-DCRL5tBiFjkOUawz5CBbMLDwEOGPttcBQ7n-aaKKagR1uMSrxtljSSTnbOyv75eadVgkIQ7pyUYn_R4i_YUtz4ycxdBwd7urw","qi":"fH6ZxKgbck9TERIqeYcpKs2O7YGB-XK1uxzE8ODPVVQKqcY6NKw8n_h_WKX03lUJhcF10v2ZOlAxNnYjhA8y8-bE04DWwU-vNnXl7R_o-GEKmbUH44NCLeXMIV4OsTaOOAWd9PPrnvbvUCjQDxfVhf8QlvEJikV1YwdHn-LHWvv5jfd8VmCEriI-7LjGFpd5_Deku5cORV5lR0x7bUKMUurxr7LJ4Zf_r80wrgEowqKjiZngTzooZnheD_1ZU5hngFzoSXLyMRjp1aFI2-M5zL22drq4doJBOcFS3cfK07ri9Twy_G0vFuo_Q3MM-lEoN3VUn6DPIRi52yNR5QeOqA"};
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
  tx.addTag('App-Version', '0.3.0');
  tx.addTag('Contract-Src', 'I8xgq3361qpR8_DvqcGpkCYAUTMktyAgvkm6kGhJzEQ');
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
    console.log('TX', tx);
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
