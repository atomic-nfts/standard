export default function balance(state, action) {
  const input = action.input;
  const caller = action.caller;
  let target;
  if (input.target) {
    target = input.target;
  } else {
    target = caller;
  }
  const ticker = state.ticker;
  const balances = state.balances;
  ContractAssert(
    typeof target === "string",
    `Must specify target to retrieve balance for.`
  );
  return {
    result: {
      target,
      ticker,
      balance: target in balances ? balances[target] : 0
    }
  };
}
