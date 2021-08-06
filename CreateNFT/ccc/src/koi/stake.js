export default function stake(state, action) {
  const balances = state.balances;
  const stakes = state.stakes;
  const caller = action.caller;
  const input = action.input;
  const qty = input.qty;

  if (!Number.isInteger(qty))
    throw new ContractError('Invalid value for "qty". Must be an integer');
  if (qty <= 0) throw new ContractError("Invalid stake amount");
  if (balances[caller] < qty) {
    throw new ContractError(
      "Balance is too low to stake that amount of tokens"
    );
  }

  balances[caller] -= qty;
  // stake for 14 days which 10080 blocks
  state.stakeReleaseBlock[caller] = SmartWeave.block.height + 10080;
  if (stakes[caller]) stakes[caller] += qty;
  else stakes[caller] = qty;

  return { state };
}
