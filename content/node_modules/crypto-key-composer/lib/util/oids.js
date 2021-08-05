"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FLIPPED_OIDS = exports.OIDS = void 0;

var _invert2 = _interopRequireDefault(require("lodash/invert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const OIDS = {
  // RSA
  '1.2.840.113549.1.1.1': 'rsa-encryption',
  '1.2.840.113549.1.1.2': 'md2-with-rsa-encryption',
  '1.2.840.113549.1.1.3': 'md4-with-rsa-encryption',
  '1.2.840.113549.1.1.4': 'md5-with-rsa-encryption',
  '1.2.840.113549.1.1.5': 'sha1-with-rsa-encryption',
  '1.2.840.113549.1.1.14': 'sha224-with-rsa-encryption',
  '1.2.840.113549.1.1.11': 'sha256-with-rsa-encryption',
  '1.2.840.113549.1.1.12': 'sha384-with-rsa-encryption',
  '1.2.840.113549.1.1.13': 'sha512-with-rsa-encryption',
  '1.2.840.113549.1.1.15': 'sha512-224-with-rsa-encryption',
  '1.2.840.113549.1.1.16': 'sha512-256-with-rsa-encryption',
  '1.2.840.113549.1.1.7': 'rsaes-oaep',
  '1.2.840.113549.1.1.10': 'rsassa-pss',
  // Ed25519
  '1.3.101.112': 'ed25519',
  // EC & its curves
  '1.2.840.10045.2.1': 'ec-public-key',
  '1.3.132.1.12': 'ec-dh',
  '1.3.132.1.13': 'ec-mqv',
  '1.3.132.0.1': 'sect163k1',
  '1.3.132.0.2': 'sect163r1',
  '1.3.132.0.3': 'sect239k1',
  '1.3.132.0.4': 'sect113r1',
  '1.3.132.0.5': 'sect113r2',
  '1.3.132.0.6': 'secp112r1',
  '1.3.132.0.7': 'secp112r2',
  '1.3.132.0.8': 'secp160r1',
  '1.3.132.0.9': 'secp160k1',
  '1.3.132.0.10': 'secp256k1',
  '1.3.132.0.15': 'sect163r2',
  '1.3.132.0.16': 'sect283k1',
  '1.3.132.0.17': 'sect283r1',
  '1.3.132.0.22': 'sect131r1',
  '1.3.132.0.23': 'sect131r2',
  '1.3.132.0.24': 'sect193r1',
  '1.3.132.0.25': 'sect193r2',
  '1.3.132.0.26': 'sect233k1',
  '1.3.132.0.27': 'sect233r1',
  '1.3.132.0.28': 'secp128r1',
  '1.3.132.0.29': 'secp128r2',
  '1.3.132.0.30': 'secp160r2',
  '1.3.132.0.31': 'secp192k1',
  '1.3.132.0.32': 'secp224k1',
  '1.3.132.0.33': 'secp224r1',
  '1.3.132.0.34': 'secp384r1',
  '1.3.132.0.35': 'secp521r1',
  '1.3.132.0.36': 'sect409k1',
  '1.3.132.0.37': 'sect409r1',
  '1.3.132.0.38': 'sect571k1',
  '1.3.132.0.39': 'sect571r1',
  '1.2.840.10045.3.1.1': 'secp192r1',
  '1.2.840.10045.3.1.7': 'secp256r1',
  // PBE related
  '2.16.840.1.101.3.4.1.2': 'aes128-cbc',
  '2.16.840.1.101.3.4.1.22': 'aes192-cbc',
  '2.16.840.1.101.3.4.1.42': 'aes256-cbc',
  '1.2.840.113549.3.2': 'rc2-cbc',
  '1.3.14.3.2.7': 'des-cbc',
  '1.2.840.113549.3.7': 'des-ede3-cbc',
  '1.2.840.113549.1.5.13': 'pbes2',
  '1.2.840.113549.1.5.12': 'pbkdf2',
  '1.2.840.113549.2.7': 'hmac-with-sha1',
  '1.2.840.113549.2.8': 'hmac-with-sha224',
  '1.2.840.113549.2.9': 'hmac-with-sha256',
  '1.2.840.113549.2.10': 'hmac-with-sha384',
  '1.2.840.113549.2.11': 'hmac-with-sha512'
};
exports.OIDS = OIDS;
const FLIPPED_OIDS = (0, _invert2.default)(OIDS);
exports.FLIPPED_OIDS = FLIPPED_OIDS;