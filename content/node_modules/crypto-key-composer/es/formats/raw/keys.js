import { decodeAsn1, encodeAsn1 } from '../../util/asn1-encoder';
import { RsaPrivateKey, RsaPublicKey, EcPrivateKey } from '../../util/asn1-entities';
import { decodeEcPoint, encodeEcPoint, validateEcD } from '../../util/ec';
import { UnsupportedAlgorithmError } from '../../util/errors';
import { OIDS, FLIPPED_OIDS } from '../../util/oids';
import { KEY_TYPES } from '../../util/key-types';
export const SUPPORTED_KEY_TYPES = {
  private: ['rsa', 'ec'],
  public: ['rsa']
};
export const decomposeRsaPrivateKey = rsaPrivateKeyAsn1 => {
  const {
    version,
    ...keyData
  } = decodeAsn1(rsaPrivateKeyAsn1, RsaPrivateKey);
  return {
    keyAlgorithm: {
      id: 'rsa-encryption'
    },
    keyData
  };
};
export const composeRsaPrivateKey = (keyAlgorithm, keyData) => {
  const otherPrimeInfos = keyData.otherPrimeInfos;
  const hasMultiplePrimes = otherPrimeInfos && otherPrimeInfos.length > 0;
  const rsaPrivateKey = { ...keyData,
    version: hasMultiplePrimes ? 1 : 0,
    otherPrimeInfos: hasMultiplePrimes ? otherPrimeInfos : undefined
  };
  return encodeAsn1(rsaPrivateKey, RsaPrivateKey);
};
export const decomposeRsaPublicKey = rsaPublicKeyAsn1 => {
  const {
    version,
    ...keyData
  } = decodeAsn1(rsaPublicKeyAsn1, RsaPublicKey);
  return {
    keyAlgorithm: {
      id: 'rsa-encryption'
    },
    keyData
  };
};
export const composeRsaPublicKey = (keyAlgorithm, keyData) => encodeAsn1(keyData, RsaPublicKey);
export const decomposeEcPrivateKey = ecPrivateKeyAsn1 => {
  const ecPrivateKey = decodeAsn1(ecPrivateKeyAsn1, EcPrivateKey); // Validate parameters & publicKey

  /* istanbul ignore if */

  if (!ecPrivateKey.parameters) {
    throw new UnsupportedAlgorithmError('Missing parameters from ECPrivateKey');
  }
  /* istanbul ignore if */


  if (ecPrivateKey.parameters.type !== 'namedCurve') {
    throw new UnsupportedAlgorithmError('Only EC named curves are supported');
  }
  /* istanbul ignore if */


  if (!ecPrivateKey.publicKey) {
    throw new UnsupportedAlgorithmError('Missing publicKey from ECPrivateKey');
  } // Ensure that the named curve is supported


  const namedCurve = OIDS[ecPrivateKey.parameters.value];

  if (!namedCurve) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve OID '${ecPrivateKey.parameters.value}'`);
  } // Validate & encode point (public key)


  const {
    x,
    y
  } = decodeEcPoint(namedCurve, ecPrivateKey.publicKey.data);
  return {
    keyAlgorithm: {
      id: 'ec-public-key',
      namedCurve
    },
    keyData: {
      d: ecPrivateKey.privateKey,
      x,
      y
    }
  };
};
export const composeEcPrivateKey = (keyAlgorithm, keyData) => {
  // Validate named curve
  const namedCurveOid = FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Validate D value (private key)


  const privateKey = validateEcD(keyAlgorithm.namedCurve, keyData.d); // Encode point (public key)

  const publicKey = encodeEcPoint(keyAlgorithm.namedCurve, keyData.x, keyData.y);
  const ecPrivateKey = {
    version: 1,
    privateKey,
    parameters: {
      type: 'namedCurve',
      value: namedCurveOid
    },
    publicKey: {
      unused: 0,
      data: publicKey
    }
  };
  return encodeAsn1(ecPrivateKey, EcPrivateKey);
};
export const decomposeRawPrivateKey = (keyType, privateKeyAsn1) => {
  switch (keyType) {
    case 'rsa':
      return decomposeRsaPrivateKey(privateKeyAsn1);

    case 'ec':
      return decomposeEcPrivateKey(privateKeyAsn1);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key type '${keyType}'`);
  }
};
export const composeRawPrivateKey = (keyAlgorithm, keyData) => {
  const keyType = KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPrivateKey(keyAlgorithm, keyData);

    case 'ec':
      return composeEcPrivateKey(keyAlgorithm, keyData);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};
export const decomposeRawPublicKey = (keyType, publicKeyAsn1) => {
  switch (keyType) {
    case 'rsa':
      return decomposeRsaPublicKey(publicKeyAsn1);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key type '${keyType}'`);
  }
};
export const composeRawPublicKey = (keyAlgorithm, keyData) => {
  const keyType = KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPublicKey(keyAlgorithm, keyData);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};