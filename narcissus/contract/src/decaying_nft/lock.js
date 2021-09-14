export default function lock(state, action) {
  const delegatedOwner = input.delegatedOwner;
  ContractAssert(delegatedOwner, `No target specified.`);
  const qty = input.qty;
  ContractAssert(qty && qty>0, `No valid quantity specified.`);
  const balances = state.balances;
  ContractAssert(caller in balances && balances[caller] >= qty, `Caller has insufficient funds`);
  const address=input.address
  const network=input.network
  ContractAssert(address, `No target specified.`);
  ContractAssert(network, `No network specified.`);
  balances[caller] -= qty;
  let lockedArray=state.locked
  let index=lockedArray.findIndex((e)=>{
    e.vaultAddress==delegatedOwner && e.lockedBy==caller
  })
  if(index>=0){
    lockedArray[index].amount+=qty
  }else{
    lockedArray.push({
        "UID": SmartWeave.transaction.id,
        "vaultAddress":delegatedOwner,
        "lockedBy":caller,
        "amount":qty,
        "address":address,
        "network":network
    })
  }
  state.locked=lockedArray
  return {state};
}
  