# Atomic NFTs 
The official docs portal can be found on [atomicnft.com](https://atomicnft.com/).

An Atomic NFT uses Arweave Transaction Meta Data to generate a Smart Contract and store a media file in a single transaction. 

This unique standard makes a new type of NFT that is:
 - Eco-friendly (contracts are lazily executed, and proof of work is used minimally)
 - Contracts and media are intertwined and cannot be separated
 - Media and contract data use a common locator
 - Proofs of Real traffic provide attention rewards via Koii
 - Can be bridged to any blockchain network

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
To make your NFTs able to be transfered across Koii bridges 
```
< @abel please insert code here >
```


## ???