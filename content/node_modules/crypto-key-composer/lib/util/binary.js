"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uint8ArrayToInteger = exports.bnToUint8Array = exports.typedArrayToUint8Array = exports.uint8ArrayToHexString = exports.hexStringToUint8Array = exports.uint8ArrayToBinaryString = exports.binaryStringToUint8Array = void 0;

/* eslint-disable no-bitwise */
const binaryStringToUint8Array = str => {
  const len = str.length;
  const uint8Array = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    uint8Array[i] = str.charCodeAt(i);
  }

  return uint8Array;
};

exports.binaryStringToUint8Array = binaryStringToUint8Array;

const uint8ArrayToBinaryString = uint8Array => String.fromCharCode.apply(null, uint8Array);

exports.uint8ArrayToBinaryString = uint8ArrayToBinaryString;

const hexStringToUint8Array = str => new Uint8Array(str.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

exports.hexStringToUint8Array = hexStringToUint8Array;

const uint8ArrayToHexString = uint8Array => Array.prototype.map.call(uint8Array, x => `00${x.toString(16)}`.slice(-2)).join('');

exports.uint8ArrayToHexString = uint8ArrayToHexString;

const typedArrayToUint8Array = typedArray => new Uint8Array(typedArray.buffer.slice(typedArray.byteOffset, typedArray.byteOffset + typedArray.byteLength));

exports.typedArrayToUint8Array = typedArrayToUint8Array;

const bnToUint8Array = bn => {
  const numArray = bn.toArray(); // Remove useless sign

  if (!bn.negative && numArray[0] & 0x80) {
    numArray.unshift(0);
  }

  return Uint8Array.from(numArray);
};

exports.bnToUint8Array = bnToUint8Array;

const uint8ArrayToInteger = uint8Array => {
  if (uint8Array.byteLength > 32) {
    throw new Error('Only 32 byte integers is supported');
  }

  let integer = 0;
  let byteCount = 0;

  do {
    integer = (integer << 8) + uint8Array[byteCount];
    byteCount += 1;
  } while (uint8Array.byteLength > byteCount);

  return integer;
};

exports.uint8ArrayToInteger = uint8ArrayToInteger;