"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodePem = exports.decodePem = void 0;

var _matcher = _interopRequireDefault(require("matcher"));

var _pem = require("node-forge/lib/pem");

var _errors = require("./errors");

var _binary = require("./binary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const decodePem = (pem, patterns) => {
  if (pem instanceof Uint8Array) {
    pem = (0, _binary.uint8ArrayToBinaryString)(pem);
  }

  let decodedPem;

  try {
    decodedPem = (0, _pem.decode)(pem);
  } catch (err) {
    throw new _errors.DecodePemFailedError('Failed to decode PEM', {
      originalError: err
    });
  }

  if (!patterns) {
    return decodedPem[0];
  } // Match pem message against the patterns


  patterns = Array.isArray(patterns) ? patterns : [patterns];
  const pemMessage = decodedPem.find(msg => (0, _matcher.default)([msg.type], patterns, {
    caseSensitive: true
  }).length > 0);

  if (!pemMessage) {
    throw new _errors.DecodePemFailedError(`Could not find pem message matching patterns: '${patterns.join('\', \'')}'`);
  }

  return pemMessage;
};

exports.decodePem = decodePem;

const encodePem = decodedPem => {
  let pem;

  try {
    pem = (0, _pem.encode)(decodedPem);
  } catch (err) {
    /* istanbul ignore next */
    throw new _errors.EncodePemFailedError('Failed to encode PEM', {
      originalError: err
    });
  }

  pem = pem.replace(/\r/g, '');
  return pem;
};

exports.encodePem = encodePem;