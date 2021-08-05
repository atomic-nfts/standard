"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _keys = require("../raw/keys");

var _errors = require("../../util/errors");

var _keyTypes = require("../../util/key-types");

const decomposePrivateKey = rsaPrivateKeyAsn1 => {
  let decomposedRsaKey;

  try {
    decomposedRsaKey = (0, _keys.decomposeRsaPrivateKey)(rsaPrivateKeyAsn1);
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodeAsn1FailedError;
    throw err;
  }

  const {
    keyAlgorithm,
    keyData
  } = decomposedRsaKey;
  return {
    format: 'pkcs1-der',
    encryptionAlgorithm: null,
    keyAlgorithm,
    keyData
  };
};

exports.decomposePrivateKey = decomposePrivateKey;

const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}) => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];

  if (keyType !== 'rsa') {
    throw new _errors.UnsupportedAlgorithmError('The key algorithm id for PKCS1 must be one of RSA\'s');
  }

  if (encryptionAlgorithm) {
    throw new _errors.UnsupportedAlgorithmError('The PKCS1 DER format does not support encryption');
  }

  return (0, _keys.composeRsaPrivateKey)(keyAlgorithm, keyData);
};

exports.composePrivateKey = composePrivateKey;