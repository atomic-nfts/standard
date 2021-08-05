import { decomposeRsaPrivateKey, composeRsaPrivateKey } from '../raw/keys';
import { decodeAsn1, encodeAsn1 } from '../../util/asn1-encoder';
import { EcParameters, EcPrivateKey, CurvePrivateKey } from '../../util/asn1-entities';
import { decodeEcPoint, encodeEcPoint, validateEcD } from '../../util/ec';
import { hexStringToUint8Array } from '../../util/binary';
import { UnsupportedAlgorithmError } from '../../util/errors';
import { OIDS, FLIPPED_OIDS } from '../../util/oids';
import { KEY_TYPES } from '../../util/key-types';

const decomposeRsaPrivateKeyInfo = privateKeyInfo => {
  const {
    privateKeyAlgorithm,
    privateKey: privateKeyAsn1
  } = privateKeyInfo;
  const keyAlgorithm = {
    id: OIDS[privateKeyAlgorithm.id]
  };

  switch (keyAlgorithm.id) {
    case 'rsa-encryption':
    case 'md2-with-rsa-encryption':
    case 'md4-with-rsa-encryption':
    case 'md5-with-rsa-encryption':
    case 'sha1-with-rsa-encryption':
    case 'sha224-with-rsa-encryption':
    case 'sha256-with-rsa-encryption':
    case 'sha384-with-rsa-encryption':
    case 'sha512-with-rsa-encryption':
    case 'sha512-224-with-rsa-encryption':
    case 'sha512-256-with-rsa-encryption':
      break;

    /* istanbul ignore next */

    case 'rsaes-oaep':
      throw new UnsupportedAlgorithmError('RSA-OAEP keys are not yet supported');

    /* istanbul ignore next */

    case 'rsassa-pss':
      throw new UnsupportedAlgorithmError('RSA-PSS keys are not yet supported');

    /* istanbul ignore next */

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm OID '${privateKeyAlgorithm.id}'`);
  }

  const {
    keyData
  } = decomposeRsaPrivateKey(privateKeyAsn1);
  return {
    keyAlgorithm: {
      id: OIDS[privateKeyAlgorithm.id]
    },
    keyData
  };
};

const composeRsaPrivateKeyInfo = (keyAlgorithm, keyData) => {
  const rsaPrivateKeyAsn1 = composeRsaPrivateKey(keyAlgorithm, keyData);
  return {
    version: 0,
    privateKeyAlgorithm: {
      id: FLIPPED_OIDS[keyAlgorithm.id],
      parameters: hexStringToUint8Array('0500')
    },
    privateKey: rsaPrivateKeyAsn1
  };
};

const decomposeEcPrivateKeyInfo = privateKeyInfo => {
  const {
    privateKeyAlgorithm,
    privateKey: privateKeyAsn1
  } = privateKeyInfo;
  const ecParameters = decodeAsn1(privateKeyAlgorithm.parameters, EcParameters);
  const ecPrivateKey = decodeAsn1(privateKeyAsn1, EcPrivateKey); // Validate parameters & publicKey

  /* istanbul ignore if */

  if (ecParameters.type !== 'namedCurve') {
    throw new UnsupportedAlgorithmError('Only EC named curves are supported');
  }
  /* istanbul ignore if */


  if (!ecPrivateKey.publicKey) {
    throw new UnsupportedAlgorithmError('Missing publicKey from ECPrivateKey');
  } // Ensure that the named curve is supported


  const namedCurve = OIDS[ecParameters.value];

  if (!namedCurve) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve OID '${ecParameters.value}'`);
  } // Validate & get encoded point


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

const composeEcPrivateKeyInfo = (keyAlgorithm, keyData) => {
  // Validate named curve
  const namedCurveOid = FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Validate D value (private key)


  const privateKey = validateEcD(keyAlgorithm.namedCurve, keyData.d); // Validate & encode point (public key)

  const publicKey = encodeEcPoint(keyAlgorithm.namedCurve, keyData.x, keyData.y);
  const ecPrivateKey = {
    version: 1,
    privateKey,
    publicKey: {
      unused: 0,
      data: publicKey
    }
  };
  const ecPrivateKeyAsn1 = encodeAsn1(ecPrivateKey, EcPrivateKey);
  const ecParametersAsn1 = encodeAsn1({
    type: 'namedCurve',
    value: namedCurveOid
  }, EcParameters);
  return {
    version: 0,
    privateKeyAlgorithm: {
      id: FLIPPED_OIDS[keyAlgorithm.id],
      parameters: ecParametersAsn1
    },
    privateKey: ecPrivateKeyAsn1
  };
};

const decomposeEd25519PrivateKeyInfo = privateKeyInfo => {
  // See: https://tools.ietf.org/html/rfc8032#section-5.1.5
  const {
    privateKeyAlgorithm,
    privateKey
  } = privateKeyInfo;
  const seed = decodeAsn1(privateKey, CurvePrivateKey);
  return {
    keyAlgorithm: {
      id: OIDS[privateKeyAlgorithm.id]
    },
    keyData: {
      seed
    }
  };
};

const composeEd25519PrivateKeyInfo = (keyAlgorithm, keyData) => ({
  version: 0,
  privateKeyAlgorithm: {
    id: FLIPPED_OIDS[keyAlgorithm.id]
  },
  privateKey: encodeAsn1(keyData.seed, CurvePrivateKey)
});

export const decomposePrivateKeyInfo = privateKeyInfo => {
  const keyType = KEY_TYPES[OIDS[privateKeyInfo.privateKeyAlgorithm.id]];

  switch (keyType) {
    case 'rsa':
      return decomposeRsaPrivateKeyInfo(privateKeyInfo);

    case 'ec':
      return decomposeEcPrivateKeyInfo(privateKeyInfo);

    case 'ed25519':
      return decomposeEd25519PrivateKeyInfo(privateKeyInfo);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm OID '${privateKeyInfo.privateKeyAlgorithm.id}'`);
  }
};
export const composePrivateKeyInfo = (keyAlgorithm, keyData) => {
  const keyType = KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPrivateKeyInfo(keyAlgorithm, keyData);

    case 'ec':
      return composeEcPrivateKeyInfo(keyAlgorithm, keyData);

    case 'ed25519':
      return composeEd25519PrivateKeyInfo(keyAlgorithm, keyData);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};