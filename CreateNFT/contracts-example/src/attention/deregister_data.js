export default function deregisterData(state, action) {
  const registeredRecords = state.registeredRecord;
  const caller = action.caller;
  const input = action.input;
  const txId = input.txId;

  // check is txId is valid
  if (!txId) throw new ContractError("No txid specified");
  if (!(txId in registeredRecords))
    throw new ContractError("Transaction/content is not registered");
  if (caller !== state.owner)
    throw new ContractError("You can not Delete a Content");

  delete registeredRecords[txId];

  return { state };
}
