'use strict';
function transfer(state, action) {
  const input = action.input;
  const caller = action.caller;
  const target = input.target;
  ContractAssert(target, `No target specified.`);
  ContractAssert(caller !== target, `Invalid token transfer.`);
  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const balances = state.balances;
  ContractAssert(
    caller in balances && balances[caller] >= qty,
    `Caller has insufficient funds`
  );
  balances[caller] -= qty;
  if (!(target in balances)) {
    balances[target] = 0;
  }
  balances[target] += qty;
  state.balances = balances;
  return { state };
}
function balance(state, action) {
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
function lock(state, action) {
  const input = action.input;
  const caller = action.caller;
  const delegatedOwner = input.delegatedOwner;
  ContractAssert(delegatedOwner, `No target specified.`);
  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const balances = state.balances;
  ContractAssert(
    caller in balances && balances[caller] >= qty,
    `Caller has insufficient funds`
  );
  balances[caller] -= qty;
  if (!(delegatedOwner in balances)) {
    balances[delegatedOwner] = 0;
  }
  balances[delegatedOwner] += qty;
  const ethOwnerAddress = input.ethOwnerAddress;
  ContractAssert(ethOwnerAddress, `No ethereum address specified.`);
  state.ethOwnerAddress = ethOwnerAddress;
  return { state };
}
function unlock(state, action) {
  const input = action.input;
  const balances = state.balances;
  const addresses = Object.keys(balances);
  for (const address of addresses) {
    delete balances[address];
  }
  const qty = input.qty;
  ContractAssert(qty, `No quantity specified.`);
  const arweaveAddress = input.arweaveAddress;
  ContractAssert(arweaveAddress, `No arweaveAddress specified.`);
  if (!(arweaveAddress in balances)) {
    balances[arweaveAddress] = 0;
  }
  balances[arweaveAddress] += qty;
  delete state.ethOwnerAddress;
  return { state };
}
function lockDecay(state, action) {
  action.input;
  const decay = state.decay;
  var koii_state = SmartWeave.readContract('cETTyJQYxJLVQ6nC3VxzsZf1x2-6TW2LFkGZa91gUWc');
  // contract state
  let current = decay.lockState || 0;
  let lockBlock = decay.lastLock;
  let list = koii_state.stateUpdate.trafficLogs.rewardReport;
  let newScore; // this will contain the output
  // looping variables
  let oid = SmartWeave.transaction.id;
  let change = 0;
  state.decay.lastMax || 1;
  let scalar = 1;
  let last = 0;
  let lastMax = 0;
  let i = 0;
  for ( var item of list ) {
    // console.log('checking', i, 'change is ', change)
    if ( item.dailyTrafficBlock > lockBlock ) { 
        if ( typeof(item.logsSummary) && Object.keys(item.logsSummary).includes(oid) ) {
          let aScore = item.logsSummary[oid];
          if ( aScore < state.decay.lastMax ) {
            if ( last === i - 1 ) {
              // if we are on a streak, incremement the scalar
              scalar = scalar + scalar;
            }
            if ( ( i - 10 ) < lastMax ) {
              // we are in a recovery slump, so the scalar is negative now
              scalar = ( -1 ) * scalar;
            }
            // increment the adjustment 
            change = change + aScore * ( 1 + scalar / 100 );
          } else {
            // if we have a new max we get a major boost
            state.decay.lastMax = aScore;
            lastMax = i;
            change = change + 10000;
          }
          last = i;
        }
    }
    i = i + 1;
  }
  if (change < 1) {
    // return current;
    newScore = current;
    // no need to update
    // return 200;
  } else {
    // return current + change;
    let remainder = totalFrames - current; // the maximum score adjustment we can give (total frames less current score)
    newScore = remainder * ( 10001 - change );
    if ( newScore > totalFrames ) {
      newScore = totalFrames;
    } else if ( newScore < 0 ) {
      newScore = 0;
    }
    state.decay.lockState = newScore;
    state.decay.lastLock = SmartWeave.block.height;
  }
  return { state };
}
const handlers = [transfer, balance, lock, unlock, lockDecay];
async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
