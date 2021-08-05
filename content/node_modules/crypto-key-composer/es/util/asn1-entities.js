/* eslint-disable newline-per-chained-call */
import { Buffer } from 'buffer';
import { define, objidValues } from './asn1-encoder';
import { FLIPPED_OIDS } from './oids'; // RAW related entities
// ---------------------------------

const OtherPrimeInfo = define('OtherPrimeInfo', asn1 => {
  asn1.seq().obj(asn1.key('prime').int(), asn1.key('exponent').int(), asn1.key('coefficient').int());
});
export const RsaPrivateKey = define('RSAPrivateKey', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('modulus').int(), asn1.key('publicExponent').int(), asn1.key('privateExponent').int(), asn1.key('prime1').int(), asn1.key('prime2').int(), asn1.key('exponent1').int(), asn1.key('exponent2').int(), asn1.key('coefficient').int(), asn1.key('otherPrimeInfos').seqof(OtherPrimeInfo).optional());
});
export const RsaPublicKey = define('RSAPublicKey', asn1 => {
  asn1.seq().obj(asn1.key('modulus').int(), asn1.key('publicExponent').int());
});
export const EcPrivateKey = define('ECPrivateKey', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('privateKey').octstr(), asn1.key('parameters').explicit(0).optional().use(EcParameters), asn1.key('publicKey').explicit(1).optional().bitstr());
});
export const EcParameters = define('ECParameters', asn1 => {
  asn1.choice({
    namedCurve: asn1.objid(objidValues)
  });
}); // PKCS8 related entities
// ---------------------------------

export const AlgorithmIdentifier = define('AlgorithmIdentifier', asn1 => {
  asn1.seq().obj(asn1.key('id').objid(objidValues), asn1.key('parameters').optional().any());
}); // This is actually a OneAsymmetricKey, defined in https://tools.ietf.org/html/rfc8410

export const PrivateKeyInfo = define('PrivateKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('version').int(), asn1.key('privateKeyAlgorithm').use(AlgorithmIdentifier), asn1.key('privateKey').octstr(), asn1.key('attributes').implicit(0).optional().any(), asn1.key('publicKey').implicit(1).optional().bitstr());
});
export const EncryptedPrivateKeyInfo = define('EncryptedPrivateKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('encryptionAlgorithm').use(AlgorithmIdentifier), asn1.key('encryptedData').octstr());
});
export const Pbes2Algorithms = define('PBES2Algorithms', asn1 => {
  asn1.seq().obj(asn1.key('keyDerivationFunc').use(AlgorithmIdentifier), asn1.key('encryptionScheme').use(AlgorithmIdentifier));
});
export const Pbes2EsParams = {
  'des-cbc': define('desCBC', asn1 => asn1.octstr()),
  'des-ede3-cbc': define('des-EDE3-CBC', asn1 => asn1.octstr()),
  'aes128-cbc': define('aes128-CBC', asn1 => asn1.octstr()),
  'aes192-cbc': define('aes192-CBC', asn1 => asn1.octstr()),
  'aes256-cbc': define('aes256-CBC', asn1 => asn1.octstr())
};
export const Pbkdf2Params = define('PBKDF2-params', asn1 => {
  asn1.seq().obj(asn1.key('salt').choice({
    specified: asn1.octstr(),
    otherSource: asn1.use(AlgorithmIdentifier)
  }), asn1.key('iterationCount').int(), asn1.key('keyLength').int().optional(), asn1.key('prf').use(AlgorithmIdentifier).def({
    id: FLIPPED_OIDS['hmac-with-sha1'],
    parameters: Buffer.from([0x05, 0x00])
  }));
});
export const Rc2CbcParameter = define('RC2-CBC-Parameter', asn1 => {
  asn1.seq().obj(asn1.key('rc2ParameterVersion').int().optional(), asn1.key('iv').octstr());
});
export const CurvePrivateKey = define('CurvePrivateKey', asn1 => {
  asn1.octstr();
}); // SPKI related entities
// ---------------------------------

export const SubjectPublicKeyInfo = define('SubjectPublicKeyInfo', asn1 => {
  asn1.seq().obj(asn1.key('algorithm').use(AlgorithmIdentifier), asn1.key('publicKey').bitstr());
});