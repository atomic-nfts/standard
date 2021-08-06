export default function transfer(state, action) {
  const balances = state.balances;
  const caller = action.caller;
  const input = action.input;
  const target = input.target;
  const qty = input.qty;

  console.log(action);

  if (!target) throw new ContractError("No target specified");
  if (!Number.isInteger(qty))
    throw new ContractError('Invalid value for "qty". Must be an integer');
  if (qty <= 0 || caller === target)
    throw new ContractError("Invalid token transfer");
  if (balances[caller] < qty) {
    throw new ContractError(
      `Caller balance not high enough to send ${qty} token(s)!`
    );
  }

  balances[caller] -= qty;
  if (target in balances) balances[target] += qty;
  else balances[target] = qty;

  return { state };
}
