import * as pkcs1Der from './pkcs1/pkcs1-der';
import * as pkcs1Pem from './pkcs1/pkcs1-pem';
import * as pkcs8Der from './pkcs8/pkcs8-der';
import * as pkcs8Pem from './pkcs8/pkcs8-pem';
import * as rawDer from './raw/raw-der';
import * as rawPem from './raw/raw-pem';
import * as spkiDer from './spki/spki-der';
import * as spkiPem from './spki/spki-pem';

const mapPrivate = format => ({
  decomposeKey: format.decomposePrivateKey,
  composeKey: format.composePrivateKey
});

const mapPublic = format => ({
  decomposeKey: format.decomposePublicKey,
  composeKey: format.composePublicKey
});

export const PRIVATE_FORMATS = {
  'pkcs1-der': mapPrivate(pkcs1Der),
  'pkcs1-pem': mapPrivate(pkcs1Pem),
  'pkcs8-der': mapPrivate(pkcs8Der),
  'pkcs8-pem': mapPrivate(pkcs8Pem),
  'raw-der': mapPrivate(rawDer),
  'raw-pem': mapPrivate(rawPem)
};
export const PUBLIC_FORMATS = {
  'raw-der': mapPublic(rawDer),
  'raw-pem': mapPublic(rawPem),
  'spki-der': mapPublic(spkiDer),
  'spki-pem': mapPublic(spkiPem)
};
export const DEFAULT_PRIVATE_FORMATS = ['pkcs8-pem', 'raw-pem'];
export const DEFAULT_PUBLIC_FORMATS = ['spki-pem', 'raw-pem'];