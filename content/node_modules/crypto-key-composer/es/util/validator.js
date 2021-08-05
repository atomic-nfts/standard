import _isPlainObject from "lodash/isPlainObject";
import { binaryStringToUint8Array, typedArrayToUint8Array } from './binary';
import { KEY_ALIASES } from './key-types';
import { UnexpectedTypeError, UnsupportedFormatError } from './errors';
export const validateInputKey = input => {
  // Support strings
  if (typeof input === 'string') {
    return binaryStringToUint8Array(input);
  } // Support array buffer or typed arrays


  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  if (ArrayBuffer.isView(input)) {
    return typedArrayToUint8Array(input);
  }

  throw new UnexpectedTypeError('Expecting input key to be one of: Uint8Array, ArrayBuffer, string');
};
export const validateFormat = (format, supportedFormats) => {
  if (typeof format !== 'string') {
    throw new UnexpectedTypeError('Expecting format to be a string');
  }

  if (!supportedFormats[format]) {
    throw new UnsupportedFormatError(format);
  }

  return format;
};

const validateAlgorithmIdentifier = (algorithmIdentifier, errorContext) => {
  if (typeof algorithmIdentifier === 'string') {
    algorithmIdentifier = {
      id: algorithmIdentifier
    };
  }

  if (!_isPlainObject(algorithmIdentifier)) {
    throw new UnexpectedTypeError(`Expecting ${errorContext} to be an object`);
  }

  if (typeof algorithmIdentifier.id !== 'string') {
    throw new UnexpectedTypeError(`Expecting ${errorContext} id to be a string`);
  }

  return algorithmIdentifier;
};

export const validateDecomposedKey = (decomposedKey, supportedFormats) => {
  if (!decomposedKey || !_isPlainObject(decomposedKey)) {
    throw new UnexpectedTypeError('Expecting decomposed key to be an object');
  }

  decomposedKey = { ...decomposedKey
  };
  decomposedKey.format = validateFormat(decomposedKey.format, supportedFormats);
  decomposedKey.keyAlgorithm = validateAlgorithmIdentifier(decomposedKey.keyAlgorithm, 'key algorithm'); // Allow key algorithm to be an alias

  const aliasedKeyAlgorithm = KEY_ALIASES[decomposedKey.keyAlgorithm.id];

  if (aliasedKeyAlgorithm) {
    decomposedKey.keyAlgorithm = { ...aliasedKeyAlgorithm,
      ...decomposedKey.keyAlgorithm,
      id: aliasedKeyAlgorithm.id
    };
  }

  if (!_isPlainObject(decomposedKey.keyData)) {
    throw new UnexpectedTypeError('Expecting key data to be an object');
  }

  if (decomposedKey.encryptionAlgorithm && !_isPlainObject(decomposedKey.encryptionAlgorithm)) {
    throw new UnexpectedTypeError('Expecting encryption algorithm to be an object');
  }

  return decomposedKey;
};
export const validateEncryptionAlgorithm = (encryptionAlgorithm, defaultKeyDerivationFunc, defaultEncryptionScheme) => {
  encryptionAlgorithm = encryptionAlgorithm || {};
  return {
    keyDerivationFunc: validateAlgorithmIdentifier(encryptionAlgorithm.keyDerivationFunc || defaultKeyDerivationFunc, 'key derivation func'),
    encryptionScheme: validateAlgorithmIdentifier(encryptionAlgorithm.encryptionScheme || defaultEncryptionScheme, 'encryption scheme')
  };
};