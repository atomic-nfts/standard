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
  const delegatedOwner = input.delegatedOwner;
  ContractAssert(delegatedOwner, `No target specified.`);
  const qty = input.qty;
  ContractAssert(qty && qty>0, `No valid quantity specified.`);
  const balances = state.balances;
  ContractAssert(caller in balances && balances[caller] >= qty, `Caller has insufficient funds`);
  const address=input.address;
  const network=input.network;
  ContractAssert(address, `No target specified.`);
  ContractAssert(network, `No network specified.`);
  balances[caller] -= qty;
  let lockedArray=state.locked;
  let index=lockedArray.findIndex((e)=>{
    e.vaultAddress==delegatedOwner && e.lockedBy==caller;
  });
  if(index>=0){
    lockedArray[index].amount+=qty;
  }else {
    lockedArray.push({
        "UID": SmartWeave.transaction.id,
        "vaultAddress":delegatedOwner,
        "lockedBy":caller,
        "amount":qty,
        "address":address,
        "network":network
    });
  }
  state.locked=lockedArray;
  return {state};
}
// Only the vault owner can call this function
function unlock(state, action) {
  const recipientAddress = input.recipientAddress;
  ContractAssert(recipientAddress, `No target specified.`);
  let qty = input.qty;
  ContractAssert(qty && qty>0, `No valid quantity specified.`);
  let lockedArray = state.locked;
  let index=lockedArray.findIndex((e)=>{
    return e.vaultAddress==caller && e.lockedBy==recipientAddress
  });
  ContractAssert(index>=0, `Only vault owner can call this function and there must be some locked NFTs under the recipient address`);
  if(lockedArray[index].amount-qty==0){
    lockedArray.splice(index, 1);
    state.balances[recipientAddress]=Number(state.balances[recipientAddress])+qty;
  }else if(lockedArray[index].amount-qty>0){
    lockedArray[index].amount-=qty;
    state.balances[recipientAddress]=Number(state.balances[recipientAddress])+qty;
  }else {
    ContractAssert(lockedArray[index].amount-qty>=0, `You cannot unlock more qty than currently locked`);
  }
  state.locked=lockedArray;
  return {state};
}
// import lockDecay from "./lockDecay";
const handlers = [transfer, balance, lock, unlock];
async function handle(state, action) {
  const handler = handlers.find((fn) => fn.name === action.input.function);
  if (handler) return await handler(state, action);
  throw new ContractError(`Invalid function: "${action.input.function}"`);
}
