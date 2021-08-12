# Atomic NFTs 
The official docs portal can be found on [atomicnft.com](https://atomicnft.com/).

An Atomic NFT uses Arweave Transaction Meta Data to generate a Smart Contract and store a media file in a single transaction. 

This unique standard makes a new type of NFT that is:
 - Eco-friendly (contracts are lazily executed, and proof of work is used minimally)
 - Contracts and media are intertwined and cannot be separated
 - Media and contract data use a common locator
 - Proofs of Real traffic provide attention rewards via Koii
 - Can be bridged to any blockchain network

# Contributing
Contribute to atomic-nfts and make it better, here's the tutorial to make a good, clean pull request.

## How to make a clean pull request
- Create a personal fork of the project on Github.
- Clone the fork on your local machine. Your remote repo on Github is called `origin`.
- Add the original repository as a remote called `upstream`.
- If you created your fork a while ago be sure to pull upstream changes into your local repository.
- Create a new branch to work on! Branch from `develop` if it exists, else from `master`.
- Implement/fix your feature, comment your code.
- If the project has tests run them!
- Write or adapt tests as needed.
- Add or change the documentation as needed.
- Push your branch to your fork on Github, the remote `origin`.
- From your fork open a pull request in the correct branch. Target the project's `develop` branch if there is one, else go for `master`!
- Once the pull request is approved and merged you can pull the changes from `upstream` to your local repo and delete
your extra branch(es).

And last but not least: Always write your commit messages in the present tense. Your commit message should describe what the commit, when applied, does to the code – not what you did to the code.

# General Structure
The standard contract for Atomic NFTs can be found here: `I8xgq3361qpR8_DvqcGpkCYAUTMktyAgvkm6kGhJzEQ`

## The State Object
The standard NFT has this common structure: 
```
{
  "owner": "ay1uavTv9SVRKVIrUhH8178ON_zjAsZo2tcm5wiC4bI",
  "title": "Missing piece",
  "name": "Kirthivasan",
  "description": "nothing makes a room emptier than wanting someone in it.\nspread love",
  "ticker": "KOINFT",
  "balances": {
    "ay1uavTv9SVRKVIrUhH8178ON_zjAsZo2tcm5wiC4bI": 1
  },
  "contentType": "image/jpeg",
  "createdAt": "1626023631"
}
```

## Contract Source
A standard contract might look like this:
```
export function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  if (input.function === "transfer") {
    const target = input.target;
    ContractAssert(target, `No target specified.`);
    ContractAssert(caller !== target, `Invalid token transfer.`);
    const qty = input.qty;
    ContractAssert(qty, `No quantity specified.`);
    const balances = state.balances;
    ContractAssert(caller in balances && balances[caller] >= qty, `Caller has insufficient funds`);
    balances[caller] -= qty;
    if (!(target in balances)) {
      balances[target] = 0;
    }
    balances[target] += qty;
    state.balances = balances;
    return {state};
  }
  if (input.function === "balance") {
    let target;
    if (input.target) {
      target = input.target;
    } else {
      target = caller;
    }
    const ticker = state.ticker;
    const balances = state.balances;
    ContractAssert(typeof target === "string", `Must specify target to retrieve balance for.`);
    return {
      result: {
        target,
        ticker,
        balance: target in balances ? balances[target] : 0
      }
    };
  }
  throw new ContractError(`No function supplied or function not recognised: "${input.function}".`);
}
```

## Bridging and Locking

The 'Lock' and 'Unlock' methods contain function for delegating ownership of an NFT when bridging to another chain. 

#### Lock

The section below shows an example of a possible lock function:

```bash
export default function lock(state, action) {
  const input = action.input;
  const caller = action.caller;
  const delegatedOwner = input.delegatedOwner;
  ContractAssert(delegatedOwner, `No target specified.`);
  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const balances = state.balances;
  ContractAssert(
    caller in balances && balances[caller] >= qty,
    `Caller has insufficient funds`
  );
  balances[caller] -= qty;
  if (!(delegatedOwner in balances)) {
    balances[delegatedOwner] = 0;
  }
  balances[delegatedOwner] += qty;

  const ethOwnerAddress = input.ethOwnerAddress;
  ContractAssert(ethOwnerAddress, `No ethereum address specified.`);
  state.ethOwnerAddress = ethOwnerAddress;
  return { state };
}
```

#### Unlock

The 'Unlock' method handles removing an NFT from custodianship.

The section below shows an example of a possible unlock function:

```bash
export default function unlock(state, action) {
  const input = action.input;
  const balances = state.balances;
  const addresses = Object.keys(balances);
  for (const address of addresses) {
    delete balances[address];
  }

  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const arweaveAddress = input.arweaveAddress;
  ContractAssert(arweaveAddress, `No arweaveAddress specified.`);
  if (!(arweaveAddress in balances)) {
    balances[arweaveAddress] = 0;
  }
  balances[arweaveAddress] += qty;
  delete state.ethOwnerAddress;

  return { state };
}

```

For more information about bridge compatibility, contact developers@koii.network.
