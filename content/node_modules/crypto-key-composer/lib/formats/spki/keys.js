"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeSubjectPublicKeyInfo = exports.decomposeSubjectPublicKeyInfo = void 0;

var _keys = require("../raw/keys");

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _ec = require("../../util/ec");

var _binary = require("../../util/binary");

var _errors = require("../../util/errors");

var _oids = require("../../util/oids");

var _keyTypes = require("../../util/key-types");

const decomposeRsaSubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const {
    algorithm,
    publicKey: publicKeyAsn1
  } = subjectPublicKeyInfo;
  const keyAlgorithm = {
    id: _oids.OIDS[algorithm.id]
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
      throw new _errors.UnsupportedAlgorithmError('RSA-OAEP keys are not yet supported');

    /* istanbul ignore next */

    case 'rsassa-pss':
      throw new _errors.UnsupportedAlgorithmError('RSA-PSS keys are not yet supported');

    /* istanbul ignore next */

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm OID '${algorithm.id}'`);
  }

  const {
    keyData
  } = (0, _keys.decomposeRsaPublicKey)(publicKeyAsn1.data);
  return {
    keyAlgorithm: {
      id: _oids.OIDS[algorithm.id]
    },
    keyData
  };
};

const composeRsaSubjectPublicKeyInfo = (keyAlgorithm, keyData) => {
  const rsaPublicKeyAsn1 = (0, _keys.composeRsaPublicKey)(keyAlgorithm, keyData);
  return {
    algorithm: {
      id: _oids.FLIPPED_OIDS[keyAlgorithm.id],
      parameters: (0, _binary.hexStringToUint8Array)('0500')
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
  const ecParameters = (0, _asn1Encoder.decodeAsn1)(algorithm.parameters, _asn1Entities.EcParameters); // Validate parameters

  /* istanbul ignore if */

  if (ecParameters.type !== 'namedCurve') {
    throw new _errors.UnsupportedAlgorithmError('Only EC named curves are supported');
  } // Ensure that the named curve is supported


  const namedCurve = _oids.OIDS[ecParameters.value];

  if (!namedCurve) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve OID '${ecParameters.value}'`);
  } // Validate & get encoded point (public key)


  const {
    x,
    y
  } = (0, _ec.decodeEcPoint)(namedCurve, publicKey.data);
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
  const namedCurveOid = _oids.FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Encode point (public key)


  const encodedPoint = (0, _ec.encodeEcPoint)(keyAlgorithm.namedCurve, keyData.x, keyData.y);
  const ecParametersAsn1 = (0, _asn1Encoder.encodeAsn1)({
    type: 'namedCurve',
    value: namedCurveOid
  }, _asn1Entities.EcParameters);
  return {
    algorithm: {
      id: _oids.FLIPPED_OIDS[keyAlgorithm.id],
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
      id: _oids.OIDS[algorithm.id]
    },
    keyData: {
      bytes: publicKey.data
    }
  };
};

const composeEd25519SubjectPublicKeyInfo = (keyAlgorithm, keyData) => ({
  algorithm: {
    id: _oids.FLIPPED_OIDS[keyAlgorithm.id]
  },
  publicKey: {
    unused: 0,
    data: keyData.bytes
  }
});

const decomposeSubjectPublicKeyInfo = subjectPublicKeyInfo => {
  const keyType = _keyTypes.KEY_TYPES[_oids.OIDS[subjectPublicKeyInfo.algorithm.id]];

  switch (keyType) {
    case 'rsa':
      return decomposeRsaSubjectPublicKeyInfo(subjectPublicKeyInfo);

    case 'ec':
      return decomposeEcSubjectPublicKeyInfo(subjectPublicKeyInfo);

    case 'ed25519':
      return decomposeEd25519SubjectPublicKeyInfo(subjectPublicKeyInfo);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm OID '${subjectPublicKeyInfo.algorithm.id}'`);
  }
};

exports.decomposeSubjectPublicKeyInfo = decomposeSubjectPublicKeyInfo;

const composeSubjectPublicKeyInfo = (keyAlgorithm, keyData) => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaSubjectPublicKeyInfo(keyAlgorithm, keyData);

    case 'ec':
      return composeEcSubjectPublicKeyInfo(keyAlgorithm, keyData);

    case 'ed25519':
      return composeEd25519SubjectPublicKeyInfo(keyAlgorithm, keyData);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};

exports.composeSubjectPublicKeyInfo = composeSubjectPublicKeyInfo;