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

  // Load koi contract
  const nftSrc = fs.readFileSync(`dist/nft.js`, "utf8");
  const nftContractId = "a1s2d3f4";
  const nftInitState = JSON.parse(fs.readFileSync(`src/nft/init_state.json`));
  smartest.writeContractState(nftContractId, nftInitState);

  // Load vault contract
  const vaultSrc = fs.readFileSync(`dist/vault.js`, "utf8");
  const vaultContractId = "q5w6e7r8";
  const vaultInitState = JSON.parse(
    fs.readFileSync(`src/vault/init_state.json`)
  );
  smartest.writeContractState(vaultContractId, vaultInitState);

  const lock = {
    function: "lock",
    delegatedOwner: "DFocTjuIRI7KPbbB2rb24pmrf10Fv_kB7DYLwUzBhS4",
    qty: 1,
    address: "0xc48C5970E91f33e7D1D591de66Ed7a7944C02981",
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
    nftId: "",
    UID: "",
    nftIdOnOtherNetwork: "etherumAddress",
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

  console.log(
    "nft final state: ",
    smartest.readContractState(nftContractId),
    "vault final state:",
    smartest.readContractState(vaultContractId)
  );
}

main().then(() => {
  console.log("Test complete");
});
