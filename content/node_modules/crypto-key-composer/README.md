# crypto-key-composer

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/crypto-key-composer
[downloads-image]:http://img.shields.io/npm/dm/crypto-key-composer.svg
[npm-image]:http://img.shields.io/npm/v/crypto-key-composer.svg
[travis-url]:https://travis-ci.org/ipfs-shipyard/js-crypto-key-composer
[travis-image]:http://img.shields.io/travis/ipfs-shipyard/js-crypto-key-composer/master.svg
[codecov-url]:https://codecov.io/gh/ipfs-shipyard/js-crypto-key-composer
[codecov-image]:https://img.shields.io/codecov/c/github/ipfs-shipyard/js-crypto-key-composer/master.svg
[david-dm-url]:https://david-dm.org/ipfs-shipyard/js-crypto-key-composer
[david-dm-image]:https://img.shields.io/david/ipfs-shipyard/js-crypto-key-composer.svg
[david-dm-dev-url]:https://david-dm.org/ipfs-shipyard/js-crypto-key-composer?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/ipfs-shipyard/js-crypto-key-composer.svg

A library to decompose and compose crypto keys of different types and formats.


## Installation

```sh
$ npm install crypto-key-composer
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants. If you target older browsers please make sure to transpile accordingly.
Moreover, some of this library's dependencies use the native Node [Buffer](https://nodejs.org/api/buffer.html) module. This means that you must compile your app through a bundler that automatically injects a Buffer compatible implementation for the browser, such as Webpack.


## API

- [`decomposePrivateKey(inputKey, [options])`](#decomposeprivatekeyinputkey-options)
- [`composePrivateKey(decomposedKey, [options])`](#composeprivatekeydecomposedkey-options)
- [`decomposePublicKey(inputKey, [options])`](#decomposepublickeyinputkey-options)
- [`composePublicKey(decomposedKey)`](#composepublickeydecomposedkey)
- [`getKeyTypeFromAlgorithm(keyAlgorithm)`](#getkeytypefromalgorithmkeyalgorithm)

### decomposePrivateKey(inputKey, [options])

Parses a private key, extracting information containing its [`format`](#formats), [`keyAlgorithm`](#key-algorithms), [`keyData`](#key-data) and [`encryptionAlgorithm`](#encryption-algorithms).

```js
import { decomposePrivateKey } from 'crypto-key-composer';

const myPrivatePemKey = `
-----BEGIN RSA PRIVATE KEY-----
ACTUAL KEY BASE64 HERE
-----END RSA PRIVATE KEY-----
`

const myPrivateDecomposedKey = decomposePrivateKey(myPrivatePemKey)
// {
//     format: 'pkcs1-pem',
//     keyAlgorithm: {
//         id: 'rsa-encryption'
//     },
//     keyData: {
//         modulus: Uint8Array(...),
//         publicExponent: Uint8Array(...),
//         privateExponent: Uint8Array(...),
//         // ...
//     },
//     encryptionAlgorithm: null
// }
```

The `inputKey` may be a TypedArray (including Node's Buffer), an ArrayBuffer or a binary string.

> ⚠️ Do not use the `keyAlgorithm.id` to identify the key type. The reason is that several identifiers map to the same key type. As an example, `rsa-encryption`, `sha512-with-rsa-encryption`, `rsa-oaep` and `rsassa-pss` are all RSA keys. Instead, use [`getKeyTypeFromAlgorithm`](#getkeytypefromalgorithmkeyalgorithm) to properly get the key type.

**Available options**:

| name | type | default | description |
| ---- | ---- | ------- | ----------- |
| format | string/Array | `['raw-pem', 'pkcs8-pem']` | Limit the parsing to one or more [`formats`](#formats) |
| password | string | | The password to use to decrypt the key |

Meaningful [errors](src/util/errors.js) with codes are thrown if something went wrong. When `options.format` is an array, this function will attempt to decompose the key for the specified formats, in order and one by one. It will succeed if the key is using one of the formats or fail if it's using another format, throwing an AggregatedError containing a `errors` property with the errors indexed by format.

### composePrivateKey(decomposedKey, [options])

Composes a private key from its parts: [`format`](#formats), [`keyAlgorithm`](#key-algorithms), [`keyData`](#key-data) and [`encryptionAlgorithm`](#encryption-algorithms). This function is the inverse of `decomposePrivateKey`.

```js
import { composePrivateKey } from 'crypto-key-composer';

