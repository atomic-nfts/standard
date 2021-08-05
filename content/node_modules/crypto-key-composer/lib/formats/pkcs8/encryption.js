"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.maybeEncryptPrivateKeyInfo = exports.maybeDecryptPrivateKeyInfo = exports.encryptWithPBES2 = exports.decryptWithPBES2 = void 0;

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _pbe = require("../../util/pbe");

var _binary = require("../../util/binary");

var _errors = require("../../util/errors");

var _validator = require("../../util/validator");

var _oids = require("../../util/oids");

const decryptWithPBES2 = (encryptedData, encryptionAlgorithmParamsAsn1, password) => {
  const {
    keyDerivationFunc,
    encryptionScheme
  } = (0, _asn1Encoder.decodeAsn1)(encryptionAlgorithmParamsAsn1, _asn1Entities.Pbes2Algorithms);
  const keyDerivationFuncId = _oids.OIDS[keyDerivationFunc.id];
  const encryptionSchemeId = _oids.OIDS[encryptionScheme.id];
  const effectiveKeyDerivationFunc = {
    id: keyDerivationFuncId
  };
  const effectiveEncryptionScheme = {
    id: encryptionSchemeId
  }; // Process encryption scheme

  switch (encryptionSchemeId) {
    case 'aes128-cbc':
    case 'aes192-cbc':
    case 'aes256-cbc':
    case 'des-ede3-cbc':
    case 'des-cbc':
      effectiveEncryptionScheme.iv = (0, _asn1Encoder.decodeAsn1)(encryptionScheme.parameters, _asn1Entities.Pbes2EsParams[encryptionSchemeId]);
      break;

    case 'rc2-cbc':
      {
        const rc2CBCParameter = (0, _asn1Encoder.decodeAsn1)(encryptionScheme.parameters, _asn1Entities.Rc2CbcParameter);
        const rc2ParameterVersion = (0, _binary.uint8ArrayToInteger)(rc2CBCParameter.rc2ParameterVersion);
        effectiveEncryptionScheme.iv = rc2CBCParameter.iv; // RC2-CBCParameter encoding of the "effective key bits" as defined in:
        // https://tools.ietf.org/html/rfc2898#appendix-B.2.3

        switch (rc2ParameterVersion) {
          case 160:
            effectiveEncryptionScheme.bits = 40;
            break;

          case 120:
            effectiveEncryptionScheme.bits = 64;
            break;

          case 58:
            effectiveEncryptionScheme.bits = 128;
            break;

          default:
            throw new _errors.UnsupportedAlgorithmError(`Unsupported RC2 version parameter with value '${rc2ParameterVersion}'`);
        }

        break;
      }

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported encryption scheme algorithm OID '${encryptionScheme.id}'`);
  } // Process key derivation func


  switch (keyDerivationFuncId) {
    case 'pbkdf2':
      {
        const pbkdf2Params = (0, _asn1Encoder.decodeAsn1)(keyDerivationFunc.parameters, _asn1Entities.Pbkdf2Params);
        const prfId = _oids.OIDS[pbkdf2Params.prf.id];
        /* istanbul ignore if */

        if (pbkdf2Params.salt.type !== 'specified') {
          throw new _errors.UnsupportedAlgorithmError('Only \'specified\' salts are supported in PBKDF2');
        }

        if (!prfId) {
          throw new _errors.UnsupportedAlgorithmError(`Unsupported prf algorithm OID '${pbkdf2Params.prf.id}'`);
        }

        effectiveKeyDerivationFunc.salt = pbkdf2Params.salt.value;
        effectiveKeyDerivationFunc.iterationCount = (0, _binary.uint8ArrayToInteger)(pbkdf2Params.iterationCount);
        effectiveKeyDerivationFunc.prf = prfId;

        if (pbkdf2Params.keyLength) {
          effectiveKeyDerivationFunc.keyLength = (0, _binary.uint8ArrayToInteger)(pbkdf2Params.keyLength);
        }

        break;
      }

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key derivation function algorithm OID '${keyDerivationFunc.id}'`);
  }

  const encryptionAlgorithm = {
    keyDerivationFunc: effectiveKeyDerivationFunc,
    encryptionScheme: effectiveEncryptionScheme
  };
  const decryptedData = (0, _pbe.decryptWithPassword)(encryptedData, encryptionAlgorithm, password);
  return {
    encryptionAlgorithm,
    decryptedData
  };
};

exports.decryptWithPBES2 = decryptWithPBES2;

