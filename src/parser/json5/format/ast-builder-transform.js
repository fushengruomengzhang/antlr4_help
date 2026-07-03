import { keySourceText, keyToString, tripleStringBodyText } from '../decode.js';
import {
  endToken,
  findCommaToken,
  makeTriplet,
  openLineEndToken,
  sentinelEnd,
  sentinelStart,
  streamNextToken,
  toCoord,
} from './token-slice.js';

/**
 * @typedef {object} DocumentNode
 * @property {'document'} kind
 * @property {ValueNode} value
 * @property {import('./token-slice.js').AnchorTriplet} lead
 * @property {import('./token-slice.js').AnchorTriplet} trail
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {string} [input]
 * @returns {DocumentNode}
 */
export function buildDocumentAst(root, tokenStream, input = '') {
  const valueCtx = root.value();
  const valueStop = endToken(valueCtx);
  const startSentinel = sentinelStart();
  const endSentinel = sentinelEnd(input.length || (valueStop?.stop ?? 0));

  const valueStartCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(valueCtx.start));
  const valueStopCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(valueStop));
  const nextAfterStart = streamNextToken(tokenStream, valueCtx.start);

  return {
    kind: 'document',
    value: buildValue(valueCtx, tokenStream, startSentinel, endSentinel),
    lead: makeTriplet(
      startSentinel,
      valueStartCoord,
      toCoord(nextAfterStart) ?? endSentinel,
    ),
    trail: makeTriplet(
      valueStopCoord,
      endSentinel,
      endSentinel,
    ),
  };
}

/**
 * @typedef {DocumentNode | ObjectNode | ArrayNode | PrimitiveNode | TripleSingleNode | TripleDoubleNode} ValueNode
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./token-slice.js').TokenCoord} outerPrev
 * @param {import('./token-slice.js').TokenCoord} outerNext
 */
function buildValue(ctx, tokenStream, outerPrev, outerNext) {
  if (ctx.object()) return buildObject(ctx.object(), tokenStream, outerPrev, outerNext);
  if (ctx.array()) return buildArray(ctx.array(), tokenStream, outerPrev, outerNext);
  if (ctx.tripleSingleString()) return buildTripleSingle(ctx.tripleSingleString(), tokenStream);
  if (ctx.tripleDoubleString()) return buildTripleDouble(ctx.tripleDoubleString(), tokenStream);
  return buildPrimitive(ctx, tokenStream);
}

/**
 * @typedef {object} PrimitiveNode
 * @property {'primitive'} kind
 * @property {string} source
 * @property {import('./token-slice.js').AnchorTriplet} token
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildPrimitive(ctx, tokenStream) {
  const tok = endToken(ctx);
  const coord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(tok));
  const next = streamNextToken(tokenStream, tok);
  return {
    kind: 'primitive',
    source: ctx.getText(),
    token: makeTriplet(coord, coord, toCoord(next) ?? sentinelEnd(0)),
  };
}

/**
 * @typedef {object} TripleSingleNode
 * @property {'tripleSingle'} kind
 * @property {import('./token-slice.js').AnchorTriplet} open
 * @property {string} body
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleSingleStringContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildTripleSingle(ctx, tokenStream) {
  const openTok = ctx.TRIPLE_S_OPEN().symbol;
  const closeTok = ctx.TRIPLE_S_CLOSE().symbol;
  const openCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openTok));
  const next = openLineEndToken(tokenStream, openTok, closeTok);
  return {
    kind: 'tripleSingle',
    open: makeTriplet(openCoord, openCoord, /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(next))),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @typedef {object} TripleDoubleNode
 * @property {'tripleDouble'} kind
 * @property {import('./token-slice.js').AnchorTriplet} open
 * @property {string} body
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleDoubleStringContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildTripleDouble(ctx, tokenStream) {
  const openTok = ctx.TRIPLE_D_OPEN().symbol;
  const closeTok = ctx.TRIPLE_D_CLOSE().symbol;
  const openCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openTok));
  const next = openLineEndToken(tokenStream, openTok, closeTok);
  return {
    kind: 'tripleDouble',
    open: makeTriplet(openCoord, openCoord, /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(next))),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @typedef {object} ObjectEntry
 * @property {import('./token-slice.js').AnchorTriplet} key
 * @property {string} keySource
 * @property {string} sortKey
 * @property {ValueNode} value
 * @property {import('./token-slice.js').AnchorTriplet} end
 * @property {boolean} endHasComma
 */

/**
 * @typedef {object} ObjectNode
 * @property {'object'} kind
 * @property {import('./token-slice.js').AnchorTriplet} open
 * @property {ObjectEntry[]} entries
 * @property {import('./token-slice.js').AnchorTriplet} close
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./token-slice.js').TokenCoord} outerPrev
 * @param {import('./token-slice.js').TokenCoord} outerNext
 */
