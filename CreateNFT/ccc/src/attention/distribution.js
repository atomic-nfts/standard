export default async function distribution(state, action) {
  const task = state.task;
  const validBundlers = state.validBundlers;
  const registerRecords = state.registerRecords;
  const caller = action.caller;

  // if (SmartWeave.block.height < trafficLogs.close) {
  //   throw new ContractError("voting process is ongoing");
  // }

  const currentTask = task.dailyPayload.find(
    (payLoad) => payLoad.block === task.open
  );
  if (currentTask.isDistributed)
    throw new ContractError("Reward is distributed");
  if (!validBundlers.includes(caller))
    throw new ContractError("Only selected bundlers can write batch actions.");
  const MAIN_CONTRACT = "KEOnz_i-YWTb1Heomm_QWDgZTbqc0Nb9IBXUskySVp8";
  const tokenContractState = await SmartWeave.contracts.readContractState(
    MAIN_CONTRACT
  );
  const stakes = tokenContractState.stakes;
  if (!(caller in stakes)) throw new ContractError("caller hasnt staked");

  const logSummary = {};
  let totalDataRe = 0;
  const payloads = currentTask.payloads;
  for (var i = 0; i < payloads.length; i++) {
    if (payloads[i].won) {
      const batch = await SmartWeave.unsafeClient.transactions.getData(
        payloads[i].TLTxId,
        { decode: true, string: true }
      );
      const logs = JSON.parse(batch);
      logs.forEach((element) => {
        const contentId = element.url.substring(1);

        if (contentId in registerRecords) {
          totalDataRe += element.addresses.length;
          logSummary[contentId] = element.addresses.length;
        }
      });
    }
  }

  const rewardPerAttention = 1000 / totalDataRe;

  const distribution = {};
  for (const log in logSummary)
    distribution[registerRecords[log]] = logSummary[log] * rewardPerAttention;

  const distributionReport = {
    dailyTrafficBlock: task.open,
    logsSummary: logSummary,
    distribution: distribution,
    distributer: caller,
    distributionBlock: SmartWeave.block.height,
    rewardPerAttention: rewardPerAttention
  };

  task.rewardReport.push(distributionReport);
  currentTask.isDistributed = true;
  task.open = SmartWeave.block.height;
  task.close = SmartWeave.block.height + 720;

  const newDailyTL = {
    block: task.open,
    payloads: [],
    isRanked: false,
    isDistributed: false
  };
  task.dailyPayload.push(newDailyTL);

  return { state };
}
