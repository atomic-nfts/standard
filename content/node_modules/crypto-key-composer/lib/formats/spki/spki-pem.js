"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePublicKey = exports.decomposePublicKey = void 0;

var _spkiDer = require("./spki-der");

var _binary = require("../../util/binary");

var _pemEncoder = require("../../util/pem-encoder");

var _errors = require("../../util/errors");

const decomposePublicKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = (0, _pemEncoder.decodePem)(pem, 'PUBLIC KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodePemFailedError;
    throw err;
  }

  const spkiKey = (0, _binary.binaryStringToUint8Array)(decodedPem.body);
  const decomposedKey = (0, _spkiDer.decomposePublicKey)(spkiKey, options);
  decomposedKey.format = 'spki-pem';
  return decomposedKey;
};

exports.decomposePublicKey = decomposePublicKey;

const composePublicKey = decomposedKey => {
  const spkiKey = (0, _spkiDer.composePublicKey)(decomposedKey);
  return (0, _pemEncoder.encodePem)({
    type: 'PUBLIC KEY',
    body: (0, _binary.uint8ArrayToBinaryString)(spkiKey)
  });
};

exports.composePublicKey = composePublicKey;