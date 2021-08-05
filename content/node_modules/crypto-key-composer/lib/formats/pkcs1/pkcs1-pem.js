"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _encryption = require("../raw/encryption");

var _pkcs1Der = require("./pkcs1-der");

var _pemEncoder = require("../../util/pem-encoder");

var _binary = require("../../util/binary");

var _errors = require("../../util/errors");

const decomposePrivateKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = (0, _pemEncoder.decodePem)(pem, 'RSA PRIVATE KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodePemFailedError;
    throw err;
  }

  const {
    pemBody: pkcs1Key,
    encryptionAlgorithm
  } = (0, _encryption.maybeDecryptPemBody)(decodedPem, options.password);
  const decomposedKey = (0, _pkcs1Der.decomposePrivateKey)(pkcs1Key, options);
  decomposedKey.encryptionAlgorithm = encryptionAlgorithm;
  decomposedKey.format = 'pkcs1-pem';
  return decomposedKey;
};

exports.decomposePrivateKey = decomposePrivateKey;

const composePrivateKey = ({
  encryptionAlgorithm,
  ...decomposedKey
}, options) => {
  const pkcs1Key = (0, _pkcs1Der.composePrivateKey)(decomposedKey, options);
  const {
    pemBody,
    pemHeaders
  } = (0, _encryption.maybeEncryptPemBody)(pkcs1Key, encryptionAlgorithm, options.password);
  return (0, _pemEncoder.encodePem)({
    type: 'RSA PRIVATE KEY',
    body: (0, _binary.uint8ArrayToBinaryString)(pemBody),
    ...pemHeaders
  });
};

exports.composePrivateKey = composePrivateKey;