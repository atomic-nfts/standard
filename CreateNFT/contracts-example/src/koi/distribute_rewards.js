export default async function distributeRewards(state, action) {
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
