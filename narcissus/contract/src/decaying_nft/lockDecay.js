export default function lockDecay(state, action) {
  const input = action.input;
  const decay = state.decay;

  var koii_state = SmartWeave.readContract('cETTyJQYxJLVQ6nC3VxzsZf1x2-6TW2LFkGZa91gUWc');

  // contract state
  let frame = decay.lockState || 0;
  let lockBlock = decay.lastLock;
  let list = koii_state.stateUpdate.trafficLogs.rewardReport;

  // looping variables
  let change = 0;
  let max = decay.lastMax || 1;

  const peak = 43;
  const dead = 70;

  if ( !frame ) frame = 0;
  if ( !max ) max = 0;

  for ( var item of list ) {
    // console.log('checking', i, 'change is ', change)
    if ( item.dailyTrafficBlock > lockBlock ) { 
        if ( typeof(item.logsSummary) && Object.keys(item.logsSummary).includes(oid) ) {
          let aScore = item.logsSummary[oid];
          if ( aScore < max ) {
            // if the score is less than the max, check if the current frame is >43 
            // if it is, then we should move up, not down
            if ( frame > peak ) {
              change = change + 1; // move one frame further
            }
            // otherwise, we do nothing (no change)
          } else {
            // if we have a new max we get a major boost
            max = aScore;
            if ( frame < peak ) {
              var ratio = (aScore - max) / max;
              if ( ratio > 0.10 ) {
                change = change + 2; 
              } else if ( ratio > 0.5 ) { 
                change = change + 3; 
              } else if ( ratio > 1.0 ) { 
                change = change + 4; 
              } else if ( ratio > 3.0 ) { 
                change = change + 5; 
              } else {
                // default
                change = change + 1; // move one frame further
              }
            } else {
              change = change - 1; // if the flower is dying, it gets revived by a new max score
            }
          }
        }
    }
  }
 
  if (change !== 0 && ( frame + change > 0 ) && ( frame + change > dead ) ) {
    frame = frame + change;
  }
  state.decay.lockState = frame;
  state.decay.lastMax = max
  state.decay.lastLock = SmartWeave.block.height;

  return { state };
}
