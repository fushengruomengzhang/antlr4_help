import { randomUUID } from 'node:crypto';

/** @type {Set<string>} */
const seen = new Set();

/**
 * @returns {string}
 */
export function snowflakeId() {
  for (let attempt = 0; attempt < 16; attempt++) {
    const id = randomUUID();
    if (!seen.has(id)) {
      seen.add(id);
      return id;
    }
  }
  throw new Error('snowflakeId: failed to generate unique id');
}