const myPrivatePemKey = composePrivateKey({
    format: 'pkcs1-pem',
    keyAlgorithm: {
        id: 'rsa-encryption',
    },
    keyData: {
        modulus: Uint8Array(...),
        publicExponent: Uint8Array(...),
        privateExponent: Uint8Array(...),
        // ...
    }
});
```

The return value depends on the format. PEM based formats return a regular string while DER based formats return a Uint8Array.

**Available options**:

| name | type | default | description |
| ---- | ---- | ------- | ----------- |
| password | string | | The password to use to encrypt the key |

Meaningful [errors](src/util/errors.js) with codes are thrown if something went wrong.

### decomposePublicKey(inputKey, [options])

Parses a public key, extracting information containing its [`format`](#formats), [`keyAlgorithm`](#key-algorithms) and [`keyData`](#key-data).

```js
import { decomposePublicKey } from 'crypto-key-composer';

const myPublicPemKey = `
-----BEGIN PUBLIC KEY-----
ACTUAL KEY BASE64 HERE
-----END PUBLIC KEY-----
`

const myDecomposedPublicKey = decomposePublicKey(myPublicPemKey)
// {
//     format: 'spki-pem',
//     keyAlgorithm: {
//         id: 'rsa-encryption'
//     },
//     keyData: {
//        modulus: Uint8Array(...),
//        publicExponent: Uint8Array(...)
//     },
//     encryptionAlgorithm: null
// }
```

The `inputKey` may be a TypedArray (including Node's Buffer), an ArrayBuffer or a binary string.

> ⚠️ Do not use the `keyAlgorithm.id` to identify the key type. The reason is that several identifiers map to the same key type. As an example, `rsa-encryption`, `rsaes-oaep` and `rsassa-pss` are all RSA keys. Instead, use [`getKeyTypeFromAlgorithm`](#get-key-type-from-algorithm) to properly get the key type.

Available options:

| name | type | default | description |
| ---- | ---- | ------- | ----------- |
| format | string/Array | `['raw-pem', 'spki-pem']` | Limit the parsing to one or more formats |

Meaningful [errors](src/util/errors.js) with codes are thrown if something went wrong. When `options.format` is an array, this function will attempt to decompose the key for the specified formats, in order and one by one. It will succeed if the key is using one of the formats or fail if it's using another format, throwing an AggregatedError containing a `errors` property with the errors indexed by format.

### composePublicKey(decomposedKey)

Composes a public key from its parts: [`format`](#formats), [`keyAlgorithm`](#key-algorithms) and [`keyData`](#key-data). This function is the inverse of `decomposePublicKey`.

```js
import { composePublicKey } from 'crypto-key-composer';

const myPublicPemKey = composePublicKey({
    format: 'spki-pem',
    keyAlgorithm: {
        id: 'rsa-encryption',
    },
    keyData: {
        modulus: Uint8Array(...),
        publicExponent: Uint8Array(...)
    }
});
```

The return value depends on the format. PEM based formats return a regular string while DER based formats return a Uint8Array.

Meaningful [errors](src/util/errors.js) with codes are thrown if something went wrong.

### getKeyTypeFromAlgorithm(keyAlgorithm)

Returns the key type based on the passed key algorithm. The `keyAlgorithm` might be an object or a string.

```js
import { getKeyTypeFromAlgorithm } from 'crypto-key-composer';

