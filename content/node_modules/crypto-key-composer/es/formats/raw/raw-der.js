import { decomposeRawPrivateKey, composeRawPrivateKey, decomposeRawPublicKey, composeRawPublicKey, SUPPORTED_KEY_TYPES } from './keys';
import { UnsupportedAlgorithmError, DecodeAsn1FailedError, AggregatedError } from '../../util/errors';
export const decomposePrivateKey = privateKeyAsn1 => {
  // Iterate over all supported key types, until one succeeds
  // Construct an errors object along the way with all the failed decode attempts
  let decomposedKey;
  const errors = {};

  for (const keyType of SUPPORTED_KEY_TYPES.private) {
    try {
      decomposedKey = decomposeRawPrivateKey(keyType, privateKeyAsn1);
      break;
    } catch (err) {
      if (err instanceof DecodeAsn1FailedError) {
        errors[keyType] = err;
      } else {
        throw err;
      }
    }
  }

  if (!decomposedKey) {
    throw new AggregatedError(`The input key is not one of: ${SUPPORTED_KEY_TYPES.private.join(', ')}`, errors, {
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
export const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}) => {
  if (encryptionAlgorithm) {
    throw new UnsupportedAlgorithmError('The RAW DER format does not support encryption');
  }

  return composeRawPrivateKey(keyAlgorithm, keyData);
};
export const decomposePublicKey = publicKeyAsn1 => {
  // Iterate over all supported key types, until one succeeds
  // Construct an errors object along the way with all the failed decode attempts
  let decomposedKey;
  const errors = {};

  for (const keyType of SUPPORTED_KEY_TYPES.public) {
    try {
      decomposedKey = decomposeRawPublicKey(keyType, publicKeyAsn1);
      break;
    } catch (err) {
      /* istanbul ignore else */
      if (err instanceof DecodeAsn1FailedError) {
        errors[keyType] = err;
      } else {
        throw err;
      }
    }
  }

  if (!decomposedKey) {
    throw new AggregatedError(`The input key is not one of: ${SUPPORTED_KEY_TYPES.public.join(', ')}`, errors, {
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
export const composePublicKey = ({
  keyAlgorithm,
  keyData
}) => composeRawPublicKey(keyAlgorithm, keyData);