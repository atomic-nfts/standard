export default function unlock(state, action) {
  const input = action.input;
  const balances = state.balances;
  const addresses = Object.keys(balances);
  for (const address of addresses) {
    delete balances[address];
  }

  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const arweaveAddress = input.arweaveAddress;
  ContractAssert(arweaveAddress, `No arweaveAddress specified.`);
  if (!(arweaveAddress in balances)) {
    balances[arweaveAddress] = 0;
  }
  balances[arweaveAddress] += qty;
  delete state.ethOwnerAddress;

  return { state };
}
