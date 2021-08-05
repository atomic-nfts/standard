export default function lockDecay(state, action) {
  const input = action.input;
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
  let max = state.decay.lastMax || 1;
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
            change = change + aScore * ( 1 + scalar / 100 )

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
