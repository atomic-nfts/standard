import ExtendableError from 'es6-error';

class BaseError extends ExtendableError {
  constructor(message, name, code, props) {
    super(message);
    this.name = name || 'BaseError';

    if (code) {
      this.code = code;
    }

    Object.assign(this, props);
  }

}

export class UnexpectedTypeError extends BaseError {
  constructor(message, props) {
    super(message, 'UnexpectedTypeError', 'UNEXPECTED_TYPE', props);
  }

}
export class AggregatedError extends BaseError {
  constructor(message, errors, props) {
    super(message, 'AggregatedError', 'AGGREGATED_ERROR', { ...props,
      errors
    });
  }

}
export class UnsupportedFormatError extends BaseError {
  constructor(format, props) {
    super(`Unsupported format '${format}'`, 'UnsupportedFormatError', 'UNSUPPORTED_FORMAT', props);
  }

}
export class UnsupportedAlgorithmError extends BaseError {
  constructor(message, props) {
    super(message, 'UnsupportedAlgorithmError', 'UNSUPPORTED_ALGORITHM', props);
  }

}
export class MissingPasswordError extends BaseError {
  constructor(message, props) {
    super(message, 'MissingPasswordError', 'MISSING_PASSWORD', props);
  }

}
export class DecryptionFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'DecryptionFailedError', 'DECRYPTION_FAILED', props);
  }

}
export class DecodeAsn1FailedError extends BaseError {
  constructor(message, modelName, props) {
    super(message, 'DecodeAsn1FailedError', 'DECODE_ASN1_FAILED', { ...props,
      modelName
    });
  }

}
export class EncodeAsn1FailedError extends BaseError {
  constructor(message, modelName, props) {
    super(message, 'EncodeAsn1FailedError', 'ENCODE_ASN1_FAILED', { ...props,
      modelName
    });
  }

}
export class DecodePemFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'DecodePemFailedError', 'DECODE_PEM_FAILED', props);
  }

}
export class EncodePemFailedError extends BaseError {
  constructor(message, props) {
    super(message, 'EncodePemFailedError', 'ENCODE_PEM_FAILED', props);
  }

}