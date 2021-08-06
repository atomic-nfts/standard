import account from "./account";
import deregisterTask from "./deregister_task";
import distributeRewards from "./distribute_rewards";
import mint from "./mint";
import registerTask from "./register_task";
import stake from "./stake";
import transfer from "./transfer";
import withdraw from "./withdraw";

const handlers = [
  account,
  deregisterTask,
  distributeRewards,
  mint,
  registerTask,
  stake,
  transfer,
  withdraw
];

export async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
