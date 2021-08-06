export default async function batchAction(state, action) {
  const votes = state.votes;
  const validBundlers = state.validBundlers;
  const caller = action.caller;
  const input = action.input;
  const batchTxId = input.batchFile;
  const voteId = input.voteId;
  const vote = votes[voteId];

  // if (SmartWeave.block.height > vote.end)
  //   throw new ContractError('it is closed');
  if (!batchTxId) throw new ContractError("No txId specified");
  if (!Number.isInteger(voteId)) {
    throw new ContractError(
      'Invalid value for "voting id". Must be an integer'
    );
  }
  if (!(typeof batchTxId === "string"))
    throw new ContractError("batchTxId should be string");
  if (!validBundlers.includes(action.caller))
    throw new ContractError("Only selected bundlers can write batch actions.");

  const MAIN_CONTRACT = "KEOnz_i-YWTb1Heomm_QWDgZTbqc0Nb9IBXUskySVp8";
  const tokenContractState = await SmartWeave.contracts.readContractState(
    MAIN_CONTRACT
  );
  const stakes = tokenContractState.stakes;
  if (!(caller in stakes)) {
    throw new ContractError("caller hasn't staked");
  }

  const batch = await SmartWeave.unsafeClient.transactions.getData(batchTxId, {
    decode: true,
    string: true
  });
  const batchInArray = batch.split();
  const voteArray = JSON.parse(batchInArray);
  for (let voteObj of voteArray) {
    const dataInString = JSON.stringify(voteObj.vote);
    const voteBuffer = await SmartWeave.arweave.utils.stringToBuffer(
      dataInString
    );
    const rawSignature = await SmartWeave.arweave.utils.b64UrlToBuffer(
      voteObj.signature
    );
    const isVoteValid = await SmartWeave.arweave.crypto.verify(
      voteObj.owner,
      voteBuffer,
      rawSignature
    );

    if (
      isVoteValid &&
      voteObj.vote.voteId === voteId &&
      !vote.voted.includes(voteObj.senderAddress)
    ) {
      if (voteObj.vote.userVote === "true") {
        vote["yays"] += 1;
        vote.voted.push(voteObj.senderAddress);
      }
      if (voteObj.vote.userVote === "false") {
        vote["nays"] += 1;
        vote.voted.push(voteObj.senderAddress);
      }
    }
  }

  if (!(caller in vote.bundlers)) vote.bundlers[caller] = [];
  vote.bundlers[caller].push(batchTxId);

  return { state };
}
