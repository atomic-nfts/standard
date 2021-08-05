import { PRIVATE_FORMATS, PUBLIC_FORMATS, DEFAULT_PRIVATE_FORMATS, DEFAULT_PUBLIC_FORMATS } from './formats';
import { validateInputKey, validateFormat, validateDecomposedKey } from './util/validator';
import { AggregatedError } from './util/errors';
import { KEY_TYPES } from './util/key-types';

const decomposeKey = (supportedFormats, inputKey, options) => {
  inputKey = validateInputKey(inputKey);

  if (!Array.isArray(options.format)) {
    const format = validateFormat(options.format, supportedFormats);
    return supportedFormats[format].decomposeKey(inputKey, options);
  }

  const formats = options.format.map(format => validateFormat(format, supportedFormats)); // Attempt to decompose the keys, until one succeeds
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
    throw new AggregatedError('No format was able to recognize the input key', errors);
  }

  return decomposeKey;
};

const composeKey = (supportedFormats, decomposedKey, options) => {
  decomposedKey = validateDecomposedKey(decomposedKey, supportedFormats);
  return supportedFormats[decomposedKey.format].composeKey(decomposedKey, options);
};

export const decomposePrivateKey = (inputKey, options) => decomposeKey(PRIVATE_FORMATS, inputKey, {
  password: null,
  format: DEFAULT_PRIVATE_FORMATS,
  ...options
});
export const decomposePublicKey = (inputKey, options) => decomposeKey(PUBLIC_FORMATS, inputKey, {
  password: null,
  format: DEFAULT_PUBLIC_FORMATS,
  ...options
});
export const composePrivateKey = (decomposedKey, options) => composeKey(PRIVATE_FORMATS, decomposedKey, {
  password: null,
  ...options
});
export const composePublicKey = decomposedKey => composeKey(PUBLIC_FORMATS, decomposedKey, {});
export const getKeyTypeFromAlgorithm = keyAlgorithm => {
  const keyAlgorithmId = typeof keyAlgorithm === 'string' ? keyAlgorithm : keyAlgorithm && keyAlgorithm.id;
  return KEY_TYPES[keyAlgorithmId];
};