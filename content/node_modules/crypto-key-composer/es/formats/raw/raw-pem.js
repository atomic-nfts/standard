import { maybeDecryptPemBody, maybeEncryptPemBody } from './encryption';
import { decomposeRawPrivateKey, composeRawPrivateKey, decomposeRawPublicKey, composeRawPublicKey } from './keys';
import { uint8ArrayToBinaryString, binaryStringToUint8Array } from '../../util/binary';
import { decodePem, encodePem } from '../../util/pem-encoder';
import { DecodePemFailedError, UnsupportedAlgorithmError } from '../../util/errors';
import { KEY_TYPES } from '../../util/key-types';

const getKeyType = pemType => {
  const match = /^(\S+?) (PUBLIC|PRIVATE) KEY$/.exec(pemType);
  return match && match[1].toLocaleLowerCase();
};

const getPemType = keyAlgorithm => {
  const keyType = KEY_TYPES[keyAlgorithm.id];
  return keyType && keyType.toUpperCase();
};

export const decomposePrivateKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = decodePem(pem, '* PRIVATE KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof DecodePemFailedError;
    throw err;
  } // Decrypt pem if encrypted


  const {
    pemBody,
    encryptionAlgorithm
  } = maybeDecryptPemBody(decodedPem, options.password); // Extract the key type from it

  const keyType = getKeyType(decodedPem.type);
  /* istanbul ignore if */

  if (!keyType) {
    throw new DecodePemFailedError('Unable to extract key type from PEM', {
      invalidInputKey: true
    });
  } // Finally decompose the key within it


  const {
    keyAlgorithm,
    keyData
  } = decomposeRawPrivateKey(keyType, pemBody);
  return {
    format: 'raw-pem',
    keyAlgorithm,
    keyData,
    encryptionAlgorithm
  };
};
export const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}, options) => {
  // Compose the key
  const rawKey = composeRawPrivateKey(keyAlgorithm, keyData); // Extract the pem type

  const pemKeyType = getPemType(keyAlgorithm);
  /* istanbul ignore if */

  if (!pemKeyType) {
    throw new UnsupportedAlgorithmError('Unable to extract pem type from key algorithm');
  } // Encrypt pem if password was specified


  const {
    pemBody,
    pemHeaders
  } = maybeEncryptPemBody(rawKey, encryptionAlgorithm, options.password); // Finally build pem

  return encodePem({
    type: `${pemKeyType} PRIVATE KEY`,
    body: uint8ArrayToBinaryString(pemBody),
    ...pemHeaders
  });
};
export const decomposePublicKey = pem => {
  // Decode pem
  let decodedPem;

  try {
    decodedPem = decodePem(pem);
  } catch (err) {
    err.invalidInputKey = err instanceof DecodePemFailedError;
    throw err;
  } // Extract the key type from it


  const keyType = getKeyType(decodedPem.type);
  /* istanbul ignore if */

  if (!keyType) {
    throw new DecodePemFailedError('Unable to extract key type from PEM', {
      invalidInputKey: true
    });
  } // Finally decompose the key within it


  const pemBody = binaryStringToUint8Array(decodedPem.body);
  const {
    keyAlgorithm,
    keyData
  } = decomposeRawPublicKey(keyType, pemBody);
  return {
    format: 'raw-pem',
    keyAlgorithm,
    keyData
  };
};
export const composePublicKey = ({
  keyAlgorithm,
  keyData
}) => {
  // Compose the key
  const rawKey = composeRawPublicKey(keyAlgorithm, keyData); // Extract the pem type

  const pemKeyType = getPemType(keyAlgorithm);
  /* istanbul ignore if */

  if (!pemKeyType) {
    throw new UnsupportedAlgorithmError('Unable to extract pem type from key algorithm');
  } // Finally build pem


  return encodePem({
    type: `${pemKeyType} PUBLIC KEY`,
    body: uint8ArrayToBinaryString(rawKey)
  });
};