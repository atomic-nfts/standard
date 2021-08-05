import { decodeAsn1, encodeAsn1 } from '../../util/asn1-encoder';
import { EncryptedPrivateKeyInfo, Pbes2Algorithms, Pbkdf2Params, Pbes2EsParams, Rc2CbcParameter } from '../../util/asn1-entities';
import { encryptWithPassword, decryptWithPassword } from '../../util/pbe';
import { uint8ArrayToInteger, hexStringToUint8Array } from '../../util/binary';
import { UnsupportedAlgorithmError, DecodeAsn1FailedError, MissingPasswordError } from '../../util/errors';
import { validateEncryptionAlgorithm } from '../../util/validator';
import { OIDS, FLIPPED_OIDS } from '../../util/oids';
export const decryptWithPBES2 = (encryptedData, encryptionAlgorithmParamsAsn1, password) => {
  const {
    keyDerivationFunc,
    encryptionScheme
  } = decodeAsn1(encryptionAlgorithmParamsAsn1, Pbes2Algorithms);
  const keyDerivationFuncId = OIDS[keyDerivationFunc.id];
  const encryptionSchemeId = OIDS[encryptionScheme.id];
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
      effectiveEncryptionScheme.iv = decodeAsn1(encryptionScheme.parameters, Pbes2EsParams[encryptionSchemeId]);
      break;

    case 'rc2-cbc':
      {
        const rc2CBCParameter = decodeAsn1(encryptionScheme.parameters, Rc2CbcParameter);
        const rc2ParameterVersion = uint8ArrayToInteger(rc2CBCParameter.rc2ParameterVersion);
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
            throw new UnsupportedAlgorithmError(`Unsupported RC2 version parameter with value '${rc2ParameterVersion}'`);
        }

        break;
      }

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption scheme algorithm OID '${encryptionScheme.id}'`);
  } // Process key derivation func


  switch (keyDerivationFuncId) {
    case 'pbkdf2':
      {
        const pbkdf2Params = decodeAsn1(keyDerivationFunc.parameters, Pbkdf2Params);
        const prfId = OIDS[pbkdf2Params.prf.id];
        /* istanbul ignore if */

        if (pbkdf2Params.salt.type !== 'specified') {
          throw new UnsupportedAlgorithmError('Only \'specified\' salts are supported in PBKDF2');
        }

        if (!prfId) {
          throw new UnsupportedAlgorithmError(`Unsupported prf algorithm OID '${pbkdf2Params.prf.id}'`);
        }

        effectiveKeyDerivationFunc.salt = pbkdf2Params.salt.value;
        effectiveKeyDerivationFunc.iterationCount = uint8ArrayToInteger(pbkdf2Params.iterationCount);
        effectiveKeyDerivationFunc.prf = prfId;

        if (pbkdf2Params.keyLength) {
          effectiveKeyDerivationFunc.keyLength = uint8ArrayToInteger(pbkdf2Params.keyLength);
        }

        break;
      }

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key derivation function algorithm OID '${keyDerivationFunc.id}'`);
  }

  const encryptionAlgorithm = {
    keyDerivationFunc: effectiveKeyDerivationFunc,
    encryptionScheme: effectiveEncryptionScheme
  };
  const decryptedData = decryptWithPassword(encryptedData, encryptionAlgorithm, password);
  return {
    encryptionAlgorithm,
    decryptedData
  };
};
export const encryptWithPBES2 = (data, encryptionAlgorithm, password) => {
  encryptionAlgorithm = validateEncryptionAlgorithm(encryptionAlgorithm, 'pbkdf2', 'aes256-cbc');
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
      }) => encodeAsn1(iv, Pbes2EsParams[encryptionScheme.id]);

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
            throw new UnsupportedAlgorithmError(`Unsupported RC2 bits parameter with value '${rc2ParameterVersion}'`);
        }

        return encodeAsn1({
          iv,
          rc2ParameterVersion
        }, Rc2CbcParameter);
      };

      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  } // Process key derivation name


  switch (keyDerivationFunc.id) {
    case 'pbkdf2':
      encodeKeyDerivationFuncAsn1ParamsFn = ({
        salt,
        iterationCount,
        prf
      }) => encodeAsn1({
        salt: {
          type: 'specified',
          value: salt
        },
        iterationCount,
        keyLength: keyDerivationFunc.keyLength,
        prf: {
          id: FLIPPED_OIDS[prf],
          parameters: hexStringToUint8Array('0500')
        }
      }, Pbkdf2Params);

      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
  }

  const {
    encryptedData,
    effectiveEncryptionAlgorithm
  } = encryptWithPassword(data, encryptionAlgorithm, password);
  const encryptionAlgorithmParamsAsn1 = encodeAsn1({
    keyDerivationFunc: {
      id: FLIPPED_OIDS[keyDerivationFunc.id],
      parameters: encodeKeyDerivationFuncAsn1ParamsFn(effectiveEncryptionAlgorithm.keyDerivationFunc)
    },
    encryptionScheme: {
      id: FLIPPED_OIDS[encryptionScheme.id],
      parameters: encodeEncryptionSchemeAsn1ParamsFn(effectiveEncryptionAlgorithm.encryptionScheme)
    }
  }, Pbes2Algorithms);
  return {
    encryptionAlgorithmParamsAsn1,
    encryptedData
  };
};
export const maybeDecryptPrivateKeyInfo = (encryptedPrivateKeyInfoAsn1, password) => {
  let encryptedPrivateKeyInfo;

  try {
    encryptedPrivateKeyInfo = decodeAsn1(encryptedPrivateKeyInfoAsn1, EncryptedPrivateKeyInfo);
  } catch (err) {
    /* istanbul ignore else */
    if (err instanceof DecodeAsn1FailedError) {
      return {
        encryptionAlgorithm: null,
        privateKeyInfoAsn1: encryptedPrivateKeyInfoAsn1
      };
    }
    /* istanbul ignore next */


    throw err;
  }

  if (!password) {
    throw new MissingPasswordError('Please specify the password to decrypt the key');
  }

  const {
    encryptionAlgorithm,
    encryptedData
  } = encryptedPrivateKeyInfo;
  const encryptionAlgorithmId = OIDS[encryptionAlgorithm.id];
  const encryptionAlgorithmParamsAsn1 = encryptionAlgorithm.parameters;
  let decryptionResult;

  switch (encryptionAlgorithmId) {
    case 'pbes2':
      decryptionResult = decryptWithPBES2(encryptedData, encryptionAlgorithmParamsAsn1, password);
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption algorithm OID '${encryptionAlgorithm.id}'`);
  }

  return {
    encryptionAlgorithm: decryptionResult.encryptionAlgorithm,
    privateKeyInfoAsn1: decryptionResult.decryptedData
  };
};
export const maybeEncryptPrivateKeyInfo = (privateKeyInfoAsn1, encryptionAlgorithm, password) => {
  if (!password && !encryptionAlgorithm) {
    return privateKeyInfoAsn1;
  }

  if (!password && encryptionAlgorithm) {
    throw new MissingPasswordError('An encryption algorithm was specified but no password was set');
  }

  const {
    encryptedData,
    encryptionAlgorithmParamsAsn1
  } = encryptWithPBES2(privateKeyInfoAsn1, encryptionAlgorithm, password);
  const encryptedPrivateKeyInfoAsn1 = encodeAsn1({
    encryptionAlgorithm: {
      id: FLIPPED_OIDS.pbes2,
      parameters: encryptionAlgorithmParamsAsn1
    },
    encryptedData
  }, EncryptedPrivateKeyInfo);
  return encryptedPrivateKeyInfoAsn1;
};