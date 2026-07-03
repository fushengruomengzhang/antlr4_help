/**
 * @typedef {object} TokenCoord
 * @property {number} idx
 * @property {number} start
 * @property {number} stop
 * @property {number} line
 * @property {number} col
 * @property {string} type
 */

/**
 * @typedef {object} AnchorTriplet
 * @property {TokenCoord} prev
 * @property {TokenCoord} current
 * @property {TokenCoord} next
 */

/**
 * @typedef {DocumentNode | ObjectNode | ArrayNode | PrimitiveNode | TripleSingleNode | TripleDoubleNode} ValueNode
 */

/**
 * @typedef {object} DocumentNode
 * @property {'document'} kind
 * @property {ValueNode} value
 * @property {AnchorTriplet} lead
 * @property {AnchorTriplet} trail
 */

/**
 * @typedef {object} ObjectNode
 * @property {'object'} kind
 * @property {AnchorTriplet} open
 * @property {ObjectEntry[]} entries
 * @property {AnchorTriplet} close
 */

/**
 * @typedef {object} ArrayNode
 * @property {'array'} kind
 * @property {AnchorTriplet} open
 * @property {ArrayEntry[]} entries
 * @property {AnchorTriplet} close
 */

/**
 * @typedef {object} ObjectEntry
 * @property {AnchorTriplet} key
 * @property {string} keySource
 * @property {string} sortKey
 * @property {ValueNode} value
 * @property {AnchorTriplet} end
 * @property {boolean} endHasComma
 */

/**
 * @typedef {object} ArrayEntry
 * @property {AnchorTriplet} item
 * @property {ValueNode} value
 * @property {AnchorTriplet} end
 * @property {boolean} endHasComma
 */

/**
 * @typedef {object} PrimitiveNode
 * @property {'primitive'} kind
 * @property {string} source
 * @property {AnchorTriplet} token
 */

/**
 * @typedef {object} TripleSingleNode
 * @property {'tripleSingle'} kind
 * @property {AnchorTriplet} open
 * @property {string} body
 */

/**
 * @typedef {object} TripleDoubleNode
 * @property {'tripleDouble'} kind
 * @property {AnchorTriplet} open
 * @property {string} body
 */

export {};
