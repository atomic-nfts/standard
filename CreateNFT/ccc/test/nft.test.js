const smartest = require("@_koi/smartest");
const Arweave = require("arweave");
const fs = require("fs");

if (process.argv[2] === undefined) throw "Wallet path not defined";

async function main() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const wallet = JSON.parse(fs.readFileSync(process.argv[2]));
  const walletAddress = await arweave.wallets.jwkToAddress(wallet);

  // Load nft contract
  const nftSrc = fs.readFileSync(`dist/nft.js`, "utf8");
  const nftContractId = "a1s2d3f4";
  const nftInitState = JSON.parse(fs.readFileSync(`src/koi/init_state.json`));
  smartest.writeContractState(nftContractId, nftInitState);

  // Load valut contract
  const vaultSrc = fs.readFileSync(`dist/valut.js`, "utf8");
  const vaultContractId = "q5w6e7r8";
  const vaultInitState = JSON.parse(
    fs.readFileSync(`src/valut/init_state.json`)
  );
  smartest.writeContractState(vaultContractId, vaultInitState);

  const lock = {
    function: "lock",
    delegatedOwner: "valutAddress",
    qty: 1,
    address: "etherumAddress",
    network: "etherum",
  };
  await smartest.interactWrite(
    arweave,
    nftSrc,
    wallet,
    lock,
    smartest.readContractState(nftContractId),
    walletAddress,
    nftContractId
  );
  const register = {
    function: "register",
    nftId: "nftId",
    UID: "UID",
    nftIdOnOtherNetwork: "etherumAddress",
    network: "etherum",
  };
  await smartest.interactWrite(
    arweave,
    vaultSrc,
    wallet,
    register,
    smartest.readContractState(nftContractId),
    walletAddress,
    nftContractId
  );
  console.log(
    "nft final state: ",
    smartest.readContractState(nftContractId),
    "valut final state:",
    smartest.readContractState(vaultContractId)
  );
}

main().then(() => {
  console.log("Test complete");
});
