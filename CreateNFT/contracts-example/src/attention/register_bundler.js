export default async function registerBundler(state, action) {
  const validBundlers = state.validBundlers;
  const caller = action.caller;
  if (validBundlers.includes(caller))
    throw new ContractError(`${caller} is already registered`);
  const MAIN_CONTRACT = "KEOnz_i-YWTb1Heomm_QWDgZTbqc0Nb9IBXUskySVp8";
  const tokenContractState = await SmartWeave.contracts.readContractState(
    MAIN_CONTRACT
  );
  const stakes = tokenContractState.stakes;
  const balances = tokenContractState.balances;
  if (!(caller in stakes) || balances[caller] < 1000) {
    throw new Contract(
      "You should stake minimum 1000 koi to register as valid bundler"
    );
  }
  validBundlers.push(caller);
  return { state };
}
