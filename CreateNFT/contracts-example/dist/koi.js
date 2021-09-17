'use strict';
function account(state, action) {
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
function deregisterTask(state, action) {
  state.KOI_TASKS = state.KOI_TASKS.filter(
    (e) => e.TaskId != action.input.taskId
  );
  return { state };
}
async function distributeRewards(state, action) {
  const balances = state.balances;
  const koi_tasks = state.KOI_TASKS;
  const input = action.input;
  const taskId = input.taskId;
  const task = koi_tasks.filter((task) => task.TaskId === taskId);
  const TASK_CONTRACT = task[0].TaskTxId;
  const contractState = await SmartWeave.contracts.readContractState(
    TASK_CONTRACT
  );
  const rewardReport = contractState.task.rewardReport;
  const dailyPayload = contractState.task.dailyPayload;
  const length = rewardReport.length;
  const lastDistributionIndex = length - 1;
  const distributionRewardReport = rewardReport[lastDistributionIndex];
  const distribution = distributionRewardReport.distribution;
  const currentPayload = dailyPayload[lastDistributionIndex];
  currentPayload.payloads.map((payload) => {
    const address = payload.owner;
    balances[address] -= 1;
  });
  for (let address in distribution) {
    if (address in balances) balances[address] += distribution[address];
    else balances[address] = distribution[address];
  }
  return { state };
}
function mint(state, action) {
  const owner = state.owner;
  const balances = state.balances;
  const caller = action.caller;
  const input = action.input;
  const target = input.target;
  const qty = input.qty;
  if (!target) throw new ContractError("No target specified");
  if (!Number.isInteger(qty))
    throw new ContractError('Invalid value for "qty". Must be an integer');
  if (owner !== caller)
    throw new ContractError("Only the owner can mint new tokens");
  if (balances[target]) balances[target] += qty;
  else balances[target] = qty;
  return { state };
}
function registerTask(state, action) {
  const balances = state.balances;
  const caller = action.caller;
  const input = action.input;
  const taskId = input.taskId;
  const taskName = input.taskname;
  const taskTxId = input.taskTxId;
  const KOI_Reward = input.KOI_Reward;
  if (!taskTxId) throw new ContractError("No txid specified");
  if (!(caller in balances) || balances[caller] < 1)
    throw new ContractError("you need min 1 KOI to register data");
  state.KOI_TASKS.push({
    TaskId: taskId,
    TaskName: taskName,
    TaskTxId: taskTxId,
    KOI_Reward: KOI_Reward
  });
  --balances[caller]; // burn 1 koi per registration
  return { state };
}
function stake(state, action) {
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
function transfer(state, action) {
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
function withdraw(state, action) {
  const balances = state.balances;
  const stakes = state.stakes;
  const stakeReleaseBlock = state.stakeReleaseBlock;
  const caller = action.caller;
  const input = action.input;
  const qty = input.qty;
  if (!Number.isInteger(qty))
    throw new ContractError('Invalid value for "qty". Must be an integer');
  if (qty <= 0) throw new ContractError("Invalid stake withdrawal amount");
  if (stakeReleaseBlock[caller] < SmartWeave.block.height)
    throw new ContractError("Stake is not ready to be released");
  if (stakes[caller] < qty) {
    throw new ContractError(
      "Stake balance is too low to withdraw that amount of tokens"
    );
  }
  stakes[caller] -= qty;
  balances[caller] += qty;
  return { state };
}
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
async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
