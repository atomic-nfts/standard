"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKeyTypeFromAlgorithm = exports.composePublicKey = exports.composePrivateKey = exports.decomposePublicKey = exports.decomposePrivateKey = void 0;

var _formats = require("./formats");

var _validator = require("./util/validator");

var _errors = require("./util/errors");

var _keyTypes = require("./util/key-types");

const decomposeKey = (supportedFormats, inputKey, options) => {
  inputKey = (0, _validator.validateInputKey)(inputKey);

  if (!Array.isArray(options.format)) {
    const format = (0, _validator.validateFormat)(options.format, supportedFormats);
    return supportedFormats[format].decomposeKey(inputKey, options);
  }

  const formats = options.format.map(format => (0, _validator.validateFormat)(format, supportedFormats)); // Attempt to decompose the keys, until one succeeds
  // Along the way, we collect the errors for each format

  const errors = {};
  let decomposeKey;

  for (const format of formats) {
    try {
      decomposeKey = supportedFormats[format].decomposeKey(inputKey, options);
      break;
    } catch (err) {
      // Skip if the error is marked as `invalidInputKey`
      if (err.invalidInputKey) {
        errors[format] = err;
        continue;
      }

      err.format = format;
      throw err;
    }
  }

  if (!decomposeKey) {
    throw new _errors.AggregatedError('No format was able to recognize the input key', errors);
  }

  return decomposeKey;
};

const composeKey = (supportedFormats, decomposedKey, options) => {
  decomposedKey = (0, _validator.validateDecomposedKey)(decomposedKey, supportedFormats);
  return supportedFormats[decomposedKey.format].composeKey(decomposedKey, options);
};

const decomposePrivateKey = (inputKey, options) => decomposeKey(_formats.PRIVATE_FORMATS, inputKey, {
  password: null,
  format: _formats.DEFAULT_PRIVATE_FORMATS,
  ...options
});

exports.decomposePrivateKey = decomposePrivateKey;

const decomposePublicKey = (inputKey, options) => decomposeKey(_formats.PUBLIC_FORMATS, inputKey, {
  password: null,
  format: _formats.DEFAULT_PUBLIC_FORMATS,
  ...options
});

exports.decomposePublicKey = decomposePublicKey;

const composePrivateKey = (decomposedKey, options) => composeKey(_formats.PRIVATE_FORMATS, decomposedKey, {
  password: null,
  ...options
});

exports.composePrivateKey = composePrivateKey;

const composePublicKey = decomposedKey => composeKey(_formats.PUBLIC_FORMATS, decomposedKey, {});

exports.composePublicKey = composePublicKey;

const getKeyTypeFromAlgorithm = keyAlgorithm => {
  const keyAlgorithmId = typeof keyAlgorithm === 'string' ? keyAlgorithm : keyAlgorithm && keyAlgorithm.id;
  return _keyTypes.KEY_TYPES[keyAlgorithmId];
};

exports.getKeyTypeFromAlgorithm = getKeyTypeFromAlgorithm;