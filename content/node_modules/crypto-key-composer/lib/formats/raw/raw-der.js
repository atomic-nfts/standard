"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePublicKey = exports.decomposePublicKey = exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _keys = require("./keys");

var _errors = require("../../util/errors");

const decomposePrivateKey = privateKeyAsn1 => {
  // Iterate over all supported key types, until one succeeds
  // Construct an errors object along the way with all the failed decode attempts
  let decomposedKey;
  const errors = {};

  for (const keyType of _keys.SUPPORTED_KEY_TYPES.private) {
    try {
      decomposedKey = (0, _keys.decomposeRawPrivateKey)(keyType, privateKeyAsn1);
      break;
    } catch (err) {
      if (err instanceof _errors.DecodeAsn1FailedError) {
        errors[keyType] = err;
      } else {
        throw err;
      }
    }
  }

  if (!decomposedKey) {
    throw new _errors.AggregatedError(`The input key is not one of: ${_keys.SUPPORTED_KEY_TYPES.private.join(', ')}`, errors, {
      invalidInputKey: true
    });
  }

  const {
    keyAlgorithm,
    keyData
  } = decomposedKey;
  return {
    format: 'raw-der',
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
  if (encryptionAlgorithm) {
    throw new _errors.UnsupportedAlgorithmError('The RAW DER format does not support encryption');
  }

  return (0, _keys.composeRawPrivateKey)(keyAlgorithm, keyData);
};

exports.composePrivateKey = composePrivateKey;

const decomposePublicKey = publicKeyAsn1 => {
  // Iterate over all supported key types, until one succeeds
  // Construct an errors object along the way with all the failed decode attempts
  let decomposedKey;
  const errors = {};

  for (const keyType of _keys.SUPPORTED_KEY_TYPES.public) {
    try {
      decomposedKey = (0, _keys.decomposeRawPublicKey)(keyType, publicKeyAsn1);
      break;
    } catch (err) {
      /* istanbul ignore else */
      if (err instanceof _errors.DecodeAsn1FailedError) {
        errors[keyType] = err;
      } else {
        throw err;
      }
    }
  }

  if (!decomposedKey) {
    throw new _errors.AggregatedError(`The input key is not one of: ${_keys.SUPPORTED_KEY_TYPES.public.join(', ')}`, errors, {
      invalidInputKey: true
    });
  }

  const {
    keyAlgorithm,
    keyData
  } = decomposedKey;
  return {
    format: 'raw-der',
    keyAlgorithm,
    keyData
  };
};

exports.decomposePublicKey = decomposePublicKey;

const composePublicKey = ({
  keyAlgorithm,
  keyData
}) => (0, _keys.composeRawPublicKey)(keyAlgorithm, keyData);

exports.composePublicKey = composePublicKey;