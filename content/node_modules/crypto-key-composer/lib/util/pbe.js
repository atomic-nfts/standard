"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encryptWithPassword = exports.decryptWithPassword = void 0;

var _util = require("node-forge/lib/util");

var _sha = _interopRequireDefault(require("node-forge/lib/sha1"));

var _sha2 = _interopRequireDefault(require("node-forge/lib/sha256"));

var _sha3 = _interopRequireDefault(require("node-forge/lib/sha512"));

var _md = _interopRequireDefault(require("node-forge/lib/md5"));

var _pbkdf = _interopRequireDefault(require("node-forge/lib/pbkdf2"));

var _aes = _interopRequireDefault(require("node-forge/lib/aes"));

var _des = _interopRequireDefault(require("node-forge/lib/des"));

var _rc = _interopRequireDefault(require("node-forge/lib/rc2"));

var _random = _interopRequireDefault(require("./random"));

var _binary = require("./binary");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const deriveKeyWithPbkdf2 = (password, params) => {
  const {
    salt,
    iterationCount,
    keyLength,
    prf
  } = params;
  const saltStr = (0, _binary.uint8ArrayToBinaryString)(salt);
  let prfMd;

  switch (prf) {
    case 'hmac-with-sha1':
      prfMd = _sha.default.create();
      break;
    // TODO: node-forge doesn't have sha224 support, see: https://github.com/digitalbazaar/forge/issues/669
    // case 'hmacWithSHA224':
    //     prfMd = sha256.sha224.create();
    //     break;

    case 'hmac-with-sha256':
      prfMd = _sha2.default.create();
      break;

    case 'hmac-with-sha384':
      prfMd = _sha3.default.sha384.create();
      break;

    case 'hmac-with-sha512':
      prfMd = _sha3.default.create();
      break;

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported PBKDF2 prf id '${prf}'`);
  }

  const keyStr = (0, _pbkdf.default)(password, saltStr, iterationCount, keyLength, prfMd);
  return (0, _binary.binaryStringToUint8Array)(keyStr);
};

const deriveKeyWithOpensslDeriveBytes = (password, params) => {
  const {
    salt,
    keyLength
  } = params;
  const saltStr = (0, _binary.uint8ArrayToBinaryString)(salt);

  const md = _md.default.create();

  const hash = bytes => md.start().update(bytes).digest().getBytes();

  const digests = [hash(password + saltStr)];

  for (let length = 16, i = 1; length < keyLength; i += 1, length += 16) {
    digests.push(hash(digests[i - 1] + password + saltStr));
  }

  const digestStr = digests.join('').substr(0, keyLength);
  return (0, _binary.binaryStringToUint8Array)(digestStr);
};

const decryptWithAes = (key, encryptedData, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _aes.default.createDecryptionCipher(keyStr, mode);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(encryptedData)));

  if (!cipher.finish()) {
    throw new _errors.DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
};

const encryptWithAes = (key, data, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _aes.default.createEncryptionCipher(keyStr, mode);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(data)));
  cipher.finish();
  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
};

const decryptWithDes = (key, encryptedData, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _des.default.createDecryptionCipher(keyStr, mode);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(encryptedData)));

  if (!cipher.finish()) {
    throw new _errors.DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
};

const encryptWithDes = (key, data, params) => {
  const {
    iv,
    mode
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _des.default.createEncryptionCipher(keyStr, mode);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(data)));
  cipher.finish();
  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
};

const decryptWithRc2 = (key, encryptedData, params) => {
  const {
    iv,
    bits
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _rc.default.createDecryptionCipher(keyStr, bits);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(encryptedData)));

  if (!cipher.finish()) {
    throw new _errors.DecryptionFailedError('Decryption failed, mostly likely the password is wrong');
  }

  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
};

const encryptWithRc2 = (key, data, params) => {
  const {
    iv,
    bits
  } = params;
  const ivStr = (0, _binary.uint8ArrayToBinaryString)(iv);
  const keyStr = (0, _binary.uint8ArrayToBinaryString)(key);

  const cipher = _rc.default.createEncryptionCipher(keyStr, bits);

  cipher.start(ivStr);
  cipher.update((0, _util.createBuffer)((0, _binary.uint8ArrayToBinaryString)(data)));
  cipher.finish();
  return (0, _binary.binaryStringToUint8Array)(cipher.output.getBytes());
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
      throw new _errors.UnsupportedAlgorithmError(`Unsupported RC2 bits parameter with value '${bits}'`);
  }
};

const decryptWithPassword = (encryptedData, encryptionAlgorithm, password) => {
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
      throw new _errors.UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
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
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
  }

  const derivedKey = deriveKeyFn();
  const decryptedData = decryptFn(derivedKey);
  return decryptedData;
};

exports.decryptWithPassword = decryptWithPassword;

const encryptWithPassword = (data, encryptionAlgorithm, password) => {
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
      encryptionScheme.iv = encryptionScheme.iv || (0, _random.default)(16);

      encryptFn = key => encryptWithAes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = Number(encryptionScheme.id.match(/^aes(\d+)-/)[1]) / 8;
      break;

    case 'rc2-cbc':
      encryptionScheme.bits = encryptionScheme.bits || 128;
      encryptionScheme.iv = encryptionScheme.iv || (0, _random.default)(16);

      encryptFn = key => encryptWithRc2(key, data, encryptionScheme);

      derivedKeyLength = getRc2KeyLength(encryptionScheme.bits);
      break;

    case 'des-ede3-cbc':
      encryptionScheme.iv = encryptionScheme.iv || (0, _random.default)(8);

      encryptFn = key => encryptWithDes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 24;
      break;

    case 'des-cbc':
      encryptionScheme.iv = encryptionScheme.iv || (0, _random.default)(8);

      encryptFn = key => encryptWithDes(key, data, { ...encryptionScheme,
        mode: 'CBC'
      });

      derivedKeyLength = 8;
      break;

    default:
      throw new _errors.UnsupportedAlgorithmError(`Unsupported encryption scheme id '${encryptionScheme.id}'`);
  } // Process key derivation name


  switch (keyDerivationFunc.id) {
    case 'pbkdf2':
      if (keyDerivationFunc.keyLength != null && derivedKeyLength !== keyDerivationFunc.keyLength) {
        throw new _errors.UnsupportedAlgorithmError(`The specified key length must be equal to ${derivedKeyLength} (or omitted)`);
      }

      keyDerivationFunc.salt = keyDerivationFunc.salt || (0, _random.default)(16);
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
      throw new _errors.UnsupportedAlgorithmError(`Unsupported key derivation function id '${keyDerivationFunc.id}'`);
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

exports.encryptWithPassword = encryptWithPassword;