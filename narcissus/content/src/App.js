import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import axios from "axios";
import media from "./narcissus.json";

import "./App.css";

let state;
let id;
let disco;
let statusText = "The flower is loading...";
let oid;
let real_attn;
let attn_state;
let real_score = 0;
let frame = 1;
const peak = 43;
const dead = 65;

function App() {
  const [narcissus, setNarcissus] = useState(<canvas></canvas>);
  const mainRef = useRef(null);
  const flower = media;

  function updateImage() {
    if (!mainRef.current) {
      return;
    } else {
      let blob = new Blob([narcissus], { type: "image/svg+xml" });

      let url = URL.createObjectURL(blob);

      let narci = document.getElementsByClassName("narcissus");

      if (narci.length < 1) {
        let image = document.createElement("img");
        image.src = url;
        image.className = "narcissus hide";
        image.title = statusText;
        image.addEventListener("load", () => URL.revokeObjectURL(url), {
          once: true,
        });

        setTimeout(function () {
          let narci = document.getElementsByClassName("narcissus")[0];
          narci.className = narci.className.split("hide").join("");
        }, 1200);

        mainRef.current.appendChild(image);
      } else {
        narci[0].src = url;
        narci[0].title = statusText;
      }
    }
  }

  useLayoutEffect(() => {
    updateImage();
    return () => {};
  }, [narcissus]);

  const init = async () => {
    let preset = await getFrameSet();
    if (preset) {
      setSVG(preset);
    } else {
      setSVG(1);
      getFrameData();
    }

    oid = await getAtomicId() || '3gaVfUdeRdT5rsaEuLebaJjsDMPGT5C5ID0lmu6eSDc';

    attn_state = await getData('https://mainnet.koii.live/attention/');
    real_attn = await getData('https://mainnet.koii.live/attention/realtime-attention?id=' + oid);
    
    configureFilter(oid)

    setRealTimeUpdater();

    return { state, id };
  };

  async function updateRealtime () {
    if (!oid) oid = getAtomicId() || '3gaVfUdeRdT5rsaEuLebaJjsDMPGT5C5ID0lmu6eSDc';
    real_attn = await getData('https://mainnet.koii.live/attention/realtime-attention?id=' + oid);
    if (
      typeof real_attn !== "undefined" &&
      typeof real_attn.count !== "undefined" &&
      real_attn.count > 1
    ) {
      if ( real_attn.count > 100 ) {
        setSVG(43);
        return discoPanic();
      } else {
        setSVG(frame + real_attn.count - real_score);
      }
      real_score = real_attn.count 
    }
  }

  function setRealTimeUpdater() {
    updateRealtime()
    setInterval(function(){
      updateRealtime()
    }, 10000)
  }

  async function getData(url) {
    try {
      const response = await axios.get(url);
      // console.log(response);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch NFT with " + oid, error);
    }
  }
  async function configureFilter (atomicId) {
    let plinko = atomicId.charCodeAt(0)
    let skew = [
      atomicId.charCodeAt(1),
      atomicId.charCodeAt(2),
      atomicId.charCodeAt(3),
      atomicId.charCodeAt(4),
      atomicId.charCodeAt(5),
      atomicId.charCodeAt(6)
    ];
    let filter;
    if ( plinko < 49 ) {
      filter = [140, 127, -56, 34, 85, 0]
    } else if ( plinko < 57 ) {
      filter = [125, 145, -15, 8, 100, 0]
    } else if ( plinko < 72 ) {
      filter = [100, 91, 268, 41, 88, 0]
    } else if ( plinko < 79 ) {
      filter = [145, 150, 4, 0, 94, 0]
    } else if ( plinko < 85 ) {
      filter = [121, 110, -166, 32, 180, 16]
    } else if ( plinko < 93 ) {
      filter = [210, 100, 7, 0, 105, 0]
    } else if ( plinko < 98 ) {
      filter = [0, 160, 0, 0, 100, 0]
    } else if ( plinko < 103 ) {
      filter = [160, 100, 68, 10, 100, 0]
    } else if ( plinko < 109 ) {
      filter = [237, 100, 243, 15, 100, 100]
    } else if ( plinko < 114 ) {
      filter = [80, 134, -51, 0, 116, 93]
    } else if ( plinko < 122 ) {
      filter = [140, 127, 47, 34, 500, 0]
    } 
    if (!filter) {
      discoPanic()
    } else {
      filter = skewIt (filter, skew)
      setFilter(filter)
    }
  }

  function discoPanic () {
    if ( !disco ) {
      startDisco();
      disco = true;
    }
  }

  function setStatus(status) {
    statusText = status;
  }

  function skewIt(filter, skew) {
    let multipliers = [0.0005, 0.0002, 0.001, 0.0001, 0.0001, 0.0001];
    let newFilter = [];
    for (var i = 0; i < skew.length; i++) {
      if (skew[i])
        newFilter[i] = filter[i] + filter[i] * skew[i] * multipliers[i];
    }
    return newFilter;
  }

  function startDisco() {
    let n = 0;
    setInterval(() => {
      document.getElementsByClassName("narcissus")[0].style.filter =
        "brightness(120%) hue-rotate(" + n + "deg)";

      n = n + 15;
      if (n > 100000) n = 0;
    }, 100);
  }

  async function setFilter(filter) {
    document.getElementById("color_filter").innerHTML = `
        img.narcissus {
          filter: saturate(${filter[0]}%) brightness(${filter[1]}%) hue-rotate( ${filter[2]}deg) sepia(${filter[3]}%) contrast(${filter[4]}%) invert(${filter[5]}%)
        }
    `;
  }

  async function getFrameData() {
    try {
      // contract state
      let list = attn_state.task.attentionReport;

      // looping variables
      let change = 0;
      let max = 0;

      var deaddead = false;

      if (!frame) frame = 1;
      if (!max) max = 1;

      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        // eslint-disable-next-line no-loop-func
        setTimeout(async () => {
          if (
            !deaddead &&
            typeof item !== "undefined" &&
            Object.keys(item).includes(oid)
          ) {
            if (typeof item[oid] !== "undefined") {
              let aScore = item[oid];
              if (aScore < max) {
                if (frame + change === peak || frame + change >= peak) {
                  max = max / 2;
                  change = change + 1;
                  if (change + frame > dead - 1) {
                    deaddead = true;
                  }
                }
              } else {
                if (frame + change >= peak) {
                  max = max / 2;
                  change = change - 1;
                } else if (frame + change < peak) {
                  var ratio = (aScore - max) / max;
                  if (ratio > 0.1) {
                    change = change + 2;
                  } else if (ratio > 0.5) {
                    change = change + 3;
                  } else if (ratio > 1.0) {
                    change = change + 4;
                  } else if (ratio > 3.0) {
                    change = change + 5;
                  } else {
                    change = change + 1;
                  }
                }
                max = aScore;
              }
            }
          }
          frame = frame + change;
          let result = await statusSetter(frame);
          setSVG(frame);
        }, i * 100);
      }
    } catch (err) {
      setStatus("The flower is confused.");
      return setSVG(1);
    }
  }

  function statusSetter (frame) {
    if (frame < peak) {
      setStatus(
        "I am blooming at level " +
        frame +
          "/" +
          peak +
          ". Feed me more attention to see me grow."
      );
    } else if (frame === peak) {
      setStatus("I am fully bloomed, thank you for your love.");
    } else if (frame < dead) {
      setStatus("Help! I'm wilting, feed me love and save my life.");
    } else if (frame === dead) {
      setStatus("The flower is dead.");
    }
  }

  async function getAtomicId() {
    return window.location.pathname.split("/")[1];
  }

  async function setSVG(frameToSet) {
    return new Promise(function (resolve, reject) {
      try {
        let obj = "";
        obj = flower[frameToSet];
        setNarcissus(obj);
        resolve(obj);
      } catch (err) {
        reject(err);
      }
    });
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      {/* {loading && (
        // <img alt="this is the loading icon" src={window.location.origin + "/img/narcissus.gif"} />
      )} */}
      {/* {!loading && ( */}
      <React.Fragment>
        <header></header>
        <main ref={mainRef}></main>
      </React.Fragment>
      {/* )} */}
    </div>
  );
}

export default App;

async function getFrameSet() {
  if (window.location.href.includes("set_frame=")) {
    var last = window.location.href.split("set_frame=")[1];
    if (last.includes("&")) {
      if (last.split("&")[0]) return last.split("&")[0];
    } else {
      return last.split("&")[0];
    }
  }
}
