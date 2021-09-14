import transfer from "./transfer";
import balance from "./balance";
import lock from "./lock";
import unlock from "./unlock";
// import lockDecay from "./lockDecay";

const handlers = [transfer, balance, lock, unlock];

export async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
