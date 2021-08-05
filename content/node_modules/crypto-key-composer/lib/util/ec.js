"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateEcD = exports.encodeEcPoint = exports.decodeEcPoint = void 0;

var _errors = require("./errors");

const getEcFieldSize = namedCurve => // Get the the curve's field size in bytes by extracting the number of bits from it and converting it to bytes
// Note that the number of bits may not be multiples of 8
Math.floor((Number(namedCurve.match(/\d+/)[0]) + 7) / 8);

const decodeEcPoint = (namedCurve, publicKey) => {
  const fieldSizeBytes = getEcFieldSize(namedCurve);

  if (publicKey[0] !== 4) {
    throw new _errors.UnsupportedAlgorithmError('Only uncompressed EC points are supported');
  }

  if (publicKey.length !== fieldSizeBytes * 2 + 1) {
    throw new _errors.UnsupportedAlgorithmError(`Expecting EC public key to have length ${fieldSizeBytes * 2 - 1}`);
  }

  return {
    x: publicKey.slice(1, fieldSizeBytes + 1),
    y: publicKey.slice(fieldSizeBytes + 1)
  };
};

exports.decodeEcPoint = decodeEcPoint;

const encodeEcPoint = (namedCurve, x, y) => {
  const fieldSizeBytes = getEcFieldSize(namedCurve);

  if (!y) {
    throw new _errors.UnsupportedAlgorithmError('Only uncompressed EC points are supported (y must be specified)');
  }

  if (!x || x.length !== fieldSizeBytes || !y || y.length !== fieldSizeBytes) {
    throw new _errors.UnsupportedAlgorithmError(`Expecting x & y points to have length ${fieldSizeBytes} bytes`);
  }

  return new Uint8Array([4, ...x, ...y]);
};

exports.encodeEcPoint = encodeEcPoint;

const validateEcD = (namedCurve, d) => {
  const fieldSizeBytes = getEcFieldSize(namedCurve);

  if (!d || d.length < fieldSizeBytes) {
    throw new _errors.UnsupportedAlgorithmError(`Expecting d length to be >= ${fieldSizeBytes} bytes`);
  }

  return d;
};

exports.validateEcD = validateEcD;