"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _random = _interopRequireDefault(require("node-forge/lib/random"));

var _binary = require("./binary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const randomBytes = size => (0, _binary.binaryStringToUint8Array)(_random.default.getBytesSync(size));

var _default = randomBytes;
exports.default = _default;
module.exports = exports.default;