getKeyTypeFromAlgorithm({ id: 'rsa-encryption' })  // rsa
getKeyTypeFromAlgorithm('rsa-encryption')  // rsa
getKeyTypeFromAlgorithm('ed25519')  // ed25519
```


## Supported formats and algorithms

### Formats

Below you will find the list of supported formats for private and public keys.

<details><summary><strong>raw-der (public & private)</strong></summary>

The `raw-der` is the DER encoded ASN1 format defined in [RFC 8017](https://tools.ietf.org/html/rfc8017) for RSA keys and in [RFC5915](https://tools.ietf.org/html/rfc5915) for EC keys.

Supported public key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)

Supported private key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)
- Just the standard `ec-public-key` EC algorithm (or the `ec` alias)

Supported encryption algorithms: *none*

> ⚠️ It's recommended to use the newer PKCS8 & SPKI formats for private and public keys respectively because they are able to store more types of keys. Moreover, PKCS8 keys may be encrypted.
</details>

<details><summary><strong>raw-pem (public & private)</strong></summary>

The `raw-pem` is the PEM encoded version of `raw-der` and is defined in [RFC 1421](https://tools.ietf.org/html/rfc1421).

Supported public key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)

Supported private key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)
- Just the standard `ec-public-key` RSA algorithm (or the `ec` alias)

Supported encryption algorithms:
- keyDerivationFunc: `openssl-derive-bytes` (default)
- encryptionScheme: `aes256-cbc` (default), `aes192-cbc`, `aes128-cbc`, `des-ede3-cbc`, `des-cbc`, `rc2-cbc`

> ⚠️ It's recommended to use the newer PKCS8 & SPKI formats for private and public keys respectively because they are able to store more types of keys. Moreover, PKCS8 keys have stronger encryption.
</details>

<details><summary><strong>pkcs1-der (private)</strong></summary>

The `pkcs1-der` is the DER encoded ASN1 format defined in [RFC 8017](https://tools.ietf.org/html/rfc8017). It's a subset of the `raw-der` format, supporting only RSA keys.

Supported private key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)

Supported encryption algorithms: *none*

> ⚠️ It's recommended to use the newer PKCS8 format for private keys because it's able to store more types of keys and support encryption.
</details>

<details><summary><strong>pkcs1-pem (private)</strong></summary>

The `pkcs1-pem` is the PEM encoded version of `pkcs1-der` and is defined in [RFC 1421](https://tools.ietf.org/html/rfc1421). It's a subset of the `raw-pem` format, supporting only RSA keys.

Supported private key algorithms:
- Just the standard `rsa-encryption` RSA algorithm (or the `rsa` alias)

Supported encryption algorithms:
- keyDerivationFunc: `openssl-derive-bytes` (default)
- encryptionScheme: `aes256-cbc` (default), `aes192-cbc`, `aes128-cbc`, `des-ede3-cbc`, `des-cbc`, `rc2-cbc`

> ⚠️ It's recommended to use the newer PKCS8 format for private keys because it's able to store more types of keys and support stronger encryption algorithms.
</details>

<details><summary><strong>pkcs8-der (private)</strong></summary>

The `pkcs8-der` is the DER encoded ASN1 format defined in [RFC 5208](https://tools.ietf.org/html/rfc5208) and [RFC 5985](https://tools.ietf.org/html/rfc5958).

Supported private key algorithms:
- RSA keys
- EC keys
- ED25519 keys

Supported encryption algorithms ([PKCS#5](https://tools.ietf.org/html/rfc8018)):
- keyDerivationFunc: `pbkdf2` (default)
- encryptionScheme: `aes256-cbc` (default), `aes192-cbc`, `aes128-cbc`, `des-ede3-cbc`, `des-cbc`, `rc2-cbc`
</details>

<details><summary><strong>pkcs8-pem (private)</strong></summary>

The `pkcs8-pem` is the PEM encoded version of `pkcs8-der` and is defined in [RFC 1421](https://tools.ietf.org/html/rfc1421).

Supported private key algorithms:
- RSA keys
- EC keys
- ED25519 keys

Supported encryption algorithms ([PKCS#5](https://tools.ietf.org/html/rfc8018)):
- keyDerivationFunc: `pbkdf2` (default)
- encryptionScheme: `aes256-cbc` (default), `aes192-cbc`, `aes128-cbc`, `des-ede3-cbc`, `des-cbc`, `rc2-cbc`
</details>

<details><summary><strong>spki-der (public)</strong></summary>

The `spki-der` is a format to represent various types of public keys and is defined in [RFC 5280](https://tools.ietf.org/html/rfc5280#page-25).

Supported public key algorithms:
- RSA keys
- EC keys
- ED25519 keys

Supported encryption algorithms: *does not apply*
</details>

<details><summary><strong>spki-pem (public)</strong></summary>

The `spki-pem` is the PEM encoded version of `spki-der` and is defined in [RFC 1421](https://tools.ietf.org/html/rfc1421).

Supported public key algorithms:
- RSA keys
- EC keys
- ED25519 keys

Supported encryption algorithms: *does not apply*
</details>

### Key Algorithms

Below you will find the list of supported key algorithms. Because the actual supported key algorithms vary from format to format, be sure to also check the [Formats](#formats) section.

<details><summary><strong>RSA keys</strong></summary>

The following RSA key algorithms are supported:
- `rsa-encryption`
- `md2-with-rsa-encryption`
- `md4-with-rsa-encryption`
- `md5-with-rsa-encryption`
- `sha1-with-rsa-encryption`
- `sha224-with-rsa-encryption`
- `sha256-with-rsa-encryption`
- `sha384-with-rsa-encryption`
- `sha512-with-rsa-encryption`
- `sha512-224-with-rsa-encryption`
- `sha512-256-with-rsa-encryption`

> ⚠️ At the moment, `rsaes-oaep` and `rsassa-pss` are not yet supported (see [issue #4](https://github.com/ipfs-shipyard/js-crypto-key-composer/issues/4)).

All of them are expressed like so:

```js
{
    keyAlgorithm: {
        id: 'rsa-encryption'
    }
}
```

Because they have no parameters, the example above may also be expressed like so:

```js
{
    keyAlgorithm: 'rsa-encryption'
}
```

You may use the `rsa` alias in the key algorithm id, which maps to `rsa-encryption`.
</details>

<details><summary><strong>EC keys</strong></summary>

The following EC (elliptic curve) algorithms are supported:

- `ec-public-key`
- `ec-dh`
- `ec-mqv`

Only named curves may be used. The following curves are supported:

-  `sect163k1`
-  `sect163r1`
-  `sect239k1`
-  `sect113r1`
-  `sect113r2`
-  `secp112r1`
-  `secp112r2`
-  `secp160r1`
-  `secp160k1`
-  `secp256k1`
-  `sect163r2`
-  `sect283k1`
-  `sect283r1`
-  `sect131r1`
-  `sect131r2`
-  `sect193r1`
-  `sect193r2`
-  `sect233k1`
-  `sect233r1`
-  `secp128r1`
-  `secp128r2`
-  `secp160r2`
-  `secp192k1`
-  `secp224k1`
-  `secp224r1`
-  `secp384r1`
-  `secp521r1`
-  `sect409k1`
-  `sect409r1`
-  `sect571k1`
-  `sect571r1`
-  `secp192r1`
-  `secp256r1`

The combination of the key algorithm and the named curve are expressed like so:

```js
{
    keyAlgorithm: {
        id: 'ec-public-key',
        namedCurve: 'secp256k1',
    }
}
```

You may use the `ec` alias in the key algorithm id, which maps to `ec-public-key`.
</details>

<details><summary><strong>ED25519 keys</strong></summary>

ED25519 keys just have a single algorithm, `ed25519`, and may be expressed like so:

```js
{
    keyAlgorithm: {
        id: 'ed25519'
    }
}
```

Because there are no parameters, the example above may also be expressed like so:

```js
{
    keyAlgorithm: 'ed25519'
}
```
</details>

### Key Data

The key data is the interpreted key contents. Below, you will find the key data structure for each key type.

<details><summary><strong>RSA private keys</strong></summary>

```js
{
    keyData: {
        modulus: Uint8Array(/* ... */),
        publicExponent: Uint8Array(/* ... */),
        privateExponent: Uint8Array(/* ... */),
        prime1: Uint8Array(/* ... */),
        prime2: Uint8Array(/* ... */),
        exponent1: Uint8Array(/* ... */),
        exponent2: Uint8Array(/* ... */),
        coefficient: Uint8Array(/* ... */),
        // Only defined if number of primes is greater than 2
        otherPrimeInfos: [
            {
                prime: Uint8Array(/* ... */),
                exponent: Uint8Array(/* ... */),
                coefficient Uint8Array(/* ... */)
            }
        ]
    }
}
```
</details>

<details><summary><strong>RSA public keys</strong></summary>
   
```js
{
    keyData: {
        modulus: Uint8Array(/* ... */),
        publicExponent: Uint8Array(/* ... */)
    }
}
```
</details>

<details><summary><strong>EC private keys</strong></summary>
   
```js
{
    keyData: {
        d: Uint8Array(/* ... */),
        x: Uint8Array(/* ... */),
        y: Uint8Array(/* ... */),
    }
}
```
</details>

<details><summary><strong>EC public keys</strong></summary>
   
```js
{
    keyData: {
        x: Uint8Array(/* ... */),
        y: Uint8Array(/* ... */),
    }
}
```
</details>

<details><summary><strong>ED25519 private keys</strong></summary>
   
```js
{
    keyData: {
        seed: Uint8Array( /* 32 bytes */)
    }
}
```

The seed is composed of 32 bytes which serves as the basis to derive the 64 bytes private key and the 32 bytes public key. This closely follows what is defined in [RFC 8032](https://tools.ietf.org/html/rfc8032#section-5.1.5).
</details>

<details><summary><strong>ED25519 public keys</strong></summary>
   
```js
{
    keyData: {
        bytes: Uint8Array( /* 32 bytes */)
    }
}
```
</details>


### Encryption Algorithms

The encryption algorithm only apply for private keys and is composed by two parts: **Key Derivation Function** and the **Encryption Scheme**. Below you will find the supported algorithms for these parts. Because the actual supported encryption algorithms vary from format to format, be sure to also check the [Formats](#formats) section.

#### Key Derivation Function

<details><summary><strong>OpenSSL derive bytes</strong></summary>
   
The `openssl-derive-bytes` is used when encrypting PKCS#1 PEM keys and was pionereed by OpenSSL to derive a key from the password.

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: {
            id: 'openssl-derive-bytes',
        }
        encryptionScheme: ...
    }
}
```

