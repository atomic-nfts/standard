const fs = require("fs");
require("dotenv").config();
const Arweave = require("arweave");
const smartweave = require("smartweave");
const {
  createContractExecutionEnvironment,
} = require("smartweave/lib/contract-load");

const walletPath = process.env.WALLET_LOCATION;
if (!walletPath) throw new Error("WALLET_LOCATION not specified in .env");

async function main() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  });

  const wallet = JSON.parse(fs.readFileSync(walletPath));
  const walletAddress = await arweave.wallets.jwkToAddress(wallet);
  const contractSrc = fs.readFileSync(`dist/attention.js`, "utf8");
  let state = JSON.parse(fs.readFileSync(`src/attention/init_state.json`));
  console.log(state);
  state = (
    await interactDryRun(
      arweave,
      contractSrc,
      wallet,
      transferInput,
      state,
      walletAddress
    )
  ).state;
  console.log(state);
}

/**
 * Does a dry run of an interaction with a local contract state and source
 * @param {Arweave} arweave     Arweave client instance
 * @param {string} contractSrc  Contract source code
 * @param {JWKInterface} wallet Wallet used to sign the transaction
 * @param {any} input           Interaction input object
 * @param {any} state           Contract state to be interacted
 * @param {string} from         Source address of the interaction
 * @returns {Promise<ContractInteractionResult>} Result of the interaction
 */
async function interactDryRun(
  arweave,
  contractSrc,
  wallet,
  input,
  state,
  from
) {
  const contract_info = createContractExecutionEnvironment(
    arweave,
    contractSrc
  );
  return await smartweave.interactWriteDryRun(
    arweave,
    wallet,
    undefined,
    input,
    undefined,
    undefined,
    undefined,
    state,
    from,
    contract_info
  );
}

main().then();
