"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EncodePemFailedError = exports.DecodePemFailedError = exports.EncodeAsn1FailedError = exports.DecodeAsn1FailedError = exports.DecryptionFailedError = exports.MissingPasswordError = exports.UnsupportedAlgorithmError = exports.UnsupportedFormatError = exports.AggregatedError = exports.UnexpectedTypeError = void 0;

var _es6Error = _interopRequireDefault(require("es6-error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BaseError extends _es6Error.default {
  constructor(message, name, code, props) {
    super(message);
    this.name = name || 'BaseError';

    if (code) {
      this.code = code;
    }

    Object.assign(this, props);
  }

}

class UnexpectedTypeError extends BaseError {
  constructor(message, props) {
    super(message, 'UnexpectedTypeError', 'UNEXPECTED_TYPE', props);
  }

}

exports.UnexpectedTypeError = UnexpectedTypeError;

class AggregatedError extends BaseError {
  constructor(message, errors, props) {
    super(message, 'AggregatedError', 'AGGREGATED_ERROR', { ...props,
      errors
    });
  }

}

exports.AggregatedError = AggregatedError;

class UnsupportedFormatError extends BaseError {
  constructor(format, props) {
    super(`Unsupported format '${format}'`, 'UnsupportedFormatError', 'UNSUPPORTED_FORMAT', props);
  }

}

exports.UnsupportedFormatError = UnsupportedFormatError;

class UnsupportedAlgorithmError extends BaseError {
  constructor(message, props) {
    super(message, 'UnsupportedAlgorithmError', 'UNSUPPORTED_ALGORITHM', props);
  }

}

exports.UnsupportedAlgorithmError = UnsupportedAlgorithmError;

class MissingPasswordError extends BaseError {
  constructor(message, props) {
    super(message, 'MissingPasswordError', 'MISSING_PASSWORD', props);
  }

}

exports.MissingPasswordError = MissingPasswordError;

class DecryptionFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'DecryptionFailedError', 'DECRYPTION_FAILED', props);
  }

}

exports.DecryptionFailedError = DecryptionFailedError;

class DecodeAsn1FailedError extends BaseError {
  constructor(message, modelName, props) {
    super(message, 'DecodeAsn1FailedError', 'DECODE_ASN1_FAILED', { ...props,
      modelName
    });
  }

}

exports.DecodeAsn1FailedError = DecodeAsn1FailedError;

class EncodeAsn1FailedError extends BaseError {
  constructor(message, modelName, props) {
    super(message, 'EncodeAsn1FailedError', 'ENCODE_ASN1_FAILED', { ...props,
      modelName
    });
  }

}

exports.EncodeAsn1FailedError = EncodeAsn1FailedError;

class DecodePemFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'DecodePemFailedError', 'DECODE_PEM_FAILED', props);
  }

}

exports.DecodePemFailedError = DecodePemFailedError;

class EncodePemFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'EncodePemFailedError', 'ENCODE_PEM_FAILED', props);
  }

}

exports.EncodePemFailedError = EncodePemFailedError;