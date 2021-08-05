import { decryptWithPassword, encryptWithPassword } from '../../util/pbe';
import { binaryStringToUint8Array, hexStringToUint8Array, uint8ArrayToHexString } from '../../util/binary';
import { validateEncryptionAlgorithm } from '../../util/validator';
import { UnsupportedAlgorithmError, MissingPasswordError } from '../../util/errors';

const decryptPemBody = (pem, password) => {
  const keyDerivationFunc = {
    id: 'openssl-derive-bytes'
  };
  const encryptionScheme = {
    iv: hexStringToUint8Array(pem.dekInfo.parameters)
  };
  const dekInfoAlgorithm = pem.dekInfo.algorithm;

  switch (dekInfoAlgorithm) {
    case 'AES-128-CBC':
    case 'AES-192-CBC':
    case 'AES-256-CBC':
      encryptionScheme.id = dekInfoAlgorithm.replace('-', '').toLowerCase();
      break;

    case 'RC2-40-CBC':
    case 'RC2-64-CBC':
    case 'RC2-128-CBC':
    case 'RC2-CBC':
      encryptionScheme.id = 'rc2-cbc';
      encryptionScheme.bits = Number((dekInfoAlgorithm.match(/-(\d+)-/) || [])[1]) || 128;
      break;

    case 'DES-CBC':
    case 'DES-EDE3-CBC':
      encryptionScheme.id = dekInfoAlgorithm.toLowerCase();
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported DEK-INFO algorithm '${dekInfoAlgorithm}'`);
  }

  const encryptionAlgorithm = {
    keyDerivationFunc,
    encryptionScheme
  };
  const decryptedPemBody = decryptWithPassword(binaryStringToUint8Array(pem.body), encryptionAlgorithm, password);
  return {
    encryptionAlgorithm,
    pemBody: decryptedPemBody
  };
};

const encryptPemBody = (pemBody, encryptionAlgorithm, password) => {
  encryptionAlgorithm = validateEncryptionAlgorithm(encryptionAlgorithm, 'openssl-derive-bytes', 'aes256-cbc');
  const {
    keyDerivationFunc,
    encryptionScheme
  } = encryptionAlgorithm;

  if (keyDerivationFunc.id !== 'openssl-derive-bytes') {
    throw new UnsupportedAlgorithmError('PKCS1 PEM keys only support \'openssl-derive-bytes\' as the key derivation func');
  }

  let dekInfoAlgorithm;

  switch (encryptionScheme.id) {
    case 'aes128-cbc':
    case 'aes192-cbc':
    case 'aes256-cbc':
      dekInfoAlgorithm = encryptionScheme.id.replace('aes', 'aes-').toUpperCase();
      break;

    case 'rc2-cbc':
      encryptionScheme.bits = encryptionScheme.bits || 128;

      switch (encryptionScheme.bits) {
        case 40:
          dekInfoAlgorithm = 'RC2-40-CBC';
          break;

        case 64:
          dekInfoAlgorithm = 'RC2-64-CBC';
          break;

        case 128:
          dekInfoAlgorithm = 'RC2-CBC';
          break;

        default:
          throw new UnsupportedAlgorithmError(`Unsupported RC2 bits parameter with value '${encryptionScheme.bits}'`);
      }

      break;

    case 'des-cbc':
    case 'des-ede3-cbc':
      dekInfoAlgorithm = encryptionScheme.id.toUpperCase();
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  }

  const {
    encryptedData,
    effectiveEncryptionAlgorithm
  } = encryptWithPassword(pemBody, encryptionAlgorithm, password);
  return {
    pemHeaders: {
      procType: {
        version: '4',
        type: 'ENCRYPTED'
      },
      dekInfo: {
        algorithm: dekInfoAlgorithm,
        parameters: uint8ArrayToHexString(effectiveEncryptionAlgorithm.encryptionScheme.iv).toUpperCase()
      }
    },
    pemBody: encryptedData
  };
};

export const maybeDecryptPemBody = (pem, password) => {
  const encrypted = pem.procType && pem.procType.type === 'ENCRYPTED' && pem.dekInfo && pem.dekInfo.algorithm;

  if (!encrypted) {
    return {
      pemBody: binaryStringToUint8Array(pem.body),
      encryptionAlgorithm: null
    };
  }

  if (!password) {
    throw new MissingPasswordError('Please specify the password to decrypt the key');
  }

  return decryptPemBody(pem, password);
};
export const maybeEncryptPemBody = (pemBody, encryptionAlgorithm, password) => {
  if (!password && !encryptionAlgorithm) {
    return {
      pemHeaders: null,
      pemBody
    };
  }

  if (!password && encryptionAlgorithm) {
    throw new MissingPasswordError('An encryption algorithm was specified but no password was set');
  }

  return encryptPemBody(pemBody, encryptionAlgorithm, password);
};