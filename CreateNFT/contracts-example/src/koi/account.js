export default function account(state, action) {
  const balances = state.balances;
  const stakes = state.stakes;
  const gateways = state.gateways;
  const ticker = state.ticker;
  const input = action.input;
  const target = input.target;

  const balance = balances[target] || 0;
  const stake = stakes[target] || 0;
  const gateway = gateways[target] || "";

  return { result: { target, ticker, balance, stake, gateway } };
}
