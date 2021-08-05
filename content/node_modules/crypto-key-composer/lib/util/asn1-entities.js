"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubjectPublicKeyInfo = exports.CurvePrivateKey = exports.Rc2CbcParameter = exports.Pbkdf2Params = exports.Pbes2EsParams = exports.Pbes2Algorithms = exports.EncryptedPrivateKeyInfo = exports.PrivateKeyInfo = exports.AlgorithmIdentifier = exports.EcParameters = exports.EcPrivateKey = exports.RsaPublicKey = exports.RsaPrivateKey = void 0;

var _buffer = require("buffer");

var _asn1Encoder = require("./asn1-encoder");

var _oids = require("./oids");

/* eslint-disable newline-per-chained-call */
// RAW related entities
// ---------------------------------
const OtherPrimeInfo = (0, _asn1Encoder.define)('OtherPrimeInfo', asn1 => {
  asn1.seq().obj(asn1.key('prime').int(), asn1.key('exponent').int(), asn1.key('coefficient').int());
});
const RsaPrivateKey = (0, _asn1Encoder.define)('RSAPrivateKey', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('modulus').int(), asn1.key('publicExponent').int(), asn1.key('privateExponent').int(), asn1.key('prime1').int(), asn1.key('prime2').int(), asn1.key('exponent1').int(), asn1.key('exponent2').int(), asn1.key('coefficient').int(), asn1.key('otherPrimeInfos').seqof(OtherPrimeInfo).optional());
});
exports.RsaPrivateKey = RsaPrivateKey;
const RsaPublicKey = (0, _asn1Encoder.define)('RSAPublicKey', asn1 => {
  asn1.seq().obj(asn1.key('modulus').int(), asn1.key('publicExponent').int());
});
exports.RsaPublicKey = RsaPublicKey;
const EcPrivateKey = (0, _asn1Encoder.define)('ECPrivateKey', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('privateKey').octstr(), asn1.key('parameters').explicit(0).optional().use(EcParameters), asn1.key('publicKey').explicit(1).optional().bitstr());
});
exports.EcPrivateKey = EcPrivateKey;
const EcParameters = (0, _asn1Encoder.define)('ECParameters', asn1 => {
  asn1.choice({
    namedCurve: asn1.objid(_asn1Encoder.objidValues)
  });
}); // PKCS8 related entities
// ---------------------------------

exports.EcParameters = EcParameters;
const AlgorithmIdentifier = (0, _asn1Encoder.define)('AlgorithmIdentifier', asn1 => {
  asn1.seq().obj(asn1.key('id').objid(_asn1Encoder.objidValues), asn1.key('parameters').optional().any());
}); // This is actually a OneAsymmetricKey, defined in https://tools.ietf.org/html/rfc8410

exports.AlgorithmIdentifier = AlgorithmIdentifier;
const PrivateKeyInfo = (0, _asn1Encoder.define)('PrivateKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('privateKeyAlgorithm').use(AlgorithmIdentifier), asn1.key('privateKey').octstr(), asn1.key('attributes').implicit(0).optional().any(), asn1.key('publicKey').implicit(1).optional().bitstr());
});
exports.PrivateKeyInfo = PrivateKeyInfo;
const EncryptedPrivateKeyInfo = (0, _asn1Encoder.define)('EncryptedPrivateKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('encryptionAlgorithm').use(AlgorithmIdentifier), asn1.key('encryptedData').octstr());
});
exports.EncryptedPrivateKeyInfo = EncryptedPrivateKeyInfo;
const Pbes2Algorithms = (0, _asn1Encoder.define)('PBES2Algorithms', asn1 => {
  asn1.seq().obj(asn1.key('keyDerivationFunc').use(AlgorithmIdentifier), asn1.key('encryptionScheme').use(AlgorithmIdentifier));
});
exports.Pbes2Algorithms = Pbes2Algorithms;
const Pbes2EsParams = {
  'des-cbc': (0, _asn1Encoder.define)('desCBC', asn1 => asn1.octstr()),
  'des-ede3-cbc': (0, _asn1Encoder.define)('des-EDE3-CBC', asn1 => asn1.octstr()),
  'aes128-cbc': (0, _asn1Encoder.define)('aes128-CBC', asn1 => asn1.octstr()),
  'aes192-cbc': (0, _asn1Encoder.define)('aes192-CBC', asn1 => asn1.octstr()),
  'aes256-cbc': (0, _asn1Encoder.define)('aes256-CBC', asn1 => asn1.octstr())
};
exports.Pbes2EsParams = Pbes2EsParams;
const Pbkdf2Params = (0, _asn1Encoder.define)('PBKDF2-params', asn1 => {
  asn1.seq().obj(asn1.key('salt').choice({
    specified: asn1.octstr(),
    otherSource: asn1.use(AlgorithmIdentifier)
  }), asn1.key('iterationCount').int(), asn1.key('keyLength').int().optional(), asn1.key('prf').use(AlgorithmIdentifier).def({
    id: _oids.FLIPPED_OIDS['hmac-with-sha1'],
    parameters: _buffer.Buffer.from([0x05, 0x00])
  }));
});
exports.Pbkdf2Params = Pbkdf2Params;
const Rc2CbcParameter = (0, _asn1Encoder.define)('RC2-CBC-Parameter', asn1 => {
  asn1.seq().obj(asn1.key('rc2ParameterVersion').int().optional(), asn1.key('iv').octstr());
});
exports.Rc2CbcParameter = Rc2CbcParameter;
const CurvePrivateKey = (0, _asn1Encoder.define)('CurvePrivateKey', asn1 => {
  asn1.octstr();
}); // SPKI related entities
// ---------------------------------

exports.CurvePrivateKey = CurvePrivateKey;
const SubjectPublicKeyInfo = (0, _asn1Encoder.define)('SubjectPublicKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('algorithm').use(AlgorithmIdentifier), asn1.key('publicKey').bitstr());
});
exports.SubjectPublicKeyInfo = SubjectPublicKeyInfo;