"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePublicKey = exports.decomposePublicKey = exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _encryption = require("./encryption");

var _keys = require("./keys");

var _binary = require("../../util/binary");

var _pemEncoder = require("../../util/pem-encoder");

var _errors = require("../../util/errors");

var _keyTypes = require("../../util/key-types");

const getKeyType = pemType => {
  const match = /^(\S+?) (PUBLIC|PRIVATE) KEY$/.exec(pemType);
  return match && match[1].toLocaleLowerCase();
};

const getPemType = keyAlgorithm => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];
  return keyType && keyType.toUpperCase();
};

const decomposePrivateKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = (0, _pemEncoder.decodePem)(pem, '* PRIVATE KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodePemFailedError;
    throw err;
  } // Decrypt pem if encrypted


  const {
    pemBody,
    encryptionAlgorithm
  } = (0, _encryption.maybeDecryptPemBody)(decodedPem, options.password); // Extract the key type from it

  const keyType = getKeyType(decodedPem.type);
  /* istanbul ignore if */

  if (!keyType) {
    throw new _errors.DecodePemFailedError('Unable to extract key type from PEM', {
      invalidInputKey: true
    });
  } // Finally decompose the key within it


  const {
    keyAlgorithm,
    keyData
  } = (0, _keys.decomposeRawPrivateKey)(keyType, pemBody);
  return {
    format: 'raw-pem',
    keyAlgorithm,
    keyData,
    encryptionAlgorithm
  };
};

exports.decomposePrivateKey = decomposePrivateKey;

const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}, options) => {
  // Compose the key
  const rawKey = (0, _keys.composeRawPrivateKey)(keyAlgorithm, keyData); // Extract the pem type

  const pemKeyType = getPemType(keyAlgorithm);
  /* istanbul ignore if */

  if (!pemKeyType) {
    throw new _errors.UnsupportedAlgorithmError('Unable to extract pem type from key algorithm');
  } // Encrypt pem if password was specified


  const {
    pemBody,
    pemHeaders
  } = (0, _encryption.maybeEncryptPemBody)(rawKey, encryptionAlgorithm, options.password); // Finally build pem

  return (0, _pemEncoder.encodePem)({
    type: `${pemKeyType} PRIVATE KEY`,
    body: (0, _binary.uint8ArrayToBinaryString)(pemBody),
    ...pemHeaders
  });
};

exports.composePrivateKey = composePrivateKey;

const decomposePublicKey = pem => {
  // Decode pem
  let decodedPem;

  try {
    decodedPem = (0, _pemEncoder.decodePem)(pem);
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodePemFailedError;
    throw err;
  } // Extract the key type from it


  const keyType = getKeyType(decodedPem.type);
  /* istanbul ignore if */

  if (!keyType) {
    throw new _errors.DecodePemFailedError('Unable to extract key type from PEM', {
      invalidInputKey: true
    });
  } // Finally decompose the key within it


  const pemBody = (0, _binary.binaryStringToUint8Array)(decodedPem.body);
  const {
    keyAlgorithm,
    keyData
  } = (0, _keys.decomposeRawPublicKey)(keyType, pemBody);
  return {
    format: 'raw-pem',
    keyAlgorithm,
    keyData
  };
};

exports.decomposePublicKey = decomposePublicKey;

const composePublicKey = ({
  keyAlgorithm,
  keyData
}) => {
  // Compose the key
  const rawKey = (0, _keys.composeRawPublicKey)(keyAlgorithm, keyData); // Extract the pem type

  const pemKeyType = getPemType(keyAlgorithm);
  /* istanbul ignore if */

  if (!pemKeyType) {
    throw new _errors.UnsupportedAlgorithmError('Unable to extract pem type from key algorithm');
  } // Finally build pem


  return (0, _pemEncoder.encodePem)({
    type: `${pemKeyType} PUBLIC KEY`,
    body: (0, _binary.uint8ArrayToBinaryString)(rawKey)
  });
};

exports.composePublicKey = composePublicKey;