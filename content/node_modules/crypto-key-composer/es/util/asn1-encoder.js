import deepForEach from 'deep-for-each';
import cloneDeep from 'clone-deep';
import asn1 from '@lordvlad/asn1.js';
import { Buffer } from 'buffer';
import { typedArrayToUint8Array, bnToUint8Array } from './binary';
import { EncodeAsn1FailedError, DecodeAsn1FailedError } from './errors'; // Ensure that all asn1 objid are returned as strings separated with '.'
// See https://github.com/indutny/asn1.js/blob/b99ce086320e0123331e6272f6de75548c6855fa/lib/asn1/decoders/der.js#L198

export const objidValues = new Proxy({}, {
  get: (obj, key) => {
    if (key === 'hasOwnProperty') {
      return key => key.indexOf('.') > 0;
    }

    return key.indexOf('.') > 0 ? key : undefined;
  }
});
/* eslint-disable babel/no-invalid-this*/

export const define = (name, fn) => asn1.define(name, function () {
  fn(this);
});
/* eslint-enable babel/no-invalid-this*/

export const decodeAsn1 = (encodedEntity, Model) => {
  let decodedEntity;

  try {
    decodedEntity = Model.decode(Buffer.from(encodedEntity), 'der');
  } catch (err) {
    throw new DecodeAsn1FailedError(`Failed to decode ${Model.name}`, Model.name, {
      originalError: err
    });
  }

  const mapValue = value => {
    // Convert any typed array, including Node's buffer, to Uint8Array
    if (ArrayBuffer.isView(value)) {
      return typedArrayToUint8Array(value);
    } // Big number to array buffer


    if (value && value.toArrayLike) {
      return bnToUint8Array(value);
    }

    return value;
  }; // Apply conversion to all properties deep within the entity


  deepForEach(decodedEntity, (value, key, subject) => {
    subject[key] = mapValue(value);
  });
  return mapValue(decodedEntity);
};
export const encodeAsn1 = (decodedEntity, Model) => {
  const mapValue = value => {
    // Typed array to node buffer
    if (value instanceof Uint8Array) {
      return Buffer.from(value);
    }

    return value;
  }; // Clone argument because we are going to mutate it


  decodedEntity = cloneDeep(decodedEntity); // Apply conversion to all properties deep within the entity

  decodedEntity = mapValue(decodedEntity);
  deepForEach(decodedEntity, (value, key, subject) => {
    subject[key] = mapValue(value);
  });
  let encodedEntity;

  try {
    encodedEntity = Model.encode(decodedEntity, 'der');
  } catch (err) {
    /* istanbul ignore next */
    throw new EncodeAsn1FailedError(`Failed to encode ${Model.name}`, Model.name, {
      originalError: err
    });
  } // Convert Node's buffer (a typed a array) to Uint8Array


  return typedArrayToUint8Array(encodedEntity);
};