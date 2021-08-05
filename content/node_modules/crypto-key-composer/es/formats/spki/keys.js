import { decomposeRsaPublicKey, composeRsaPublicKey } from '../raw/keys';
import { decodeAsn1, encodeAsn1 } from '../../util/asn1-encoder';
import { EcParameters } from '../../util/asn1-entities';
import { decodeEcPoint, encodeEcPoint } from '../../util/ec';
import { hexStringToUint8Array } from '../../util/binary';
import { UnsupportedAlgorithmError } from '../../util/errors';
import { OIDS, FLIPPED_OIDS } from '../../util/oids';
import { KEY_TYPES } from '../../util/key-types';

const decomposeRsaSubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const {
    algorithm,
    publicKey: publicKeyAsn1
  } = subjectPublicKeyInfo;
  const keyAlgorithm = {
    id: OIDS[algorithm.id]
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
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm OID '${algorithm.id}'`);
  }

  const {
    keyData
  } = decomposeRsaPublicKey(publicKeyAsn1.data);
  return {
    keyAlgorithm: {
      id: OIDS[algorithm.id]
    },
    keyData
  };
};

const composeRsaSubjectPublicKeyInfo = (keyAlgorithm, keyData) => {
  const rsaPublicKeyAsn1 = composeRsaPublicKey(keyAlgorithm, keyData);
  return {
    algorithm: {
      id: FLIPPED_OIDS[keyAlgorithm.id],
      parameters: hexStringToUint8Array('0500')
    },
    publicKey: {
      unused: 0,
      data: rsaPublicKeyAsn1
    }
  };
};

const decomposeEcSubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const {
    algorithm,
    publicKey
  } = subjectPublicKeyInfo;
  const ecParameters = decodeAsn1(algorithm.parameters, EcParameters); // Validate parameters

  /* istanbul ignore if */

  if (ecParameters.type !== 'namedCurve') {
    throw new UnsupportedAlgorithmError('Only EC named curves are supported');
  } // Ensure that the named curve is supported


  const namedCurve = OIDS[ecParameters.value];

  if (!namedCurve) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve OID '${ecParameters.value}'`);
  } // Validate & get encoded point (public key)


  const {
    x,
    y
  } = decodeEcPoint(namedCurve, publicKey.data);
  return {
    keyAlgorithm: {
      id: 'ec-public-key',
      namedCurve
    },
    keyData: {
      x,
      y
    }
  };
};

const composeEcSubjectPublicKeyInfo = (keyAlgorithm, keyData) => {
  // Validate named curve
  const namedCurveOid = FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Encode point (public key)


  const encodedPoint = encodeEcPoint(keyAlgorithm.namedCurve, keyData.x, keyData.y);
  const ecParametersAsn1 = encodeAsn1({
    type: 'namedCurve',
    value: namedCurveOid
  }, EcParameters);
  return {
    algorithm: {
      id: FLIPPED_OIDS[keyAlgorithm.id],
      parameters: ecParametersAsn1
    },
    publicKey: {
      unused: 0,
      data: encodedPoint
    }
  };
};

const decomposeEd25519SubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const {
    algorithm,
    publicKey
  } = subjectPublicKeyInfo;
  return {
    keyAlgorithm: {
      id: OIDS[algorithm.id]
    },
    keyData: {
      bytes: publicKey.data
    }
  };
};

const composeEd25519SubjectPublicKeyInfo = (keyAlgorithm, keyData) => ({
  algorithm: {
    id: FLIPPED_OIDS[keyAlgorithm.id]
  },
  publicKey: {
    unused: 0,
    data: keyData.bytes
  }
});

export const decomposeSubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const keyType = KEY_TYPES[OIDS[subjectPublicKeyInfo.algorithm.id]];

  switch (keyType) {
    case 'rsa':
      return decomposeRsaSubjectPublicKeyInfo(subjectPublicKeyInfo);

    case 'ec':
      return decomposeEcSubjectPublicKeyInfo(subjectPublicKeyInfo);

    case 'ed25519':
      return decomposeEd25519SubjectPublicKeyInfo(subjectPublicKeyInfo);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm OID '${subjectPublicKeyInfo.algorithm.id}'`);
  }
};
export const composeSubjectPublicKeyInfo = (keyAlgorithm, keyData) => {
  const keyType = KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaSubjectPublicKeyInfo(keyAlgorithm, keyData);

    case 'ec':
      return composeEcSubjectPublicKeyInfo(keyAlgorithm, keyData);

    case 'ed25519':
      return composeEd25519SubjectPublicKeyInfo(keyAlgorithm, keyData);

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};