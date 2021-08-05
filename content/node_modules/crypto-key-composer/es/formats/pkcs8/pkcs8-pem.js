import { decomposePrivateKey as decomposeDerPrivateKey, composePrivateKey as composeDerPrivateKey } from './pkcs8-der';
import { binaryStringToUint8Array, uint8ArrayToBinaryString } from '../../util/binary';
import { decodePem, encodePem } from '../../util/pem-encoder';
import { DecodePemFailedError } from '../../util/errors';
export const decomposePrivateKey = (pem, options) => {
  // Decode pem
  let decodedPem;

  try {
    decodedPem = decodePem(pem, ['PRIVATE KEY', 'ENCRYPTED PRIVATE KEY']);
  } catch (err) {
    err.invalidInputKey = err instanceof DecodePemFailedError;
    throw err;
  } // Decompose key using `pkcs8-der`


  const pkcs8Key = binaryStringToUint8Array(decodedPem.body);
  const decomposedKey = decomposeDerPrivateKey(pkcs8Key, options);
  decomposedKey.format = 'pkcs8-pem';
  return decomposedKey;
};
export const composePrivateKey = (decomposedKey, options) => {
  // Compose key using `pkcs8-der`
  const pkcs8Key = composeDerPrivateKey(decomposedKey, options); // Encode pem

  return encodePem({
    type: options.password ? 'ENCRYPTED PRIVATE KEY' : 'PRIVATE KEY',
    body: uint8ArrayToBinaryString(pkcs8Key)
  });
};