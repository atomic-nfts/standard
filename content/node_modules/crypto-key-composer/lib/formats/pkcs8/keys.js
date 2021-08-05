"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePrivateKeyInfo = exports.decomposePrivateKeyInfo = void 0;

var _keys = require("../raw/keys");

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _ec = require("../../util/ec");

var _binary = require("../../util/binary");

var _errors = require("../../util/errors");

var _oids = require("../../util/oids");

var _keyTypes = require("../../util/key-types");

const decomposeRsaPrivateKeyInfo = privateKeyInfo => {
  const {
    privateKeyAlgorithm,
    privateKey: privateKeyAsn1
  } = privateKeyInfo;
  const keyAlgorithm = {
    id: _oids.OIDS[privateKeyAlgorithm.id]
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
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm OID '${privateKeyAlgorithm.id}'`);
  }

  const {
    keyData
  } = (0, _keys.decomposeRsaPrivateKey)(privateKeyAsn1);
  return {
    keyAlgorithm: {
      id: _oids.OIDS[privateKeyAlgorithm.id]
    },
    keyData
  };
};

const composeRsaPrivateKeyInfo = (keyAlgorithm, keyData) => {
  const rsaPrivateKeyAsn1 = (0, _keys.composeRsaPrivateKey)(keyAlgorithm, keyData);
  return {
    version: 0,
    privateKeyAlgorithm: {
      id: _oids.FLIPPED_OIDS[keyAlgorithm.id],
      parameters: (0, _binary.hexStringToUint8Array)('0500')
    },
    privateKey: rsaPrivateKeyAsn1
  };
};

const decomposeEcPrivateKeyInfo = privateKeyInfo => {
  const {
    privateKeyAlgorithm,
    privateKey: privateKeyAsn1
  } = privateKeyInfo;
  const ecParameters = (0, _asn1Encoder.decodeAsn1)(privateKeyAlgorithm.parameters, _asn1Entities.EcParameters);
  const ecPrivateKey = (0, _asn1Encoder.decodeAsn1)(privateKeyAsn1, _asn1Entities.EcPrivateKey); // Validate parameters & publicKey

  /* istanbul ignore if */

  if (ecParameters.type !== 'namedCurve') {
    throw new _errors.UnsupportedAlgorithmError('Only EC named curves are supported');
  }
  /* istanbul ignore if */


  if (!ecPrivateKey.publicKey) {
    throw new _errors.UnsupportedAlgorithmError('Missing publicKey from ECPrivateKey');
  } // Ensure that the named curve is supported


  const namedCurve = _oids.OIDS[ecParameters.value];

  if (!namedCurve) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve OID '${ecParameters.value}'`);
  } // Validate & get encoded point


  const {
    x,
    y
  } = (0, _ec.decodeEcPoint)(namedCurve, ecPrivateKey.publicKey.data);
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
  const namedCurveOid = _oids.FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Validate D value (private key)


  const privateKey = (0, _ec.validateEcD)(keyAlgorithm.namedCurve, keyData.d); // Validate & encode point (public key)

  const publicKey = (0, _ec.encodeEcPoint)(keyAlgorithm.namedCurve, keyData.x, keyData.y);
  const ecPrivateKey = {
    version: 1,
    privateKey,
    publicKey: {
      unused: 0,
      data: publicKey
    }
  };
  const ecPrivateKeyAsn1 = (0, _asn1Encoder.encodeAsn1)(ecPrivateKey, _asn1Entities.EcPrivateKey);
  const ecParametersAsn1 = (0, _asn1Encoder.encodeAsn1)({
    type: 'namedCurve',
    value: namedCurveOid
  }, _asn1Entities.EcParameters);
  return {
    version: 0,
    privateKeyAlgorithm: {
      id: _oids.FLIPPED_OIDS[keyAlgorithm.id],
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
  const seed = (0, _asn1Encoder.decodeAsn1)(privateKey, _asn1Entities.CurvePrivateKey);
  return {
    keyAlgorithm: {
      id: _oids.OIDS[privateKeyAlgorithm.id]
    },
    keyData: {
      seed
    }
  };
};

const composeEd25519PrivateKeyInfo = (keyAlgorithm, keyData) => ({
  version: 0,
  privateKeyAlgorithm: {
    id: _oids.FLIPPED_OIDS[keyAlgorithm.id]
  },
  privateKey: (0, _asn1Encoder.encodeAsn1)(keyData.seed, _asn1Entities.CurvePrivateKey)
});

const decomposePrivateKeyInfo = privateKeyInfo => {
  const keyType = _keyTypes.KEY_TYPES[_oids.OIDS[privateKeyInfo.privateKeyAlgorithm.id]];

  switch (keyType) {
    case 'rsa':
      return decomposeRsaPrivateKeyInfo(privateKeyInfo);

    case 'ec':
      return decomposeEcPrivateKeyInfo(privateKeyInfo);

    case 'ed25519':
      return decomposeEd25519PrivateKeyInfo(privateKeyInfo);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm OID '${privateKeyInfo.privateKeyAlgorithm.id}'`);
  }
};

exports.decomposePrivateKeyInfo = decomposePrivateKeyInfo;

const composePrivateKeyInfo = (keyAlgorithm, keyData) => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPrivateKeyInfo(keyAlgorithm, keyData);

    case 'ec':
      return composeEcPrivateKeyInfo(keyAlgorithm, keyData);

    case 'ed25519':
      return composeEd25519PrivateKeyInfo(keyAlgorithm, keyData);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};

exports.composePrivateKeyInfo = composePrivateKeyInfo;