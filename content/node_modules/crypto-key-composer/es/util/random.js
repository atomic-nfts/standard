import random from 'node-forge/lib/random';
import { binaryStringToUint8Array } from './binary';

const randomBytes = size => binaryStringToUint8Array(random.getBytesSync(size));

export default randomBytes;