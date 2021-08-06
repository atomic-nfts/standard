export default async function submitPayload(state, action) {
  const task = state.task;
  const caller = action.caller;
  const input = action.input;
  const batchTxId = input.batchTxId;
  const gateWayUrl = input.gateWayUrl;
  const stakeAmount = input.stakeAmount;
  const type = input.type;

  if (!batchTxId) throw new ContractError("No batchTxId specified");
  if (!gateWayUrl) throw new ContractError("No gateWayUrl specified");
  const MAIN_CONTRACT = "KEOnz_i-YWTb1Heomm_QWDgZTbqc0Nb9IBXUskySVp8";
  const tokenContractState = await SmartWeave.contracts.readContractState(
    MAIN_CONTRACT
  );
  const balances = tokenContractState.balances;
  if (!(caller in balances) || balances[caller] < 1)
    throw new ContractError("you need min 1 KOI to propose gateway");
  // if (SmartWeave.block.height > task.close - 420)
  //   throw new ContractError("proposing is closed. wait for another round");

  const vote = {
    id: state.votes.length,
    type: type,
    status: "active",
    voted: [],
    stakeAmount: stakeAmount,
    yays: 0,
    nays: 0,
    bundlers: {},
    start: SmartWeave.block.height,
    end: task.close
  };

  const payload = {
    TLTxId: batchTxId,
    owner: caller,
    gateWayId: gateWayUrl,
    voteId: state.votes.length,
    blockHeight: SmartWeave.block.height,
    won: false
  };

  const currentTask = task.dailyPayload[task.dailyPayload.length - 1];
  currentTask.payloads.push(payload);
  state.votes.push(vote);

  return { state };
}
