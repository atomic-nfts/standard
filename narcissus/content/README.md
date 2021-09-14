# Content

This is where the iframe gets built (this will be the NFT).

The react project can be managed with:
`yarn start` -> run a local dev server
`yarn build` -> build production ready web-pack
`yarn arweave:pack` -> build production ready web-pack

The NFT can be tested inside of an iframe by running a local webserver. To do so, install one with `yarn add global http-server`.

Then, once you have the react local server running, you can run `yarn run testIframe` to deploy a local test in your browser on (http://localhost:8080/testIframe.html)[http://localhost:8080/testIframe.html].

Before you deploy:

1. Go to .env file, change the wallet location path to your wallet.json file.
2. Go to `blastoff.js`:
   Chanege the `KOII_CONTRACT` to the Contract ID
   Change the `contractSrc` to the Contract-Src ID (You could find it on viewblock)
   Change the `metadata` (Such as owner to your wallet address)
   Change the `initialState`

Then, the project can be deployed to a new NFT by running
`yarn deploy`

The console will show the NFT id and waiting for the confirmation.

Note: This will cost some AR and some KOI, so you'll want to visit the faucet on https://koi.rocks/faucet/ and get the Finnie Wallet from https://koii.network/getFinnie to manage your keys!