function buildObject(ctx, tokenStream, outerPrev, outerNext) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const openCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openTok));
  const closeCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(closeTok));
  const members = ctx.member ? ctx.member() : [];
  const n = members.length;

  const openFallback = n > 0 ? members[0].key().start : closeTok;
  const openNextTok = openLineEndToken(tokenStream, openTok, openFallback);
  const open = makeTriplet(
    outerPrev,
    openCoord,
    /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openNextTok)),
  );

  /** @type {ObjectEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const member = members[i];
    const keyCtx = member.key();
    const keyTok = keyCtx.start;
    const valCtx = member.value();
    const valStop = endToken(valCtx);
    const keyCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(keyTok));
    const colonTok = streamNextToken(tokenStream, keyTok);
    const nextKeyTok = i < n - 1 ? members[i + 1].key().start : closeTok;

    const keyPrev =
      i === 0 ? openCoord : /** @type {import('./token-slice.js').TokenCoord} */ (entries[i - 1].end.current);

    const commaTok = findCommaToken(tokenStream, valStop.tokenIndex, nextKeyTok.tokenIndex);
    const endCurrentTok = commaTok ?? valStop;
    const endCurrentCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(endCurrentTok));
    const endNextCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(nextKeyTok));

    entries.push({
      key: makeTriplet(
        keyPrev,
        keyCoord,
        /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(colonTok)),
      ),
      keySource: keySourceText(keyCtx),
      sortKey: keyToString(keyCtx),
      value: buildValue(valCtx, tokenStream, endCurrentCoord, endNextCoord),
      end: makeTriplet(
        /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(valStop)),
        endCurrentCoord,
        endNextCoord,
      ),
      endHasComma: !!commaTok,
    });
  }

  const closePrev = n > 0 ? entries[n - 1].end.current : openCoord;

  return {
    kind: 'object',
    open,
    entries,
    close: makeTriplet(closePrev, closeCoord, outerNext),
  };
}

/**
 * @typedef {object} ArrayEntry
 * @property {import('./token-slice.js').AnchorTriplet} item
 * @property {ValueNode} value
 * @property {import('./token-slice.js').AnchorTriplet} end
 * @property {boolean} endHasComma
 */

/**
 * @typedef {object} ArrayNode
 * @property {'array'} kind
 * @property {import('./token-slice.js').AnchorTriplet} open
 * @property {ArrayEntry[]} entries
 * @property {import('./token-slice.js').AnchorTriplet} close
 */

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./token-slice.js').TokenCoord} outerPrev
 * @param {import('./token-slice.js').TokenCoord} outerNext
 */
function buildArray(ctx, tokenStream, outerPrev, outerNext) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const openCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openTok));
  const closeCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(closeTok));
  const values = ctx.value ? ctx.value() : [];
  const n = values.length;

  const openNext = n > 0 ? values[0].start : closeTok;
  const openNextTok = openLineEndToken(tokenStream, openTok, openNext);
  const open = makeTriplet(
    outerPrev,
    openCoord,
    /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(openNextTok)),
  );

  /** @type {ArrayEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const valCtx = values[i];
    const valStart = valCtx.start;
    const valStop = endToken(valCtx);
    const itemCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(valStart));
    const nextItemTok = i < n - 1 ? values[i + 1].start : closeTok;

    const itemPrev =
      i === 0 ? openCoord : /** @type {import('./token-slice.js').TokenCoord} */ (entries[i - 1].end.current);

    const commaTok = findCommaToken(tokenStream, valStop.tokenIndex, nextItemTok.tokenIndex);
    const endCurrentTok = commaTok ?? valStop;
    const endCurrentCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(endCurrentTok));
    const endNextCoord = /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(nextItemTok));

    entries.push({
      item: makeTriplet(itemPrev, itemCoord, endCurrentCoord),
      value: buildValue(valCtx, tokenStream, endCurrentCoord, endNextCoord),
      end: makeTriplet(
        /** @type {import('./token-slice.js').TokenCoord} */ (toCoord(valStop)),
        endCurrentCoord,
        endNextCoord,
      ),
      endHasComma: !!commaTok,
    });
  }

  const closePrev = n > 0 ? entries[n - 1].end.current : openCoord;

  return {
    kind: 'array',
    open,
    entries,
    close: makeTriplet(closePrev, closeCoord, outerNext),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
export function buildObjectEntriesForTest(ctx, tokenStream) {
  const startSentinel = sentinelStart();
  const endSentinel = sentinelEnd(0);
  return buildObject(ctx, tokenStream, startSentinel, endSentinel).entries;
}

/**
 * @internal bench/test only — not part of public JSON5 API
 * @param {DocumentNode} doc
 * @param {import('../format.js').ResolvedFormatOptions} options
 * @returns {DocumentNode}
 */
export function transformDocumentAst(doc, options) {
  return {
    ...doc,
    value: transformValue(doc.value, options),
  };
}

/**
 * @param {ValueNode} node
 * @param {import('../format.js').ResolvedFormatOptions} options
 */
function transformValue(node, options) {
  if (node.kind === 'object') return transformObject(node, options);
  if (node.kind === 'array') return transformArray(node, options);
  return node;
}

/**
 * @param {ObjectNode} node
 * @param {import('../format.js').ResolvedFormatOptions} options
 */
function transformObject(node, options) {
  let entries = node.entries.map((entry) => ({
    ...entry,
    value: transformValue(entry.value, options),
  }));

  if (options.sortKeys) {
    entries = entries
      .map((entry, ord) => ({ entry, ord }))
      .sort((a, b) => a.entry.sortKey.localeCompare(b.entry.sortKey) || a.ord - b.ord)
      .map((x) => x.entry);
  }

  return { ...node, entries };
}

/**
 * @param {ArrayNode} node
 * @param {import('../format.js').ResolvedFormatOptions} options
 */
function transformArray(node, options) {
  const entries = node.entries.map((entry) => ({
    ...entry,
    value: transformValue(entry.value, options),
  }));
  return { ...node, entries };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {string} input
 * @param {import('../format.js').ResolvedFormatOptions} options
 * @returns {DocumentNode}
 */
export function buildAndTransformDocumentAst(root, tokenStream, input, options) {
  return transformDocumentAst(buildDocumentAst(root, tokenStream, input), options);
}
