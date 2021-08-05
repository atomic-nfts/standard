import { decomposeRsaPrivateKey, composeRsaPrivateKey } from '../raw/keys';
import { UnsupportedAlgorithmError, DecodeAsn1FailedError } from '../../util/errors';
import { KEY_TYPES } from '../../util/key-types';
export const decomposePrivateKey = rsaPrivateKeyAsn1 => {
  let decomposedRsaKey;

  try {
    decomposedRsaKey = decomposeRsaPrivateKey(rsaPrivateKeyAsn1);
  } catch (err) {
    err.invalidInputKey = err instanceof DecodeAsn1FailedError;
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
export const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}) => {
  const keyType = KEY_TYPES[keyAlgorithm.id];

  if (keyType !== 'rsa') {
    throw new UnsupportedAlgorithmError('The key algorithm id for PKCS1 must be one of RSA\'s');
  }

  if (encryptionAlgorithm) {
    throw new UnsupportedAlgorithmError('The PKCS1 DER format does not support encryption');
  }

  return composeRsaPrivateKey(keyAlgorithm, keyData);
};