const encryptWithPBES2 = (data, encryptionAlgorithm, password) => {
  encryptionAlgorithm = (0, _validator.validateEncryptionAlgorithm)(encryptionAlgorithm, 'pbkdf2', 'aes256-cbc');
  const {
    keyDerivationFunc,
    encryptionScheme
  } = encryptionAlgorithm;
  let encodeEncryptionSchemeAsn1ParamsFn;
  let encodeKeyDerivationFuncAsn1ParamsFn; // Process encryption scheme

  switch (encryptionScheme.id) {
    case 'aes128-cbc':
    case 'aes192-cbc':
    case 'aes256-cbc':
    case 'des-ede3-cbc':
    case 'des-cbc':
      encodeEncryptionSchemeAsn1ParamsFn = ({
        iv
      }) => (0, _asn1Encoder.encodeAsn1)(iv, _asn1Entities.Pbes2EsParams[encryptionScheme.id]);

      break;

    case 'rc2-cbc':
      encodeEncryptionSchemeAsn1ParamsFn = ({
        iv,
        bits
      }) => {
        let rc2ParameterVersion; // RC2-CBCParameter encoding of the "effective key bits" as defined in:
        // https://tools.ietf.org/html/rfc2898#appendix-B.2.3

        switch (bits) {
          case 40:
            rc2ParameterVersion = 160;
            break;

          case 64:
            rc2ParameterVersion = 120;
            break;

          case 128:
            rc2ParameterVersion = 58;
            break;

          default:
            throw new _errors.UnsupportedAlgorithmError(`Unsupported RC2 bits parameter with value '${rc2ParameterVersion}'`);
        }

        return (0, _asn1Encoder.encodeAsn1)({
          iv,
          rc2ParameterVersion
        }, _asn1Entities.Rc2CbcParameter);
      };

      break;

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  } // Process key derivation name


  switch (keyDerivationFunc.id) {
    case 'pbkdf2':
      encodeKeyDerivationFuncAsn1ParamsFn = ({
        salt,
        iterationCount,
        prf
      }) => (0, _asn1Encoder.encodeAsn1)({
        salt: {
          type: 'specified',
          value: salt
        },
        iterationCount,
        keyLength: keyDerivationFunc.keyLength,
        prf: {
          id: _oids.FLIPPED_OIDS[prf],
          parameters: (0, _binary.hexStringToUint8Array)('0500')
        }
      }, _asn1Entities.Pbkdf2Params);

      break;

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
  }

  const {
    encryptedData,
    effectiveEncryptionAlgorithm
  } = (0, _pbe.encryptWithPassword)(data, encryptionAlgorithm, password);
  const encryptionAlgorithmParamsAsn1 = (0, _asn1Encoder.encodeAsn1)({
    keyDerivationFunc: {
      id: _oids.FLIPPED_OIDS[keyDerivationFunc.id],
      parameters: encodeKeyDerivationFuncAsn1ParamsFn(effectiveEncryptionAlgorithm.keyDerivationFunc)
    },
    encryptionScheme: {
      id: _oids.FLIPPED_OIDS[encryptionScheme.id],
      parameters: encodeEncryptionSchemeAsn1ParamsFn(effectiveEncryptionAlgorithm.encryptionScheme)
    }
  }, _asn1Entities.Pbes2Algorithms);
  return {
    encryptionAlgorithmParamsAsn1,
    encryptedData
  };
};

exports.encryptWithPBES2 = encryptWithPBES2;

const maybeDecryptPrivateKeyInfo = (encryptedPrivateKeyInfoAsn1, password) => {
  let encryptedPrivateKeyInfo;

  try {
    encryptedPrivateKeyInfo = (0, _asn1Encoder.decodeAsn1)(encryptedPrivateKeyInfoAsn1, _asn1Entities.EncryptedPrivateKeyInfo);
  } catch (err) {
    /* istanbul ignore else */
    if (err instanceof _errors.DecodeAsn1FailedError) {
      return {
        encryptionAlgorithm: null,
        privateKeyInfoAsn1: encryptedPrivateKeyInfoAsn1
      };
    }
    /* istanbul ignore next */


    throw err;
  }

  if (!password) {
    throw new _errors.MissingPasswordError('Please specify the password to decrypt the key');
  }

  const {
    encryptionAlgorithm,
    encryptedData
  } = encryptedPrivateKeyInfo;
  const encryptionAlgorithmId = _oids.OIDS[encryptionAlgorithm.id];
  const encryptionAlgorithmParamsAsn1 = encryptionAlgorithm.parameters;
  let decryptionResult;

  switch (encryptionAlgorithmId) {
    case 'pbes2':
      decryptionResult = decryptWithPBES2(encryptedData, encryptionAlgorithmParamsAsn1, password);
      break;

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported encryption algorithm OID '${encryptionAlgorithm.id}'`);
  }

  return {
    encryptionAlgorithm: decryptionResult.encryptionAlgorithm,
    privateKeyInfoAsn1: decryptionResult.decryptedData
  };
};

exports.maybeDecryptPrivateKeyInfo = maybeDecryptPrivateKeyInfo;

const maybeEncryptPrivateKeyInfo = (privateKeyInfoAsn1, encryptionAlgorithm, password) => {
  if (!password && !encryptionAlgorithm) {
    return privateKeyInfoAsn1;
  }

  if (!password && encryptionAlgorithm) {
    throw new _errors.MissingPasswordError('An encryption algorithm was specified but no password was set');
  }

  const {
    encryptedData,
    encryptionAlgorithmParamsAsn1
  } = encryptWithPBES2(privateKeyInfoAsn1, encryptionAlgorithm, password);
  const encryptedPrivateKeyInfoAsn1 = (0, _asn1Encoder.encodeAsn1)({
    encryptionAlgorithm: {
      id: _oids.FLIPPED_OIDS.pbes2,
      parameters: encryptionAlgorithmParamsAsn1
    },
    encryptedData
  }, _asn1Entities.EncryptedPrivateKeyInfo);
  return encryptedPrivateKeyInfoAsn1;
};

exports.maybeEncryptPrivateKeyInfo = maybeEncryptPrivateKeyInfo;