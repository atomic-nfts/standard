export default function lock(state, action) {
  const input = action.input;
  const caller = action.caller;
  const delegatedOwner = input.delegatedOwner;
  ContractAssert(delegatedOwner, `No target specified.`);
  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const balances = state.balances;
  ContractAssert(
    caller in balances && balances[caller] >= qty,
    `Caller has insufficient funds`
  );
  balances[caller] -= qty;
  if (!(delegatedOwner in balances)) {
    balances[delegatedOwner] = 0;
  }
  balances[delegatedOwner] += qty;

  const ethOwnerAddress = input.ethOwnerAddress;
  ContractAssert(ethOwnerAddress, `No ethereum address specified.`);
  state.ethOwnerAddress = ethOwnerAddress;
  return { state };
}
