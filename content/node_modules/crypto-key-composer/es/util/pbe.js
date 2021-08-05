import { createBuffer } from 'node-forge/lib/util';
import sha1 from 'node-forge/lib/sha1';
import sha256 from 'node-forge/lib/sha256';
import sha512 from 'node-forge/lib/sha512';
import md5 from 'node-forge/lib/md5';
import pbkdf2 from 'node-forge/lib/pbkdf2';
import aes from 'node-forge/lib/aes';
import des from 'node-forge/lib/des';
import rc2 from 'node-forge/lib/rc2';
import randomBytes from './random';
import { uint8ArrayToBinaryString, binaryStringToUint8Array } from './binary';
import { UnsupportedAlgorithmError, DecryptionFailedError } from './errors';

const deriveKeyWithPbkdf2 = (password, params) => {
  const {
    salt,
    iterationCount,
    keyLength,
    prf
  } = params;
  const saltStr = uint8ArrayToBinaryString(salt);
  let prfMd;

  switch (prf) {
    case 'hmac-with-sha1':
      prfMd = sha1.create();
      break;
    // TODO: node-forge doesn't have sha224 support, see: https://github.com/digitalbazaar/forge/issues/669
    // case 'hmacWithSHA224':
    //     prfMd = sha256.sha224.create();
    //     break;

    case 'hmac-with-sha256':
      prfMd = sha256.create();
      break;

    case 'hmac-with-sha384':
      prfMd = sha512.sha384.create();
      break;

    case 'hmac-with-sha512':
      prfMd = sha512.create();
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported PBKDF2 prf id '${prf}'`);
  }

  const keyStr = pbkdf2(password, saltStr, iterationCount, keyLength, prfMd);
  return binaryStringToUint8Array(keyStr);
};

const deriveKeyWithOpensslDeriveBytes = (password, params) => {
  const {
    salt,
    keyLength
  } = params;
  const saltStr = uint8ArrayToBinaryString(salt);
  const md = md5.create();

  const hash = bytes => md.start().update(bytes).digest().getBytes();

  const digests = [hash(password + saltStr)];

  for (let length = 16, i = 1; length < keyLength; i += 1, length += 16) {
    digests.push(hash(digests[i - 1] + password + saltStr));
  }

  const digestStr = digests.join('').substr(0, keyLength);
  return binaryStringToUint8Array(digestStr);
};

const decryptWithAes = (key, encryptedData, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = aes.createDecryptionCipher(keyStr, mode);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(encryptedData)));

  if (!cipher.finish()) {
    throw new DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return binaryStringToUint8Array(cipher.output.getBytes());
};

const encryptWithAes = (key, data, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = aes.createEncryptionCipher(keyStr, mode);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(data)));
  cipher.finish();
  return binaryStringToUint8Array(cipher.output.getBytes());
};

const decryptWithDes = (key, encryptedData, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = des.createDecryptionCipher(keyStr, mode);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(encryptedData)));

  if (!cipher.finish()) {
    throw new DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return binaryStringToUint8Array(cipher.output.getBytes());
};

const encryptWithDes = (key, data, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = des.createEncryptionCipher(keyStr, mode);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(data)));
  cipher.finish();
  return binaryStringToUint8Array(cipher.output.getBytes());
};

const decryptWithRc2 = (key, encryptedData, params) => {
  const {
    iv,
    bits
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = rc2.createDecryptionCipher(keyStr, bits);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(encryptedData)));

  if (!cipher.finish()) {
    throw new DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return binaryStringToUint8Array(cipher.output.getBytes());
};

const encryptWithRc2 = (key, data, params) => {
  const {
    iv,
    bits
  } = params;
  const ivStr = uint8ArrayToBinaryString(iv);
  const keyStr = uint8ArrayToBinaryString(key);
  const cipher = rc2.createEncryptionCipher(keyStr, bits);
  cipher.start(ivStr);
  cipher.update(createBuffer(uint8ArrayToBinaryString(data)));
  cipher.finish();
  return binaryStringToUint8Array(cipher.output.getBytes());
};

const getRc2KeyLength = bits => {
  // RC2-CBCParameter encoding of the "effective key bits" as defined in:
  // https://tools.ietf.org/html/rfc2898#appendix-B.2.3
  switch (bits) {
    case 40:
      return 5;

    case 64:
      return 8;

    case 128:
      return 16;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported RC2 bits parameter with value '${bits}'`);
  }
};

