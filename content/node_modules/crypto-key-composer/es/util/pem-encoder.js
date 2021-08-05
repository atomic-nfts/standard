import matcher from 'matcher';
import { encode, decode } from 'node-forge/lib/pem';
import { DecodePemFailedError, EncodePemFailedError } from './errors';
import { uint8ArrayToBinaryString } from './binary';
export const decodePem = (pem, patterns) => {
  if (pem instanceof Uint8Array) {
    pem = uint8ArrayToBinaryString(pem);
  }

  let decodedPem;

  try {
    decodedPem = decode(pem);
  } catch (err) {
    throw new DecodePemFailedError('Failed to decode PEM', {
      originalError: err
    });
  }

  if (!patterns) {
    return decodedPem[0];
  } // Match pem message against the patterns


  patterns = Array.isArray(patterns) ? patterns : [patterns];
  const pemMessage = decodedPem.find(msg => matcher([msg.type], patterns, {
    caseSensitive: true
  }).length > 0);

  if (!pemMessage) {
    throw new DecodePemFailedError(`Could not find pem message matching patterns: '${patterns.join('\', \'')}'`);
  }

  return pemMessage;
};
export const encodePem = decodedPem => {
  let pem;

  try {
    pem = encode(decodedPem);
  } catch (err) {
    /* istanbul ignore next */
    throw new EncodePemFailedError('Failed to encode PEM', {
      originalError: err
    });
  }

  pem = pem.replace(/\r/g, '');
  return pem;
};