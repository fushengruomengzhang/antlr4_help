import { keySourceText, keyToString, tripleStringBodyText } from '../decode.js';
import { TokenStreamHelper } from './token-helpers.js';

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @returns {import('./types.js').DocumentNode}
 */
export function buildDocumentAst(root, tokenStream) {
  const helper = new TokenStreamHelper(tokenStream);
  const valueCtx = root.value();
  return {
    kind: 'document',
    before: helper.emitHidden(helper.hiddenLeft(valueCtx.start)),
    value: buildValue(valueCtx, helper),
    after: helper.emitHidden(helper.hiddenRight(helper.endToken(valueCtx))),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @param {TokenStreamHelper} helper
 * @returns {import('./types.js').ValueNode}
 */
function buildValue(ctx, helper) {
  if (ctx.object()) return buildObject(ctx.object(), helper);
  if (ctx.array()) return buildArray(ctx.array(), helper);
  if (ctx.tripleSingleString()) return buildTripleSingle(ctx.tripleSingleString(), helper);
  if (ctx.tripleDoubleString()) return buildTripleDouble(ctx.tripleDoubleString(), helper);
  return buildPrimitive(ctx);
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx
 * @returns {import('./types.js').PrimitiveNode}
 */
function buildPrimitive(ctx) {
  if (ctx.STRING()) return { kind: 'primitive', source: ctx.STRING().getText() };
  if (ctx.NUMBER()) return { kind: 'primitive', source: ctx.NUMBER().getText() };
  if (ctx.TRUE()) return { kind: 'primitive', source: 'true' };
  if (ctx.FALSE()) return { kind: 'primitive', source: 'false' };
  if (ctx.NULL()) return { kind: 'primitive', source: 'null' };
  if (ctx.literal()) return { kind: 'primitive', source: ctx.literal().getText() };
  return { kind: 'primitive', source: ctx.getText() };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleSingleStringContext} ctx
 * @param {TokenStreamHelper} helper
 */
function buildTripleSingle(ctx, helper) {
  const openTok = ctx.TRIPLE_S_OPEN().symbol;
  return {
    kind: 'tripleSingle',
    openRight: helper.emitHidden(helper.hiddenRight(openTok)),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.TripleDoubleStringContext} ctx
 * @param {TokenStreamHelper} helper
 */
function buildTripleDouble(ctx, helper) {
  const openTok = ctx.TRIPLE_D_OPEN().symbol;
  return {
    kind: 'tripleDouble',
    openRight: helper.emitHidden(helper.hiddenRight(openTok)),
    body: tripleStringBodyText(ctx),
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {TokenStreamHelper} helper
 */
function buildObject(ctx, helper) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const members = ctx.member ? ctx.member() : [];
  const n = members.length;

  /** @type {import('./types.js').ObjectEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const member = members[i];
    const keyCtx = member.key();
    const keyTok = keyCtx.start;
    const valCtx = member.value();
    const valStop = helper.endToken(valCtx);
    const prevValStop = i > 0 ? helper.endToken(members[i - 1].value()) : null;

    const hiddenLeft = helper.hiddenLeft(keyTok);
    const beforeFull = helper.emitHidden(hiddenLeft);
    const beforeCompact =
      i === 0
        ? beforeFull
        : helper.memberBefore(prevValStop, keyTok);

    const sourceNextKey =
      i < n - 1 ? members[i + 1].key().start : closeTok;
    const exclude =
      i < n - 1
        ? helper.excludedNextMemberPrefixIndices(valStop, members[i + 1].key().start)
        : undefined;
    const suffix = helper.spanBetween(valStop, sourceNextKey);
    const suffixSort = exclude
      ? helper.spanBetween(valStop, sourceNextKey, exclude)
      : suffix;

    /** @type {import('./types.js').ObjectEntry} */
    const entry = {
      before: beforeCompact,
      beforeFull,
      keySource: keySourceText(keyCtx),
      sortKey: keyToString(keyCtx),
      value: buildValue(valCtx, helper),
      afterValue: helper.emitHidden(helper.hiddenRight(valStop)),
      suffix,
      suffixSort,
    };
    entries.push(entry);
  }

  const openRightTokens = helper.hiddenRight(openTok);
  const openRightText = helper.emitHidden(openRightTokens);
  if (entries.length > 0) {
    entries[0].before = openRightText && entries[0].before.startsWith(openRightText)
      ? entries[0].before.slice(openRightText.length)
      : entries[0].before;
  }

  const closeBefore = computeCloseBefore(helper, members, closeTok, n);

  return {
    kind: 'object',
    openRight: helper.emitHidden(openRightTokens),
    entries,
    closeBefore,
  };
}

/**
 * @param {TokenStreamHelper} helper
 * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} members
 * @param {import('antlr4').Token} closeTok
 * @param {number} n
 */
function computeCloseBefore(helper, members, closeTok, n) {
  if (members.length === 0) {
    return helper.emitHidden(helper.hiddenLeft(closeTok));
  }
  const valStop = helper.endToken(members[n - 1].value());
  /** @type {Set<number>} */
  const assigned = new Set();
  for (let i = valStop.tokenIndex + 1; i < closeTok.tokenIndex; i++) {
    const t = helper.tokens.tokens[i];
    if (t) assigned.add(t.tokenIndex);
  }
  return helper.emitHidden(
    helper.hiddenLeft(closeTok).filter((t) => !assigned.has(t.tokenIndex)),
  );
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx
 * @param {TokenStreamHelper} helper
 */
function buildArray(ctx, helper) {
  const openTok = ctx.start;
  const closeTok = ctx.stop;
  const values = ctx.value ? ctx.value() : [];
  const n = values.length;

  /** @type {import('./types.js').ArrayEntry[]} */
  const entries = [];

  for (let i = 0; i < n; i++) {
    const valCtx = values[i];
    const valStop = helper.endToken(valCtx);
    const sourceNext = i < n - 1 ? values[i + 1].start : closeTok;
    const suffix = helper.spanBetween(valStop, sourceNext);
    entries.push({
      before: helper.emitHidden(helper.hiddenLeft(valCtx.start)),
      value: buildValue(valCtx, helper),
      afterValue: helper.emitHidden(helper.hiddenRight(valStop)),
      suffix,
      suffixSort: suffix,
    });
  }

  const openRightTokens = helper.hiddenRight(openTok);
  if (entries.length > 0) {
    const firstStart = values[0].start;
    const fullBefore = helper.emitHidden(helper.hiddenLeft(firstStart));
    entries[0].beforeFull = fullBefore;
    const openRightText = helper.emitHidden(openRightTokens);
    entries[0].before =
      openRightText && fullBefore.startsWith(openRightText)
        ? fullBefore.slice(openRightText.length)
        : fullBefore;
  }

  let closeBefore = '';
  if (values.length === 0) {
    closeBefore = helper.emitHidden(helper.hiddenLeft(closeTok));
  } else {
    const valStop = helper.endToken(values[n - 1]);
    /** @type {Set<number>} */
    const assigned = new Set();
    for (let i = valStop.tokenIndex + 1; i < closeTok.tokenIndex; i++) {
      const t = helper.tokens.tokens[i];
      if (t) assigned.add(t.tokenIndex);
    }
    closeBefore = helper.emitHidden(
      helper.hiddenLeft(closeTok).filter((t) => !assigned.has(t.tokenIndex)),
    );
  }

  return {
    kind: 'array',
    openRight: helper.emitHidden(openRightTokens),
    entries,
    closeBefore,
  };
}

/**
 * @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
export function buildObjectEntriesForTest(ctx, tokenStream) {
  return buildObject(ctx, new TokenStreamHelper(tokenStream)).entries;
}
