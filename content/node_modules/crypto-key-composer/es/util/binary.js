/* eslint-disable no-bitwise */
export const binaryStringToUint8Array = str => {
  const len = str.length;
  const uint8Array = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    uint8Array[i] = str.charCodeAt(i);
  }

  return uint8Array;
};
export const uint8ArrayToBinaryString = uint8Array => String.fromCharCode.apply(null, uint8Array);
export const hexStringToUint8Array = str => new Uint8Array(str.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
export const uint8ArrayToHexString = uint8Array => Array.prototype.map.call(uint8Array, x => `00${x.toString(16)}`.slice(-2)).join('');
export const typedArrayToUint8Array = typedArray => new Uint8Array(typedArray.buffer.slice(typedArray.byteOffset, typedArray.byteOffset + typedArray.byteLength));
export const bnToUint8Array = bn => {
  const numArray = bn.toArray(); // Remove useless sign

  if (!bn.negative && numArray[0] & 0x80) {
    numArray.unshift(0);
  }

  return Uint8Array.from(numArray);
};
export const uint8ArrayToInteger = uint8Array => {
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