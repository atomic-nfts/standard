"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeRawPublicKey = exports.decomposeRawPublicKey = exports.composeRawPrivateKey = exports.decomposeRawPrivateKey = exports.composeEcPrivateKey = exports.decomposeEcPrivateKey = exports.composeRsaPublicKey = exports.decomposeRsaPublicKey = exports.composeRsaPrivateKey = exports.decomposeRsaPrivateKey = exports.SUPPORTED_KEY_TYPES = void 0;

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _ec = require("../../util/ec");

var _errors = require("../../util/errors");

var _oids = require("../../util/oids");

var _keyTypes = require("../../util/key-types");

const SUPPORTED_KEY_TYPES = {
  private: ['rsa', 'ec'],
  public: ['rsa']
};
exports.SUPPORTED_KEY_TYPES = SUPPORTED_KEY_TYPES;

const decomposeRsaPrivateKey = rsaPrivateKeyAsn1 => {
  const {
    version,
    ...keyData
  } = (0, _asn1Encoder.decodeAsn1)(rsaPrivateKeyAsn1, _asn1Entities.RsaPrivateKey);
  return {
    keyAlgorithm: {
      id: 'rsa-encryption'
    },
    keyData
  };
};

exports.decomposeRsaPrivateKey = decomposeRsaPrivateKey;

const composeRsaPrivateKey = (keyAlgorithm, keyData) => {
  const otherPrimeInfos = keyData.otherPrimeInfos;
  const hasMultiplePrimes = otherPrimeInfos && otherPrimeInfos.length > 0;
  const rsaPrivateKey = { ...keyData,
    version: hasMultiplePrimes ? 1 : 0,
    otherPrimeInfos: hasMultiplePrimes ? otherPrimeInfos : undefined
  };
  return (0, _asn1Encoder.encodeAsn1)(rsaPrivateKey, _asn1Entities.RsaPrivateKey);
};

exports.composeRsaPrivateKey = composeRsaPrivateKey;

const decomposeRsaPublicKey = rsaPublicKeyAsn1 => {
  const {
    version,
    ...keyData
  } = (0, _asn1Encoder.decodeAsn1)(rsaPublicKeyAsn1, _asn1Entities.RsaPublicKey);
  return {
    keyAlgorithm: {
      id: 'rsa-encryption'
    },
    keyData
  };
};

exports.decomposeRsaPublicKey = decomposeRsaPublicKey;

const composeRsaPublicKey = (keyAlgorithm, keyData) => (0, _asn1Encoder.encodeAsn1)(keyData, _asn1Entities.RsaPublicKey);

exports.composeRsaPublicKey = composeRsaPublicKey;

const decomposeEcPrivateKey = ecPrivateKeyAsn1 => {
  const ecPrivateKey = (0, _asn1Encoder.decodeAsn1)(ecPrivateKeyAsn1, _asn1Entities.EcPrivateKey); // Validate parameters & publicKey

  /* istanbul ignore if */

  if (!ecPrivateKey.parameters) {
    throw new _errors.UnsupportedAlgorithmError('Missing parameters from ECPrivateKey');
  }
  /* istanbul ignore if */


  if (ecPrivateKey.parameters.type !== 'namedCurve') {
    throw new _errors.UnsupportedAlgorithmError('Only EC named curves are supported');
  }
  /* istanbul ignore if */


  if (!ecPrivateKey.publicKey) {
    throw new _errors.UnsupportedAlgorithmError('Missing publicKey from ECPrivateKey');
  } // Ensure that the named curve is supported


  const namedCurve = _oids.OIDS[ecPrivateKey.parameters.value];

  if (!namedCurve) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve OID '${ecPrivateKey.parameters.value}'`);
  } // Validate & encode point (public key)


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

exports.decomposeEcPrivateKey = decomposeEcPrivateKey;

const composeEcPrivateKey = (keyAlgorithm, keyData) => {
  // Validate named curve
  const namedCurveOid = _oids.FLIPPED_OIDS[keyAlgorithm.namedCurve];

  if (!namedCurveOid) {
    throw new _errors.UnsupportedAlgorithmError(`Unsupported named curve '${keyAlgorithm.namedCurve}'`);
  } // Validate D value (private key)


  const privateKey = (0, _ec.validateEcD)(keyAlgorithm.namedCurve, keyData.d); // Encode point (public key)

  const publicKey = (0, _ec.encodeEcPoint)(keyAlgorithm.namedCurve, keyData.x, keyData.y);
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
  return (0, _asn1Encoder.encodeAsn1)(ecPrivateKey, _asn1Entities.EcPrivateKey);
};

exports.composeEcPrivateKey = composeEcPrivateKey;

const decomposeRawPrivateKey = (keyType, privateKeyAsn1) => {
  switch (keyType) {
    case 'rsa':
      return decomposeRsaPrivateKey(privateKeyAsn1);

    case 'ec':
      return decomposeEcPrivateKey(privateKeyAsn1);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key type '${keyType}'`);
  }
};

exports.decomposeRawPrivateKey = decomposeRawPrivateKey;

const composeRawPrivateKey = (keyAlgorithm, keyData) => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPrivateKey(keyAlgorithm, keyData);

    case 'ec':
      return composeEcPrivateKey(keyAlgorithm, keyData);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};

exports.composeRawPrivateKey = composeRawPrivateKey;

const decomposeRawPublicKey = (keyType, publicKeyAsn1) => {
  switch (keyType) {
    case 'rsa':
      return decomposeRsaPublicKey(publicKeyAsn1);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key type '${keyType}'`);
  }
};

exports.decomposeRawPublicKey = decomposeRawPublicKey;

const composeRawPublicKey = (keyAlgorithm, keyData) => {
  const keyType = _keyTypes.KEY_TYPES[keyAlgorithm.id];

  switch (keyType) {
    case 'rsa':
      return composeRsaPublicKey(keyAlgorithm, keyData);

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key algorithm id '${keyAlgorithm.id}'`);
  }
};

exports.composeRawPublicKey = composeRawPublicKey;