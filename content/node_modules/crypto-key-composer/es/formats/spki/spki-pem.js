import { decomposePublicKey as decomposeDerPublicKey, composePublicKey as composeDerPublicKey } from './spki-der';
import { binaryStringToUint8Array, uint8ArrayToBinaryString } from '../../util/binary';
import { decodePem, encodePem } from '../../util/pem-encoder';
import { DecodePemFailedError } from '../../util/errors';
export const decomposePublicKey = (pem, options) => {
  let decodedPem;

  try {
    decodedPem = decodePem(pem, 'PUBLIC KEY');
  } catch (err) {
    err.invalidInputKey = err instanceof DecodePemFailedError;
    throw err;
  }

  const spkiKey = binaryStringToUint8Array(decodedPem.body);
  const decomposedKey = decomposeDerPublicKey(spkiKey, options);
  decomposedKey.format = 'spki-pem';
  return decomposedKey;
};
export const composePublicKey = decomposedKey => {
  const spkiKey = composeDerPublicKey(decomposedKey);
  return encodePem({
    type: 'PUBLIC KEY',
    body: uint8ArrayToBinaryString(spkiKey)
  });
};