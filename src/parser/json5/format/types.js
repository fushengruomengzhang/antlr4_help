/**
 * @typedef {DocumentNode | ObjectNode | ArrayNode | PrimitiveNode | TripleSingleNode | TripleDoubleNode} ValueNode
 */

/**
 * @typedef {object} DocumentNode
 * @property {'document'} kind
 * @property {string} before
 * @property {ValueNode} value
 * @property {string} after
 */

/**
 * @typedef {object} ObjectNode
 * @property {'object'} kind
 * @property {string} openRight
 * @property {ObjectEntry[]} entries
 * @property {string} closeBefore
 */

/**
 * @typedef {object} ArrayNode
 * @property {'array'} kind
 * @property {string} openRight
 * @property {ArrayEntry[]} entries
 * @property {string} closeBefore
 */

/**
 * @typedef {object} ObjectEntry
 * @property {string} before compact / sort prefix hidden before key
 * @property {string} [beforeFull] pretty non-sort full hiddenLeft before key
 * @property {string} keySource
 * @property {string} sortKey
 * @property {ValueNode} value
 * @property {string} afterValue hidden immediately after value (pretty non-sort path)
 * @property {string} suffix full source-order suffix (compact non-sort)
 * @property {string} suffixSort suffix excluding next-member pure prefix (sortKeys)
 */

/**
 * @typedef {object} ArrayEntry
 * @property {string} before
 * @property {ValueNode} value
 * @property {string} afterValue
 * @property {string} suffix
 * @property {string} suffixSort
 */

/**
 * @typedef {object} PrimitiveNode
 * @property {'primitive'} kind
 * @property {string} source
 */

/**
 * @typedef {object} TripleSingleNode
 * @property {'tripleSingle'} kind
 * @property {string} openRight
 * @property {string} body
 */

/**
 * @typedef {object} TripleDoubleNode
 * @property {'tripleDouble'} kind
 * @property {string} openRight
 * @property {string} body
 */

export {};
