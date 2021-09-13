'use strict';
function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  if (input.function === 'transfer') {
    const target = input.target;
    ContractAssert(target, `No target specified.`);
    ContractAssert(caller !== target, `Invalid token transfer.`);
    const qty = input.qty;
    ContractAssert(qty, `No quantity specified.`);
    const balances = state.balances;
    ContractAssert(caller in balances && balances[caller] >= qty, `Caller has insufficient funds`);
    balances[caller] -= qty;
    if (!(target in balances)) {
      balances[target] = 0;
    }
    balances[target] += qty;
    state.balances = balances;
    return {state};
  }
  if (input.function === 'addToCollection') {
    const nftId = input.nftId;
    ContractAssert(nftId, `No nftId specified.`);
    ContractAssert(caller === state.owner, `Only owner is allowed to add to collection`);
    state.collection.push(nftId);
    return {state};
  }
  if (input.function === 'removeFromCollection') {
    const index = input.index;
    ContractAssert(Number.isInteger(index), `index is not valid integer`);
    ContractAssert(caller === state.owner, `Only owner is allowed to remove from collection`);
    state.collection.splice(index, 1);
    return {state};
  }
  if (input.function === 'updateView') {
    const newView = input.newView;
    ContractAssert(newView, `No newView specified.`);
    ContractAssert(caller === state.owner, `Only owner is allowed to updateView`);
    state.displayFormat = newView;
    return {state};
  }
  if (input.function === 'updatePreviewImageIndex') {
    const imageIndex = input.imageIndex;
    ContractAssert(Number.isInteger(imageIndex), `imageIndex is not a valid integer`);
    ContractAssert(caller === state.owner, `Only owner is allowed to update previewImageIndex`);
    ContractAssert(imageIndex<state.collection.length, `Cannot set index greater than collection length`);
    state.previewImageIndex = imageIndex;
    return {state};
  }
  if (input.function === 'updateCollection') {
    const collection = input.collection;
    ContractAssert(collection, `No collection specified.`);
    ContractAssert(Array.isArray(collection), `collection must be an array`);
    ContractAssert(caller === state.owner, `Only owner is allowed to updateCollection`);
    state.collection = collection;
    return {state};
  }
  throw new ContractError(`No function supplied or function not recognized: "${input.function}".`);
}
