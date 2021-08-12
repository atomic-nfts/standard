import batchAction from "./batch_action";
import deregisterData from "./deregister_data";
import distribution from "./distribution";
import gateway from "./gateway";
import proposeSlash from "./propose_slash";
import rankProposal from "./rank_proposal";
import registerBundler from "./register_bundler";
import registerData from "./register_data";
import submitPayload from "./submit_payload";
import vote from "./vote";

const handlers = [
  batchAction,
  deregisterData,
  distribution,
  gateway,
  proposeSlash,
  rankProposal,
  registerBundler,
  registerData,
  submitPayload,
  vote
];

export async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
