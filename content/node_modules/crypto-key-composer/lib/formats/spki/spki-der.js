"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composePublicKey = exports.decomposePublicKey = void 0;

var _keys = require("./keys");

var _asn1Encoder = require("../../util/asn1-encoder");

var _asn1Entities = require("../../util/asn1-entities");

var _errors = require("../../util/errors");

const decomposePublicKey = subjectPublicKeyInfoAsn1 => {
  // Attempt to decode as SubjectPublicKeyInfo
  let subjectPublicKeyInfo;

  try {
    subjectPublicKeyInfo = (0, _asn1Encoder.decodeAsn1)(subjectPublicKeyInfoAsn1, _asn1Entities.SubjectPublicKeyInfo);
  } catch (err) {
    err.invalidInputKey = err instanceof _errors.DecodeAsn1FailedError;
    throw err;
  } // Decompose the SubjectPublicKeyInfo


  const {
    keyAlgorithm,
    keyData
  } = (0, _keys.decomposeSubjectPublicKeyInfo)(subjectPublicKeyInfo);
  return {
    format: 'spki-der',
    keyAlgorithm,
    keyData
  };
};

exports.decomposePublicKey = decomposePublicKey;

const composePublicKey = ({
  keyAlgorithm,
  keyData
}) => {
  // Generate the SubjectPublicKeyInfo based on the key algorithm & key data
  const subjectPublicKeyInfo = (0, _keys.composeSubjectPublicKeyInfo)(keyAlgorithm, keyData); // Encode SubjectPublicKeyInfo into ASN1

  const subjectPublicKeyInfoAsn1 = (0, _asn1Encoder.encodeAsn1)(subjectPublicKeyInfo, _asn1Entities.SubjectPublicKeyInfo);
  return subjectPublicKeyInfoAsn1;
};

exports.composePublicKey = composePublicKey;