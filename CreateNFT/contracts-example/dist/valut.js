'use strict';
async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  const owner = state.owner;
  if (input.function === "register") {
    if (owner !== caller) {
      throw new ContractError("Only the owner can register");
    }
    const nftId = input.nftId;
    const UID = input.UID;
    if (!nftId) throw new ContractError("nftId is undefined");
    if (!UID) throw new ContractError("UID is undefined");
    const contractState = await SmartWeave.contracts.readContractState(nftId);
    if (contractState && contractState.locked && contractState.locked.length) {
      let lockedObj = contractState.locked.find((e) => e.UID == UID);
      ContractAssert(
        lockedObj.vaultAddress == caller,
        `Caller must be the vault in the locked NFT`
      );
      const nftIdOnOtherNetwork = input.nftIdOnOtherNetwork;
      if (!nftIdOnOtherNetwork)
        throw new ContractError("nftIdOnOtherNetwork is undefined");
      const network = input.network;
      if (!network) throw new ContractError("network is undefined");
      let registry = state.registry;
      if (!registry) registry = [];
      registry.push({
        arweaveNFTId: nftId,
        otherNetworkNFTId: nftIdOnOtherNetwork,
        network: network,
        UID: UID,
        amount: lockedObj.amount,
      });
      state.registry = registry;
    } else {
      throw new ContractError("No Locked NFT found");
    }
    return { state };
  }
  if (input.function === "deregister") {
    if (owner !== caller) {
      throw new ContractError("Only the owner can deregister");
    }
    const UID = input.UID;
    if (!UID) throw new ContractError("UID is undefined");
    const nftId = input.nftId;
    if (!nftId) throw new ContractError("nftId is undefined");
    const contractState = await SmartWeave.contracts.readContractState(nftId);
    if (contractState && contractState.locked && contractState.locked.length) {
      let lockedObj = contractState.locked.find((e) => e.UID == UID);
      ContractAssert(
        lockedObj.vaultAddress == caller,
        `Caller must be the vault in the locked NFT`
      );
      let registry = state.registry;
      if (!registry) registry = [];
      let index = registry.findIndex((e) => e.UID == UID);
      ContractAssert(index >= 0, `UID not found`);
      registry.splice(index, 1);
      state.registry = registry;
    } else {
      throw new ContractError("No Locked NFT found");
    }
    return { state };
  }
  throw new ContractError(
    `No function supplied or function not recognized: "${input.function}".`
  );
}
