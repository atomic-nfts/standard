import { maybeDecryptPemBody, maybeEncryptPemBody } from '../raw/encryption';
import { decomposePrivateKey as decomposeDerPrivateKey, composePrivateKey as composeDerPrivateKey } from './pkcs1-der';
import { decodePem, encodePem } from '../../util/pem-encoder';
import { uint8ArrayToBinaryString } from '../../util/binary';
import { DecodePemFailedError } from '../../util/errors';
export const decomposePrivateKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = decodePem(pem, 'RSA PRIVATE KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof DecodePemFailedError;
    throw err;
  }

  const {
    pemBody: pkcs1Key,
    encryptionAlgorithm
  } = maybeDecryptPemBody(decodedPem, options.password);
  const decomposedKey = decomposeDerPrivateKey(pkcs1Key, options);
  decomposedKey.encryptionAlgorithm = encryptionAlgorithm;
  decomposedKey.format = 'pkcs1-pem';
  return decomposedKey;
};
export const composePrivateKey = ({
  encryptionAlgorithm,
  ...decomposedKey
}, options) => {
  const pkcs1Key = composeDerPrivateKey(decomposedKey, options);
  const {
    pemBody,
    pemHeaders
  } = maybeEncryptPemBody(pkcs1Key, encryptionAlgorithm, options.password);
  return encodePem({
    type: 'RSA PRIVATE KEY',
    body: uint8ArrayToBinaryString(pemBody),
    ...pemHeaders
  });
};