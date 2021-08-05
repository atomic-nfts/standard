"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateEncryptionAlgorithm = exports.validateDecomposedKey = exports.validateFormat = exports.validateInputKey = void 0;

var _isPlainObject2 = _interopRequireDefault(require("lodash/isPlainObject"));

var _binary = require("./binary");

var _keyTypes = require("./key-types");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validateInputKey = input => {
  // Support strings
  if (typeof input === 'string') {
    return (0, _binary.binaryStringToUint8Array)(input);
  } // Support array buffer or typed arrays


  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  if (ArrayBuffer.isView(input)) {
    return (0, _binary.typedArrayToUint8Array)(input);
  }

  throw new _errors.UnexpectedTypeError('Expecting input key to be one of: Uint8Array, ArrayBuffer, string');
};

exports.validateInputKey = validateInputKey;

const validateFormat = (format, supportedFormats) => {
  if (typeof format !== 'string') {
    throw new _errors.UnexpectedTypeError('Expecting format to be a string');
  }

  if (!supportedFormats[format]) {
    throw new _errors.UnsupportedFormatError(format);
  }

  return format;
};

exports.validateFormat = validateFormat;

const validateAlgorithmIdentifier = (algorithmIdentifier, errorContext) => {
  if (typeof algorithmIdentifier === 'string') {
    algorithmIdentifier = {
      id: algorithmIdentifier
    };
  }

  if (!(0, _isPlainObject2.default)(algorithmIdentifier)) {
    throw new _errors.UnexpectedTypeError(`Expecting ${errorContext} to be an object`);
  }

  if (typeof algorithmIdentifier.id !== 'string') {
    throw new _errors.UnexpectedTypeError(`Expecting ${errorContext} id to be a string`);
  }

  return algorithmIdentifier;
};

const validateDecomposedKey = (decomposedKey, supportedFormats) => {
  if (!decomposedKey || !(0, _isPlainObject2.default)(decomposedKey)) {
    throw new _errors.UnexpectedTypeError('Expecting decomposed key to be an object');
  }

  decomposedKey = { ...decomposedKey
  };
  decomposedKey.format = validateFormat(decomposedKey.format, supportedFormats);
  decomposedKey.keyAlgorithm = validateAlgorithmIdentifier(decomposedKey.keyAlgorithm, 'key algorithm'); // Allow key algorithm to be an alias

  const aliasedKeyAlgorithm = _keyTypes.KEY_ALIASES[decomposedKey.keyAlgorithm.id];

  if (aliasedKeyAlgorithm) {
    decomposedKey.keyAlgorithm = { ...aliasedKeyAlgorithm,
      ...decomposedKey.keyAlgorithm,
      id: aliasedKeyAlgorithm.id
    };
  }

  if (!(0, _isPlainObject2.default)(decomposedKey.keyData)) {
    throw new _errors.UnexpectedTypeError('Expecting key data to be an object');
  }

  if (decomposedKey.encryptionAlgorithm && !(0, _isPlainObject2.default)(decomposedKey.encryptionAlgorithm)) {
    throw new _errors.UnexpectedTypeError('Expecting encryption algorithm to be an object');
  }

  return decomposedKey;
};

exports.validateDecomposedKey = validateDecomposedKey;

const validateEncryptionAlgorithm = (encryptionAlgorithm, defaultKeyDerivationFunc, defaultEncryptionScheme) => {
  encryptionAlgorithm = encryptionAlgorithm || {};
  return {
    keyDerivationFunc: validateAlgorithmIdentifier(encryptionAlgorithm.keyDerivationFunc || defaultKeyDerivationFunc, 'key derivation func'),
    encryptionScheme: validateAlgorithmIdentifier(encryptionAlgorithm.encryptionScheme || defaultEncryptionScheme, 'encryption scheme')
  };
};

exports.validateEncryptionAlgorithm = validateEncryptionAlgorithm;