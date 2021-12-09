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

Third, in `/src/nft/init_state.json` file, edit it to your own info.

- Notice: owner and balance should be your wallet address.

Last step, in `index.js`. Check the function and customize teh function you want.

You're all set, now let's deploy the template contracts:

1: `yarn`

2: `yarn deploy nft`

This will return a contract ID, which you'll need to deploy NFT.

If you get the error, please try

- delete `node_modules` and run `yarn` again
- create and check your wallet path in `.env` file
- run `yarn build` to see if there was a problem.

You can also go to `https://arweave.net/tx/<contract id>/status` to check your contract status.
