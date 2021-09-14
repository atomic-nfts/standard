# Contracts

## Before the deployment

1. Go to .env file
2. Change the path locate to your Finnie wallet.json file.
3. Go to src/decaying_nft
4. Remenber to change the `init_state.json` tags
5. ```
   owner: your Finnie wallet address
   balances: your Finnie wallet address (the default balance is 1)
   ethOwnerAddress: your ETH wallet address
   ```
   You can also change other tags as you want.

## Deployment

`yarn`
`yarn deploy [contract]`

Examples:

- `yarn deploy koi`
- `yarn deploy attention`

## Testing

1. Ensure docker is running
2. Follow install instructions for [TestWeave Docker](https://github.com/ArweaveTeam/testweave-docker)
3. Follow install instructions for [TestWeave SDK](https://github.com/ArweaveTeam/testweave-sdk)

## After Deployment

Now you deploy your contract, the console will show tht Contract ID, here's what you should do:

1. Copy your Contract ID
2. Paste it to [viewblock.io](https://viewblock.io/)
3. Once you can see the result, you could check your Contract ID (This process takes about 15 minutes)
4. Now let's deploy the NFT.
