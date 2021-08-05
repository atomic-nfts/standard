# Project Narcissus
The Koii Narcissus Flower blooms only when given attention.

If the flower receives attention, it will earn KOII tokens, which will be deposited into it's Koii Task.

The Task rewards anyone who updates the lock state (locking in the latest attention scores) which improves the viewing experience for others by reducing the load time required when the NFT is viewed.

The NFT can be viewed as an iframe using any Arweave gateway, and will eventually be expanded to submit it's own Proofs of Real Traffic. 

## Deployment
Deploying an Atomic NFT happens in two parts, which might seem odd, since it's only one NFT. Here's how it works:

### 1. Deploy the Contract
To deploy this NFT, first deploy the smart contract by entering the `contracts/` directory:
```
cd contracts/
yarn deploy
```
This will return a contract ID, which you'll need in the next step.

### 2. Deploy the Art
To deploy the content iframe, you must specify the address of the contract deployed in Step (1).

The content can then be built to an iframe and deployed to Arweave as an NFT by calling the commands below from within the `content/` directory.
```
cd content/
yarn
yarn build
yarn arweave:pack
yarn deploy
```

The final command will output a txId on Arweave, which will be the address of the new NFT.
