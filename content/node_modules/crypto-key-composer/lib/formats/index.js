"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_PUBLIC_FORMATS = exports.DEFAULT_PRIVATE_FORMATS = exports.PUBLIC_FORMATS = exports.PRIVATE_FORMATS = void 0;

var pkcs1Der = _interopRequireWildcard(require("./pkcs1/pkcs1-der"));

var pkcs1Pem = _interopRequireWildcard(require("./pkcs1/pkcs1-pem"));

var pkcs8Der = _interopRequireWildcard(require("./pkcs8/pkcs8-der"));

var pkcs8Pem = _interopRequireWildcard(require("./pkcs8/pkcs8-pem"));

var rawDer = _interopRequireWildcard(require("./raw/raw-der"));

var rawPem = _interopRequireWildcard(require("./raw/raw-pem"));

var spkiDer = _interopRequireWildcard(require("./spki/spki-der"));

var spkiPem = _interopRequireWildcard(require("./spki/spki-pem"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const mapPrivate = format => ({
  decomposeKey: format.decomposePrivateKey,
  composeKey: format.composePrivateKey
});

const mapPublic = format => ({
  decomposeKey: format.decomposePublicKey,
  composeKey: format.composePublicKey
});

const PRIVATE_FORMATS = {
  'pkcs1-der': mapPrivate(pkcs1Der),
  'pkcs1-pem': mapPrivate(pkcs1Pem),
  'pkcs8-der': mapPrivate(pkcs8Der),
  'pkcs8-pem': mapPrivate(pkcs8Pem),
  'raw-der': mapPrivate(rawDer),
  'raw-pem': mapPrivate(rawPem)
};
exports.PRIVATE_FORMATS = PRIVATE_FORMATS;
const PUBLIC_FORMATS = {
  'raw-der': mapPublic(rawDer),
  'raw-pem': mapPublic(rawPem),
  'spki-der': mapPublic(spkiDer),
  'spki-pem': mapPublic(spkiPem)
};
exports.PUBLIC_FORMATS = PUBLIC_FORMATS;
const DEFAULT_PRIVATE_FORMATS = ['pkcs8-pem', 'raw-pem'];
exports.DEFAULT_PRIVATE_FORMATS = DEFAULT_PRIVATE_FORMATS;
const DEFAULT_PUBLIC_FORMATS = ['spki-pem', 'raw-pem'];
exports.DEFAULT_PUBLIC_FORMATS = DEFAULT_PUBLIC_FORMATS;