Because there are no parameters, the example above may also be expressed like so:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: 'openssl-derive-bytes',
        encryptionScheme: ...
    }
}
```
</details>

<details><summary><strong>PBKDF2</strong></summary>
   
The `pbkdf2` is used when encrypting PKCS#8 keys and is part of PKCS#5 defined by [RFC 8018](https://tools.ietf.org/html/rfc8018).

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: {
            id: 'pbkdf2',
            iterationCount: 10000,  // The number of iterations
            keyLength: 32, // Automatic, based on the `encryptionScheme`
            prf: 'hmac-with-sha512'  // The pseudo-random function
        }
        encryptionScheme: ...
    }
}
```

The parameters above are the default ones and may be omited if you don't need to tweak them. In that case, you may express the example above like so:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: 'pbkdf2',
        encryptionScheme: ...
    }
}
```

The supported `prf` values are `hmac-with-sha512` (default), `hmac-with-sha384`, `hmac-with-sha256` and `hmac-with-sha1`.
</details>

#### Encryption Scheme

<details><summary><strong>AES</strong></summary>
   
The supported AES algorithms are `aes256-cbc`,  `aes192-cbc` and `aes128-cbc`. Here's an example:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: {
            id: 'aes256-cbc',
            iv: Uint8Array(/* random bytes */)
        }
    }
}
```

The parameters may be omited if you don't need to tweak them. In that case, you may express the example above like so:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: 'aes256-cbc'
    }
}
```
</details>

<details><summary><strong>DES</strong></summary>
   
The supported DES algorithms are `des-cbc` and `des-ede3-cbc` (triple DES). Here's an example:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: {
            id: 'des-ede3-cbc',
            iv: Uint8Array(/* random bytes */)
        }
    }
}
```

The parameters may be omited if you don't need to tweak them. In that case, you may express the example above like so:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: 'aes256-cbc'
    }
}
```
</details>

<details><summary><strong>RC2</strong></summary>
   
The supported RC2 algorithm is just `rc2-cbc` with `128` (default), `64` or `40` bits. Here's an example:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: {
            id: 'rc2-cbc',
            iv: Uint8Array(/* random bytes */),
            bits: 128
        }
    }
}
```

The parameters may be omited if you don't need to tweak them. In that case, you may express the example above like so:

```js
{
    encryptionAlgorithm: {
        keyDerivationFunc: ...,
        encryptionScheme: 'rc2-cbc'
    }
}
```
</details>


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
