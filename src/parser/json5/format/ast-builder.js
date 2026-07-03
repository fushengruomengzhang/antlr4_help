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
 * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {string} [input]
 * @returns {import('./types.js').DocumentNode}
 */
export function buildDocumentAst(root, tokenStream, input = '') {
  const valueCtx = root.value();
  const valueStop = endToken(valueCtx);
  const startSentinel = sentinelStart();
  const endSentinel = sentinelEnd(input.length || (valueStop?.stop ?? 0));

  const valueStartCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(valueCtx.start));
  const valueStopCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(valueStop));
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
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./types.js').TokenCoord} outerPrev
 * @param {import('./types.js').TokenCoord} outerNext
 */
function buildValue(ctx, tokenStream, outerPrev, outerNext) {
  if (ctx.object()) return buildObject(ctx.object(), tokenStream, outerPrev, outerNext);
  if (ctx.array()) return buildArray(ctx.array(), tokenStream, outerPrev, outerNext);
  if (ctx.tripleSingleString()) return buildTripleSingle(ctx.tripleSingleString(), tokenStream);
  if (ctx.tripleDoubleString()) return buildTripleDouble(ctx.tripleDoubleString(), tokenStream);
  return buildPrimitive(ctx, tokenStream);
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildPrimitive(ctx, tokenStream) {
  const tok = endToken(ctx);
  const coord = /** @type {import('./types.js').TokenCoord} */ (toCoord(tok));
  const next = streamNextToken(tokenStream, tok);
  return {
    kind: 'primitive',
    source: ctx.getText(),
    token: makeTriplet(coord, coord, toCoord(next) ?? sentinelEnd(0)),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleSingleStringContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildTripleSingle(ctx, tokenStream) {
  const openTok = ctx.TRIPLE_S_OPEN().symbol;
  const closeTok = ctx.TRIPLE_S_CLOSE().symbol;
  const openCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(openTok));
  const next = openLineEndToken(tokenStream, openTok, closeTok);
  return {
    kind: 'tripleSingle',
    open: makeTriplet(openCoord, openCoord, /** @type {import('./types.js').TokenCoord} */ (toCoord(next))),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleDoubleStringContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
function buildTripleDouble(ctx, tokenStream) {
  const openTok = ctx.TRIPLE_D_OPEN().symbol;
  const closeTok = ctx.TRIPLE_D_CLOSE().symbol;
  const openCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(openTok));
  const next = openLineEndToken(tokenStream, openTok, closeTok);
  return {
    kind: 'tripleDouble',
    open: makeTriplet(openCoord, openCoord, /** @type {import('./types.js').TokenCoord} */ (toCoord(next))),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./types.js').TokenCoord} outerPrev
 * @param {import('./types.js').TokenCoord} outerNext
 */
function buildObject(ctx, tokenStream, outerPrev, outerNext) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const openCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(openTok));
  const closeCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(closeTok));
  const members = ctx.member ? ctx.member() : [];
  const n = members.length;

  const openFallback = n > 0 ? members[0].key().start : closeTok;
  const openNextTok = openLineEndToken(tokenStream, openTok, openFallback);
  const open = makeTriplet(
    outerPrev,
    openCoord,
    /** @type {import('./types.js').TokenCoord} */ (toCoord(openNextTok)),
  );

  /** @type {import('./types.js').ObjectEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const member = members[i];
    const keyCtx = member.key();
    const keyTok = keyCtx.start;
    const valCtx = member.value();
    const valStop = endToken(valCtx);
    const keyCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(keyTok));
    const colonTok = streamNextToken(tokenStream, keyTok);
    const nextKeyTok = i < n - 1 ? members[i + 1].key().start : closeTok;

    const keyPrev =
      i === 0 ? openCoord : /** @type {import('./types.js').TokenCoord} */ (entries[i - 1].end.current);

    const commaTok = findCommaToken(tokenStream, valStop.tokenIndex, nextKeyTok.tokenIndex);
    const endCurrentTok = commaTok ?? valStop;
    const endCurrentCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(endCurrentTok));
    const endNextCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(nextKeyTok));

    entries.push({
      key: makeTriplet(
        keyPrev,
        keyCoord,
        /** @type {import('./types.js').TokenCoord} */ (toCoord(colonTok)),
      ),
      keySource: keySourceText(keyCtx),
      sortKey: keyToString(keyCtx),
      value: buildValue(valCtx, tokenStream, endCurrentCoord, endNextCoord),
      end: makeTriplet(
        /** @type {import('./types.js').TokenCoord} */ (toCoord(valStop)),
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
 * @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./types.js').TokenCoord} outerPrev
 * @param {import('./types.js').TokenCoord} outerNext
 */
function buildArray(ctx, tokenStream, outerPrev, outerNext) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const openCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(openTok));
  const closeCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(closeTok));
  const values = ctx.value ? ctx.value() : [];
  const n = values.length;

  const openNext = n > 0 ? values[0].start : closeTok;
  const openNextTok = openLineEndToken(tokenStream, openTok, openNext);
  const open = makeTriplet(
    outerPrev,
    openCoord,
    /** @type {import('./types.js').TokenCoord} */ (toCoord(openNextTok)),
  );

  /** @type {import('./types.js').ArrayEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const valCtx = values[i];
    const valStart = valCtx.start;
    const valStop = endToken(valCtx);
    const itemCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(valStart));
    const nextItemTok = i < n - 1 ? values[i + 1].start : closeTok;

    const itemPrev =
      i === 0 ? openCoord : /** @type {import('./types.js').TokenCoord} */ (entries[i - 1].end.current);

    const commaTok = findCommaToken(tokenStream, valStop.tokenIndex, nextItemTok.tokenIndex);
    const endCurrentTok = commaTok ?? valStop;
    const endCurrentCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(endCurrentTok));
    const endNextCoord = /** @type {import('./types.js').TokenCoord} */ (toCoord(nextItemTok));

    entries.push({
      item: makeTriplet(itemPrev, itemCoord, endCurrentCoord),
      value: buildValue(valCtx, tokenStream, endCurrentCoord, endNextCoord),
      end: makeTriplet(
        /** @type {import('./types.js').TokenCoord} */ (toCoord(valStop)),
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
