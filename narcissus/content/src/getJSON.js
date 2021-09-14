const axios = require('axios');

run ();

async function run () {

    let koii_state = await getData('https://arweave.net/cETTyJQYxJLVQ6nC3VxzsZf1x2-6TW2LFkGZa91gUWc');
    console.log('koii state is ', koii_state, typeof(koii_state))
    let data = {
        users : Object.keys(koii_state.balances).length, 
        koii_earned: await sumBalances(koii_state.balances), 
        atomic_nfts: Object.keys(koii_state.registeredRecord).length
    }

    console.log(data);

}
async function getData (url) {
    try {
      const response = await axios.get(url);
    //   console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

async function sumBalances (bal) {
  console.log('bal is ', bal)
  let total = 0;
  for ( b of Object.keys(bal) ) {
    console.log ( 'adding ' + bal[b] + ' to total ' + total);
    total = total + bal[b];
  }
  return total;
}