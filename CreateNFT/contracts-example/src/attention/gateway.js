export default function gateway(state, action) {
  const gateways = state.gateways;
  const balances = state.balances;
  const caller = action.caller;
  const input = action.input;
  const url = input.url;
  const publicKey = input.publicKey;

  if (!url) throw new ContractError("No gateway specified");
  if (!publicKey) throw new ContractError("No publicKey specified");
  if (balances[caller] < 1)
    throw new ContractError("you need min 1 KOI to register gateway");
  if (
    !url.match(
      /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/gi
    )
  ) {
    throw new ContractError("The gateway must be a valid URL or IP");
  }

  --balances[caller]; // burn 1 koi per registration
  gateways[caller] = {
    url: url,
    publicKey: publicKey,
    rate: 0
  };

  return { state };
}
