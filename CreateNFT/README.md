# Deploy the template and your Atomic NFTs

There's two easy steps to deploy your Atomic NFTs, check this out:

#### Note: If you do not want to change any contract, please directly deploy your NFT.

### Deploy your own contract

To deploy your own contract, check the contracts-example directory and follow the steps.

### Deploy the Atomic NFTs

Let's deploy the Atomic NFT:

First run `yarn` to install the node packages.

```
yarn
```

### Option 1: Deploy a NFY by using image url

Check the `creatingNewNFT.js` file. Change the info to your own:

(If you deployed your own contract, remember to change the contract ID:)

```
contractSrc => [contract ID]

```

Change you image src at line 22:

```
let imageOBJ = await getDataBlob(
    '<image url>' // paste your image url here
  );
```

Change the wallet address, wallet path and NFT url etc.(line 24 - line 44)

After the info is finished, deploy it:

```

node creatingNewNFT.js

```

### Option 2: Deploy a NFT by using local file

Check the `creatingNFTLocal.js` file. Change the info to your own:

(If you deployed your own contract, remember to change the contract ID:)

```
contractSrc => [contract ID]

```

Change to your wallet location: (line 14)

```
WALLET_KEY_LOCATION="<Your wallet path>>"
```

Change your image src at line 15:

```
const path = "<Your NFT local path>";
```

Change the owner, name and describtion etc.(line 22 - line 25)

After the info is finished, deploy it:

```

node creatingNFTLocal.js

```

### Check Your NFT

You're all done! You can go to `https://arweave.net/tx/<NFT id>/status` to check your contract status. If the status is `Pending` then that means your NFT is successfully deployed and arweave is working on it.

Just a few minutes you could search your txID on [https://viewblock.io/arweave](https://viewblock.io/arweave). Then in the block page, Click `Link` button and it will show your NFT.
