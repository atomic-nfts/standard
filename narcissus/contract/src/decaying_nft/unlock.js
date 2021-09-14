// Only the vault owner can call this function
export default function unlock(state, action) {
  const recipientAddress = input.recipientAddress;
  ContractAssert(recipientAddress, `No target specified.`);
  let qty = input.qty;
  ContractAssert(qty && qty>0, `No valid quantity specified.`);
  let lockedArray = state.locked;
  let index=lockedArray.findIndex((e)=>{
    return e.vaultAddress==caller && e.lockedBy==recipientAddress
  })
  ContractAssert(index>=0, `Only vault owner can call this function and there must be some locked NFTs under the recipient address`);
  if(lockedArray[index].amount-qty==0){
    lockedArray.splice(index, 1);
    state.balances[recipientAddress]=Number(state.balances[recipientAddress])+qty
  }else if(lockedArray[index].amount-qty>0){
    lockedArray[index].amount-=qty
    state.balances[recipientAddress]=Number(state.balances[recipientAddress])+qty
  }else{
    ContractAssert(lockedArray[index].amount-qty>=0, `You cannot unlock more qty than currently locked`);
  }
  state.locked=lockedArray
  return {state};
}
