# Deploy the template and your Atomic NFTs

There's two easy steps to deploy your Atomic NFTs, check this out:

### 1. Deploy the Template Contract

First, enter the `CreateNft/ccc` directory:

```
cd CreateNft/ccc

```

Second, check the .env file, make sure the path is your arweavewallet.json

```
WALLET_LOCATION = path/to/your/wallet
```

Third, in /src/nft/init_state.json file, edit this to your info.

You're all set, now let's deploy the template contracts:

```
yarn deploy [contract]
```

Examples:

- `yarn deploy nft`
- `yarn deploy vault`

This will return a contract ID, which you'll need in the next step.

### 2. Deploy the Atomic NFTs

Now let's deploy the Atomic NFT:

Check the creatingNewNFT.js file. Change the info to your own:

Remember to change the contract ID:

```
contractSrc => [contract ID]

```

After the info is finished, deploy it:

```
node creatingNewNFT.js
```

You're all done, Just a few minutes you could search your txID on [https://viewblock.io/arweave](https://viewblock.io/arweave)
