"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KEY_ALIASES = exports.KEY_TYPES = void 0;
const KEY_TYPES = {
  // RSA key types
  'rsa-encryption': 'rsa',
  'md2-with-rsa-encryption': 'rsa',
  'md4-with-rsa-encryption': 'rsa',
  'md5-with-rsa-encryption': 'rsa',
  'sha1-with-rsa-encryption': 'rsa',
  'sha224-with-rsa-encryption': 'rsa',
  'sha256-with-rsa-encryption': 'rsa',
  'sha384-with-rsa-encryption': 'rsa',
  'sha512-with-rsa-encryption': 'rsa',
  'sha512-224-with-rsa-encryption': 'rsa',
  'sha512-256-with-rsa-encryption': 'rsa',
  'rsaes-oaep': 'rsa',
  'rsassa-pss': 'rsa',
  // EC key types
  'ec-public-key': 'ec',
  'ec-dh': 'ec',
  'ec-mqv': 'ec',
  // ED25519 key types
  ed25519: 'ed25519'
};
exports.KEY_TYPES = KEY_TYPES;
const KEY_ALIASES = {
  rsa: {
    id: 'rsa-encryption'
  },
  ec: {
    id: 'ec-public-key'
  }
};
exports.KEY_ALIASES = KEY_ALIASES;