export const decryptWithPassword = (encryptedData, encryptionAlgorithm, password) => {
  const {
    keyDerivationFunc,
    encryptionScheme
  } = encryptionAlgorithm;
  let deriveKeyFn;
  let derivedKeyLength;
  let decryptFn; // Process encryption scheme

  switch (encryptionScheme.id) {
    case 'aes128-cbc':
    case 'aes192-cbc':
    case 'aes256-cbc':
      decryptFn = key => decryptWithAes(key, encryptedData, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = Number(encryptionScheme.id.match(/^aes(\d+)-/)[1]) / 8;
      break;

    case 'rc2-cbc':
      decryptFn = key => decryptWithRc2(key, encryptedData, encryptionScheme);

      derivedKeyLength = getRc2KeyLength(encryptionScheme.bits);
      break;

    case 'des-ede3-cbc':
      decryptFn = key => decryptWithDes(key, encryptedData, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 24;
      break;

    case 'des-cbc':
      decryptFn = key => decryptWithDes(key, encryptedData, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 8;
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  } // Process key derivation func


  switch (keyDerivationFunc.id) {
    case 'pbkdf2':
      deriveKeyFn = () => deriveKeyWithPbkdf2(password, { ...keyDerivationFunc,
        keyLength: keyDerivationFunc.keyLength || derivedKeyLength
      });

      break;

    case 'openssl-derive-bytes':
      deriveKeyFn = () => deriveKeyWithOpensslDeriveBytes(password, {
        keyLength: derivedKeyLength,
        salt: encryptionScheme.iv.slice(0, 8)
      });

      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
  }

  const derivedKey = deriveKeyFn();
  const decryptedData = decryptFn(derivedKey);
  return decryptedData;
};
export const encryptWithPassword = (data, encryptionAlgorithm, password) => {
  const keyDerivationFunc = { ...encryptionAlgorithm.keyDerivationFunc
  };
  const encryptionScheme = { ...encryptionAlgorithm.encryptionScheme
  };
  let deriveKeyFn;
  let derivedKeyLength;
  let encryptFn; // Process encryption scheme

  switch (encryptionScheme.id) {
    case 'aes128-cbc':
    case 'aes192-cbc':
    case 'aes256-cbc':
      encryptionScheme.iv = encryptionScheme.iv || randomBytes(16);

      encryptFn = key => encryptWithAes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = Number(encryptionScheme.id.match(/^aes(\d+)-/)[1]) / 8;
      break;

    case 'rc2-cbc':
      encryptionScheme.bits = encryptionScheme.bits || 128;
      encryptionScheme.iv = encryptionScheme.iv || randomBytes(16);

      encryptFn = key => encryptWithRc2(key, data, encryptionScheme);

      derivedKeyLength = getRc2KeyLength(encryptionScheme.bits);
      break;

    case 'des-ede3-cbc':
      encryptionScheme.iv = encryptionScheme.iv || randomBytes(8);

      encryptFn = key => encryptWithDes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 24;
      break;

    case 'des-cbc':
      encryptionScheme.iv = encryptionScheme.iv || randomBytes(8);

      encryptFn = key => encryptWithDes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 8;
      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  } // Process key derivation name


  switch (keyDerivationFunc.id) {
    case 'pbkdf2':
      if (keyDerivationFunc.keyLength != null && derivedKeyLength !== keyDerivationFunc.keyLength) {
        throw new UnsupportedAlgorithmError(`The specified key length must be equal to ${derivedKeyLength} (or omitted)`);
      }

      keyDerivationFunc.salt = keyDerivationFunc.salt || randomBytes(16);
      keyDerivationFunc.iterationCount = keyDerivationFunc.iterationCount || 10000;
      keyDerivationFunc.keyLength = keyDerivationFunc.keyLength || derivedKeyLength;
      keyDerivationFunc.prf = keyDerivationFunc.prf || 'hmac-with-sha512';

      deriveKeyFn = () => deriveKeyWithPbkdf2(password, keyDerivationFunc);

      break;

    case 'openssl-derive-bytes':
      keyDerivationFunc.keyLength = derivedKeyLength;
      keyDerivationFunc.salt = encryptionScheme.iv.slice(0, 8);

      deriveKeyFn = () => deriveKeyWithOpensslDeriveBytes(password, keyDerivationFunc);

      break;

    default:
      throw new UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
  }

  const derivedKey = deriveKeyFn();
  const encryptedData = encryptFn(derivedKey);
  return {
    effectiveEncryptionAlgorithm: {
      keyDerivationFunc,
      encryptionScheme
    },
    encryptedData
  };
};