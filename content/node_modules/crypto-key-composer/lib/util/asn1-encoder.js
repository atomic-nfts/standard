"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeAsn1 = exports.decodeAsn1 = exports.define = exports.objidValues = void 0;

var _deepForEach = _interopRequireDefault(require("deep-for-each"));

var _cloneDeep = _interopRequireDefault(require("clone-deep"));

var _asn = _interopRequireDefault(require("@lordvlad/asn1.js"));

var _buffer = require("buffer");

var _binary = require("./binary");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ensure that all asn1 objid are returned as strings separated with '.'
// See https://github.com/indutny/asn1.js/blob/b99ce086320e0123331e6272f6de75548c6855fa/lib/asn1/decoders/der.js#L198
const objidValues = new Proxy({}, {
  get: (obj, key) => {
    if (key === 'hasOwnProperty') {
      return key => key.indexOf('.') > 0;
    }

    return key.indexOf('.') > 0 ? key : undefined;
  }
});
/* eslint-disable babel/no-invalid-this*/

exports.objidValues = objidValues;

const define = (name, fn) => _asn.default.define(name, function () {
  fn(this);
});
/* eslint-enable babel/no-invalid-this*/


exports.define = define;

const decodeAsn1 = (encodedEntity, Model) => {
  let decodedEntity;

  try {
    decodedEntity = Model.decode(_buffer.Buffer.from(encodedEntity), 'der');
  } catch (err) {
    throw new _errors.DecodeAsn1FailedError(`Failed to decode ${Model.name}`, Model.name, {
      originalError: err
    });
  }

  const mapValue = value => {
    // Convert any typed array, including Node's buffer, to Uint8Array
    if (ArrayBuffer.isView(value)) {
      return (0, _binary.typedArrayToUint8Array)(value);
    } // Big number to array buffer


    if (value && value.toArrayLike) {
      return (0, _binary.bnToUint8Array)(value);
    }

    return value;
  }; // Apply conversion to all properties deep within the entity


  (0, _deepForEach.default)(decodedEntity, (value, key, subject) => {
    subject[key] = mapValue(value);
  });
  return mapValue(decodedEntity);
};

exports.decodeAsn1 = decodeAsn1;

const encodeAsn1 = (decodedEntity, Model) => {
  const mapValue = value => {
    // Typed array to node buffer
    if (value instanceof Uint8Array) {
      return _buffer.Buffer.from(value);
    }

    return value;
  }; // Clone argument because we are going to mutate it


  decodedEntity = (0, _cloneDeep.default)(decodedEntity); // Apply conversion to all properties deep within the entity

  decodedEntity = mapValue(decodedEntity);
  (0, _deepForEach.default)(decodedEntity, (value, key, subject) => {
    subject[key] = mapValue(value);
  });
  let encodedEntity;

  try {
    encodedEntity = Model.encode(decodedEntity, 'der');
  } catch (err) {
    /* istanbul ignore next */
    throw new _errors.EncodeAsn1FailedError(`Failed to encode ${Model.name}`, Model.name, {
      originalError: err
    });
  } // Convert Node's buffer (a typed a array) to Uint8Array


  return (0, _binary.typedArrayToUint8Array)(encodedEntity);
};

exports.encodeAsn1 = encodeAsn1;