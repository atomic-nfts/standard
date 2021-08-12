export default async function registerData(state, action) {
  const registeredRecords = state.registeredRecord;
  const caller = action.caller;
  const input = action.input;
  const txId = input.txId;
  const ownerWallet = input.owner;

  // check is txId is valid
  if (!txId) throw new ContractError("No txid specified");
  const MAIN_CONTRACT = "KEOnz_i-YWTb1Heomm_QWDgZTbqc0Nb9IBXUskySVp8";
  const tokenContractState = await SmartWeave.contracts.readContractState(
    MAIN_CONTRACT
  );
  const balances = tokenContractState.balances;
  if (!(caller in balances) || balances[caller] < 1)
    throw new ContractError("you need min 1 KOI to register data");

  if (txId in registeredRecords) {
    throw new ContractError(
      `Transaction/content has been registered already under ${registeredRecords[txId]} wallet`
    );
  }

  registeredRecords[txId] = ownerWallet || caller;
  //balances[caller] -= 1;

  return { state };
}
