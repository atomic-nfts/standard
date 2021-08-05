"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePrivateKey = exports.decomposePrivateKey = void 0;

var _keys = require("./keys");

var _encryption = require("./encryption");

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _errors = require("../../util/errors");

const decomposePrivateKey = (encryptedPrivateKeyInfoAsn1, options) => {
  // Attempt to decrypt privateKeyInfoAsn1 as it might actually be a EncryptedPrivateKeyInfo
  const {
    privateKeyInfoAsn1,
    encryptionAlgorithm
  } = (0, _encryption.maybeDecryptPrivateKeyInfo)(encryptedPrivateKeyInfoAsn1, options.password); // Attempt to decode as PrivateKeyInfo

  let privateKeyInfo;

  try {
    privateKeyInfo = (0, _asn1Encoder.decodeAsn1)(privateKeyInfoAsn1, _asn1Entities.PrivateKeyInfo);
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodeAsn1FailedError;
    throw err;
  } // Decompose the PrivateKeyInfo


  const {
    keyAlgorithm,
    keyData
  } = (0, _keys.decomposePrivateKeyInfo)(privateKeyInfo);
  return {
    format: 'pkcs8-der',
    keyAlgorithm,
    keyData,
    encryptionAlgorithm
  };
};

exports.decomposePrivateKey = decomposePrivateKey;

const composePrivateKey = ({
  keyAlgorithm,
  keyData,
  encryptionAlgorithm
}, options) => {
  // Generate the PrivateKeyInfo based on the key algorithm & key data
  const privateKeyInfo = (0, _keys.composePrivateKeyInfo)(keyAlgorithm, keyData); // Encode PrivateKeyInfo into ASN1

  const privateKeyInfoAsn1 = (0, _asn1Encoder.encodeAsn1)(privateKeyInfo, _asn1Entities.PrivateKeyInfo); // Do we need to encrypt as EncryptedPrivateKeyInfo?

  const encryptedPrivateKeyInfoAsn1 = (0, _encryption.maybeEncryptPrivateKeyInfo)(privateKeyInfoAsn1, encryptionAlgorithm, options.password);
  return encryptedPrivateKeyInfoAsn1;
};

exports.composePrivateKey = composePrivateKey;