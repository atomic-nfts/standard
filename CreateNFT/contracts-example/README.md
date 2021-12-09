## Deploy Contract

### Deploy the Template Contract (Optional)

First, enter the `contracts/` directory:

```
cd contracts-example/

```

Second, create .env file, make sure the path is your arweavewallet.json

```
WALLET_LOCATION = path/to/your/wallet
```

Third, in /src/nft/init_state.json file, edit this to your info.

Last step, in `index.js`. Check the function and customize teh function you want.

You're all set, now let's deploy the template contracts:

```
yarn deploy nft
```

This will return a contract ID, which you'll need to deploy NFT.
