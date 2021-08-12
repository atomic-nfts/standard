export default function rankProposal(state, action) {
  const task = state.task;
  const votes = state.votes;
  // if (
  //   SmartWeave.block.height > task.close ||
  //   SmartWeave.block.height < task.close - 75
  // ) {
  //   throw new ContractError("Ranking time finished or not Ranking time");
  // }
  const currentTask = task.dailyPayload.find(
    (dailyPayload) => dailyPayload.block === task.open
  );
  if (currentTask.isRanked) {
    throw new ContractError("it has already been ranked");
  }
  const payloads = currentTask.payloads;
  const proposedGateWays = {};
  payloads.forEach((prp) => {
    const prpVote = votes[prp.voteId];

    if (!proposedGateWays[prp.gateWayId]) {
      if (prpVote.yays > prpVote.nays) {
        proposedGateWays[prp.gateWayId] = prp;
        prp.won = true;
        prpVote.status = "passed";
      }
    } else {
      const currentSelectedPrp = proposedGateWays[prp.gateWayId];
      const selectedPrpVote = votes[currentSelectedPrp.voteId];
      const selectedPrpVoteTotal = selectedPrpVote.yays + selectedPrpVote.nays;
      const prpVoteTotal = prpVote.yays + prpVote.nays;
      if (prpVoteTotal > selectedPrpVoteTotal && prpVote.yays > prpVote.nays) {
        proposedGateWays[prp.gateWayId] = prp;
        prp.won = true;
        currentSelectedPrp.won = false;
        prpVote.status = "passed";
        votes[currentSelectedPrp.voteId].status = "passed";
      }

      const prpVotePassPer = prpVote.yays - prpVote.nays;
      const selPrpVotePassPer = selectedPrpVote.yays - selectedPrpVote.nays;
      if (
        prpVoteTotal === selectedPrpVoteTotal &&
        prpVotePassPer > selPrpVotePassPer
      ) {
        proposedGateWays[prp.gateWayId] = prp;
        prp.won = true;
        currentSelectedPrp.won = false;
        votes[currentSelectedPrp.voteId].status = "passed";
        prpVote.status = "passed";
      }

      if (
        prpVoteTotal === selectedPrpVoteTotal &&
        prpVotePassPer === selPrpVotePassPer &&
        prp.blockHeight < currentSelectedPrp.blockHeight
      ) {
        proposedGateWays[prp.gateWayId] = prp;
        prp.won = true;
        currentSelectedPrp.won = false;
        prpVote.status = "passed";
        votes[currentSelectedPrp.voteId].status = "passed";
      } else {
        prpVote.status = "passed";
      }
    }
  });

  currentTask.isRanked = true;

  return { state };
}
