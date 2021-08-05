"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _pkcs8Der = require("./pkcs8-der");

var _binary = require("../../util/binary");

var _pemEncoder = require("../../util/pem-encoder");

var _errors = require("../../util/errors");

const decomposePrivateKey = (pem, options) => {
  // Decode pem
  let decodedPem;

  try {
    decodedPem = (0, _pemEncoder.decodePem)(pem, ['PRIVATE KEY', 'ENCRYPTED PRIVATE KEY']);
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodePemFailedError;
    throw err;
  } // Decompose key using `pkcs8-der`


  const pkcs8Key = (0, _binary.binaryStringToUint8Array)(decodedPem.body);
  const decomposedKey = (0, _pkcs8Der.decomposePrivateKey)(pkcs8Key, options);
  decomposedKey.format = 'pkcs8-pem';
  return decomposedKey;
};

exports.decomposePrivateKey = decomposePrivateKey;

const composePrivateKey = (decomposedKey, options) => {
  // Compose key using `pkcs8-der`
  const pkcs8Key = (0, _pkcs8Der.composePrivateKey)(decomposedKey, options); // Encode pem

  return (0, _pemEncoder.encodePem)({
    type: options.password ? 'ENCRYPTED PRIVATE KEY' : 'PRIVATE KEY',
    body: (0, _binary.uint8ArrayToBinaryString)(pkcs8Key)
  });
};

exports.composePrivateKey = composePrivateKey;