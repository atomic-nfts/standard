const fs = require("fs");
require("dotenv").config();
const Arweave = require("arweave");
const smartweave = require("smartweave");
const {
  createContractExecutionEnvironment
} = require("smartweave/lib/contract-load");

const walletPath = process.env.WALLET_LOCATION;
if (!walletPath) throw new Error("WALLET_LOCATION not specified in .env");

async function main() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false
  });

  const wallet = JSON.parse(fs.readFileSync(walletPath));
  const walletAddress = await arweave.wallets.jwkToAddress(wallet);
  const contractSrc = fs.readFileSync(`dist/attention.js`, "utf8");
  let state = JSON.parse(fs.readFileSync(`src/attention/init_state.json`));
  const receipt = {
    vote: {
      vote: { function: "vote", voteId: 0, userVote: "true" },
      senderAddress: "fWjYZQ2SAP7OPTv6_OiI2AtKilORFQ0MdjbmDJ2biHk",
      signature:
        "GdSD3mpuY-9-QEnPfX9c_O3ryg7K91fNyt41Mn6JQJrIIkLZkGeFOxu4ww8zr-Eqqa5OLj6rPchIZP-bZ4ga5l_p-64F0XQoKf2ty8A8TKHw1mKBirWJoq5RjYCvhL7TyhvPMQIpDes3aoJKOmnzDQG7BTJgy6VuI9vkByYlZPZ-GkEN8Obp0021j8V2O-k7LwdBrUGLn21Dg_4n9igjNEYhBlIxjAj72sJleAN8FhmD-RBuL9HqJlSi7AZ1Cdbns6VuaM6EqWyUJQeArrpZ0Q44zZAnZMag3jcXPjSxjFikBfz08XmFBzi1e5rGsOj8HMJQ0XlX2vmGgdgfnaUOeHj_LDpyZs1ZydVPtDtZpXzNCHZtEhyLqzrqJZ4nCY86T94_vO8Nq7V6He1glw5akCcwxOftvQ7vgI9jDPhS5qgYurMaytkVVwRiaP3xBNjejPTMuSwT88Xci7M7ace9BLzD_aybXdFio4UbPDZPw1nilPDEX-eZVVMClfbc3_YtC-BYB2oPZ8UmrtvYsEFI77IJHeyAyMjkjGogcogSm-qWQVWCByM0Mn1s4SB8X8wblIiKm6SOQB6kNHUtMU8sZEvwqNKRnvdMWioY4USPNHY3NDLNxvDYN3DcYDI8Ipa3OwEd6L_GbRGWl7MtpoR5y-1-sSMVrqSoA_D-Xe5clRA",
      owner:
        "pW8YntHYu7FeshpKaQYHu8H9GMBVj0FDs4GocFB36g4KYZAoP_rH23nC1zoBZYTmgBdrfC4OeTH-NlVvM18ZY-1bA_h2PaEXkh6A_7GAhaGNhvbaaWd8tLQA_1mH55kWoTtlaAuHLJG-piWzs80v1PCNwMTWaTxFwJvvtm9z3_AXZz6K8T8aXsrSJtL-NRr5glbWXeK2gID2QDTpMybdgLM6K2nuAET74maxuAbZmvexz2AQRAtXUJmnrGObEhTctwmCnL65on0hSp84w6wW-t7WXLAMDd8kuh6Z_tunYfvspqdoDW8207FF_tRZ9YN4PRNBBcjbSYl_G6qUELxYB3221enGobpSJBrFamfJH6NavYnXhVpK4CnpJ2-ZiHUs8T0exmr2AjhhdWqOObNcftHK5DhWcZu3nPdRI-xmim8h0gc7XctyI5czgfDNE5GOLoVM5G9-A4oL6GMgZxW3cKLnzUkUbWy50LrEBNdUR_9-yKmzVN-VrUT3x1XUeq5TAL663sM09CnY4DSJg2me-jP4FQayhMFXPlcVerstRY4ET1iRaADD8XaXF9KaytFhSh1VGz7vFZtS4OU6gsLbfFj5JstjFA6Iuhwf_YJDpyaX207Sv8cRLMYzDDyAFQsHciWOpH2gQbySaUCpsYvfBshZpeYtnvirGHMgcZyoIOs"
    },
    blockHeight: 711846,
    signature:
      "QAMb2ulXaRg6-a2YMGWf3Rke-4oRcjmoziadhspT1wGdiL8NZzh__ujPL9eE7GlsyLCI5xSA_5xEswnRfCfsaDy3oaL0h-vFUJOrecH2cFkDck_407c1ycCGx4jwH8D1De1W2sQNNfmoFk0StGxmTBvwniwfYRxNKhVPmzQh81lv1p2ijfXJVzcFdosCkCetyL6y_pCo2jpH6p4NLwUHMGXBlv3olR4pOSUwin2tIp2jgrC8a8O9_gJwfBJySCyhIf_XJL1B22CLE0noc1-kAWbyP0GtEzRFvwb4iSKD3XVMGM24GQ1RqmMrc6Smr_272KJRhrjJSRYyu6g6PKUG5HobpPVw7zXJmyaUpGGg3IzQhnp-uRJc1xQN4uvh5LqEfK1pDJzkR_rE8gJ3kWnaCInrjqyfau7caOmh2ORXR9pff4r5GWIu-kDwK0HQrQtiGoK6mjOfHd8xsjDyIN8KBPfTazzqA5r0J6mj4025TagaeEOL18rDs09pGifvz1TfqAq1fckFeleFKCubppA0UVZlczNFvxPPE5bca3CzzvuWJhOqF2AyejT9kp9SkeJwNH7AuydmRAXiYvrLIRaY-NH0jUZy61kSf3YLONK_M0PhDIzX_tXl_aqvIZPZ5R75yj6ygNU-nJcMdegQtkwA-Y4XKkkjPkO5lH9nWXRodEw",
    owner:
      "vIK4B2ecI1DKLaUFpYohyIE9NPGk4sxjznHiB06f9SRg3BB_VqPG6rLkOf3OkEmsMsldSXR6njTGqUmsKfPb6iNOpfJ5PgFicG1eLjMYS2eafy2apcBjdBu5gcfh7mAh15wsu464p8TUfNlT65_1KMRNooTcoLnJbOgFiMWNhWa1JPljLW-AM7H_I4pdqlWNBtcnDdQGyv05jbXzLCy2iyZOry_G6AqRCHVaXotYFuUGOJxcZrdTwoYa2zE48AswAUHdl2GHT1sWuBQQsJTSjtqT4LwWXgVMB3DXK7YmpNUsHZVumJ18vgQDyeT9A0ABBk8Nz1qYorm4fadkNgvzgJAM7wHAGS4WiDEPZB-Lb5lNQRGTUwMaABes0ppb_b_WKodzklagZ5Wl-v4NUd94O9g3mcBfqjVijjTHmuWMimPUsrrbao-xXpQdst3WRhcb2oh0Bpaab-q5DVSnHzOyZlaFYOu6jqum6QA5Uob-AQ5C-sPWpo3RRAsSprZxJqR5hFdLyrXl5BAQYgHFrSGFyqLcSIL1MsCDCYYAKhSrkR0x6VZ1lA8vmmWMWyDFjwjmQWtUGGYPi4OEvBdgvwJIgXcChvnJCiXJVA4nQVWNg2lf-hFm4IcfIjfZI57w3saJzfsCVWxgnrv7ejejffEh4SkJxHQZVadlRVgbSU9rjcU",
    accepted: true
  };
  const transferInput = {
    function: "proposeSlash",
    receipt: receipt
  };
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
