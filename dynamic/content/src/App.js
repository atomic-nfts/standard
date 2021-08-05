import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

// import * as kweb from "@_koi/sdk/web";
// import gifFrames from "gif-frames";
import axios from 'axios';
import media from "./narcissus.json";

// import SmartWeave from "smartweave";

import "./App.css";

// console.log('narcissus', media, media.length)
// const ktools = new kweb.Web();

// console.log("ktools", ktools);

let state;
let id;
// let koii;
let totalFrames = 225;

function App() {
  const [narcissus, setNarcissus] = useState(<canvas></canvas>);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  // const [canvas, setCanvas] = useState(<canvas></canvas>);
  const mainRef = useRef(null)
  const flower = media;

  const updateScore = () => {
    console.log("useEffect score", mainRef, 'score is', score);
    if (!mainRef.current) {
      console.log('not updating score because', mainRef.current)
      // setTimeout(updateScore, 1000)
      return;
    } else {
      let scoreSpan = document.getElementsByClassName('scoreSpan')
      
      if (scoreSpan.length < 1 ) {
        let scoreSpan = document.createElement('span')
          scoreSpan.innerText = score;
          scoreSpan.className = "scoreSpan"
            
        mainRef.current.appendChild(scoreSpan);
      } else {
        scoreSpan[0].innerText = score;
      }

      let image = document.getElementsByClassName('narcissus')[0];
      if (image) {
        image.alt = `Level ${ score } achieved, tell a friend to check it out to see the Narcissus blossom.`
        image.title = `Level ${ score } achieved, tell a friend to check it out to see the Narcissus blossom.`

      }
    }
  }

  function updateImage () {
    console.log("update narcissus", mainRef);
    if (!mainRef.current) {
      
      console.log('not updating narcissus because', mainRef.current)
      
      return;
    } else {
      console.log('about to append because main is', mainRef.current)

      let blob = new Blob([narcissus], {type: 'image/svg+xml'});

      let url = URL.createObjectURL(blob);

      console.log('got url', url)

      let narci = document.getElementsByClassName('narcissus');

      if (narci.length < 1) {
        let image = document.createElement('img');
            image.src = url;
            image.className = "narcissus hide";
  
            image.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});

        console.log('image', image)

        setTimeout(function () {
          let narci = document.getElementsByClassName('narcissus')[0];
          narci.className = narci.className.split('hide').join('')
        }, 1200)
  
        mainRef.current.appendChild(image); 
      } else {
        narci[0].src = url;
      }
    }
  }

  useLayoutEffect(() => {
    console.log('triggered score update')
    updateScore(score)

    // Clean up
    return () => {
      // var spans = document.getElementsByClassName('scoreSpan')
      // for ( let span of spans ) {
      //   span.remove()
      // }
    };
  }, [score]);

  
  useLayoutEffect(() => {
    console.log('triggered image update')
    updateImage();

    // Clean up
    return () => {
      // console.log("clean up");
      // // mainRef.current.innerHTML = null
      // let narci = document.getElementsByClassName('narcissus')
      // for ( let n of narci ) {
      //   n.remove()
      // }

    };
  }, [narcissus]);

  /* -- Functions -- */

  const init = async () => {
    let correctFreezeFrame = await getCorrectFreezeFrame()
    console.log('setting frame', correctFreezeFrame)
    await setSVG(correctFreezeFrame)
    return { state, id };
  };

  async function getData (url) {
    try {
      const response = await axios.get(url);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async function getCorrectFreezeFrame() {
    try {
      var oid = (window.location.pathname).split('/')[1] || '1ZjIecqKGYdGTFMWR9kdGrmi77lMmZnA6dxEzWulyjo';
      // console.log('got oid', oid)
      // var nft_state = await ktools.readNftState(oid);
      var nft_state = await getData('https://arweave.net/1ZjIecqKGYdGTFMWR9kdGrmi77lMmZnA6dxEzWulyjo')
      
      // var koii_state = await ktools.getContractState();
      var koii_state = await getData('https://arweave.net/cETTyJQYxJLVQ6nC3VxzsZf1x2-6TW2LFkGZa91gUWc');

      // contract state
      let current = nft_state.decay.lockState || 0;
      let lockBlock = nft_state.decay.lastLock;
      let list = koii_state.stateUpdate.trafficLogs.rewardReport;
      let newScore; // this will contain the output

      // looping variables
      let change = 0;
      let max = nft_state.decay.lastMax || 1;
      let scalar = 1;
      let last = 0;
      let lastMax = 0;
      let i = 0;

      for ( var item of list ) {
        // console.log('checking', i, 'change is ', change)
        if ( item.dailyTrafficBlock > lockBlock ) { 
            if ( typeof(item.logsSummary) && Object.keys(item.logsSummary).includes(oid) ) {
              let aScore = item.logsSummary[oid];
              if ( aScore < max ) {
                
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
                max = aScore;
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
        console.log('returning current', current)
        newScore = current;
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
      }
      // newScore = 200; // enable to check gif scrolling locally
      console.log('newScore is', newScore)
      // setScore(newScore);
      return newScore;
      // return 226;
    } catch (err) {
      console.log('error loading nft data', err)
      setScore(1)
      return 1;
    }
  }

  async function setSVG(frameToSet) {
    console.log('setSVG')
    return new Promise(function (resolve, reject) {
      try {
        // console.log('narcissus', flower.length)
        let obj = "";
        // obj = obj + getSVGContents(flower[index])
        // obj = flower[index]
        for (let x = 1; x < frameToSet; x++ ) {
          setTimeout( function () {
            // obj = obj + getSVGContents(flower[index])
            obj = flower[x]
            setNarcissus(obj);
            setScore(x)
            // console.log(index)
          }, x*100)
        }
        console.log('about to set narcissus', obj)
        console.log('about to set narcissus', typeof(obj))
        // setLoading(false);
        resolve(obj);
      } catch (err) {
        console.log("err", err);
        reject(err);
      }
    });
  }

  // function getSVGContents(inputString){
  //     let domParser = new DOMParser();
  //     let svgDOM = domParser.parseFromString(inputString, 'text/xml')
  //         .getElementsByTagName('svg')[0];
  //     return svgDOM.innerHTML
  // }

  useEffect(() => {
    init();
  }, [])
  
  return (
    <div className="App">
      {/* {loading && (
        // <img alt="this is the loading icon" src={window.location.origin + "/img/narcissus.gif"} />
      )} */}
      {/* {!loading && ( */}
        <React.Fragment>
          <header></header>
          <main ref={mainRef}>
          </main>
        </React.Fragment>
      {/* )} */}
    </div>
  );

}

export default App;

// need to fetch the attention logs from koi state
// then, iterate over the logs and sum the total attention
// then, check the last time the nft was updated
// then, check the nft's decay from it's state.decay
// then, increment counters based on the difference of current block height and the block height at last adjustment
// then, adjust the 'durability' score
