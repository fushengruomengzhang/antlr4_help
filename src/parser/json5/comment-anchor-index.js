import antlr4 from 'antlr4';

const HIDDEN = antlr4.Token.HIDDEN_CHANNEL;

/** @typedef {{ idx: number, text: string }} TriviaEntry */

/**
 * @typedef {object} MemberAnchor
 * @property {import('antlr4').Token[]} prefixSorted
 * @property {TriviaEntry[]} suffixEntries
 */

/**
 * @typedef {object} ObjectAnchor
 * @property {import('antlr4').Token[]} openAfter
 */

/**
 * @typedef {object} CommentAnchorIndex
 * @property {{ before: import('antlr4').Token[], after: import('antlr4').Token[] }} doc
 * @property {WeakMap<object, ObjectAnchor>} objects
 * @property {WeakMap<object, MemberAnchor>} memberAnchors
 */

/** @param {import('antlr4').ParserRuleContext | null | undefined} ctx */
function endToken(ctx) {
  if (!ctx) return null;
  if (ctx.stop) return ctx.stop;
  if (ctx.start) return ctx.start;
  return null;
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} token
 */
function hiddenLeft(tokenStream, token) {
  if (!token || token.tokenIndex == null) return [];
  const hidden = tokenStream.getHiddenTokensToLeft(token.tokenIndex, HIDDEN);
  return hidden ?? [];
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} token
 */
function hiddenRight(tokenStream, token) {
  if (!token || token.tokenIndex == null) return [];
  const idx = token.tokenIndex;
  if (idx >= tokenStream.tokens.length - 1) return [];
  const hidden = tokenStream.getHiddenTokensToRight(idx, HIDDEN);
  return hidden ?? [];
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} fromTok
 * @param {import('antlr4').Token} toTok
 * @param {Set<number>} [excludeTokenIndices]
 * @returns {TriviaEntry[]}
 */
function spanEntries(tokenStream, fromTok, toTok, excludeTokenIndices) {
  if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
    return [];
  }
  /** @type {TriviaEntry[]} */
  const entries = [];
  for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
    const t = tokenStream.tokens[i];
    if (!t || t.type === antlr4.Token.EOF) continue;
    if (excludeTokenIndices?.has(t.tokenIndex)) continue;
    entries.push({ idx: t.tokenIndex, text: t.text });
  }
  return entries;
}

/**
 * @param {TriviaEntry[]} entries
 */
function entriesToText(entries) {
  return entries.map((e) => e.text).join('');
}

/**
 * @param {string} span
 * @param {import('antlr4').Token} commentToken
 */
function isNextMemberPurePrefixFromSpan(span, commentToken) {
  const commentText = commentToken.text;
  const idx = span.indexOf(commentText);
  if (idx < 0) return false;
  const beforeComment = span.slice(0, idx);
  const lastComma = beforeComment.lastIndexOf(',');
  if (lastComma < 0) return true;
  return /\n/.test(beforeComment.slice(lastComma + 1));
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} valStop
 * @param {import('antlr4').Token} nextKeyTok
 * @param {import('antlr4').Token} commentToken
 */
function isNextMemberPurePrefix(tokenStream, valStop, nextKeyTok, commentToken) {
  const span = entriesToText(spanEntries(tokenStream, valStop, nextKeyTok));
  return isNextMemberPurePrefixFromSpan(span, commentToken);
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} valStop
 * @param {import('antlr4').Token} nextKeyTok
 * @param {import('antlr4').Token[]} hiddenLeftTokens
 */
function purePrefixHiddenTokens(tokenStream, valStop, nextKeyTok, hiddenLeftTokens) {
  let firstPurePrefixIdx = hiddenLeftTokens.length;
  for (let i = 0; i < hiddenLeftTokens.length; i++) {
    const t = hiddenLeftTokens[i];
    if (
      (t.text.includes('//') || t.text.includes('/*')) &&
      isNextMemberPurePrefix(tokenStream, valStop, nextKeyTok, t)
    ) {
      firstPurePrefixIdx = i;
      break;
    }
  }
  if (firstPurePrefixIdx >= hiddenLeftTokens.length) {
    return [];
  }
  return hiddenLeftTokens.slice(firstPurePrefixIdx);
}

/**
 * sort 路径 member prefix（与 FormatEmitter.hiddenLeftForSortedMember 一致，不含 emitted 过滤）。
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} keyTok
 * @param {number} sourceIdx
 * @param {object[]} sourceMembers
 */
function computePrefixSorted(tokenStream, keyTok, sourceIdx, sourceMembers) {
  let hidden = hiddenLeft(tokenStream, keyTok);
  if (sourceIdx > 0) {
    const prevValStop = endToken(sourceMembers[sourceIdx - 1].value());
    let firstPurePrefixIdx = hidden.length;
    for (let i = 0; i < hidden.length; i++) {
      const t = hidden[i];
      if (
        (t.text.includes('//') || t.text.includes('/*')) &&
        isNextMemberPurePrefix(tokenStream, prevValStop, keyTok, t)
      ) {
        firstPurePrefixIdx = i;
        break;
      }
    }
    if (firstPurePrefixIdx < hidden.length) {
      hidden = hidden.slice(firstPurePrefixIdx).filter((t) => {
        if (!t.text.includes('//') && !t.text.includes('/*')) {
          return true;
        }
        return isNextMemberPurePrefix(tokenStream, prevValStop, keyTok, t);
      });
    } else {
      hidden = [];
    }
  }
  return hidden;
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} valStop
 * @param {import('antlr4').Token} sourceNextKey
 * @param {number} sourceIdx
 * @param {object[]} sourceMembers
 * @returns {Set<number> | undefined}
 */
function excludedNextMemberPrefixIndices(tokenStream, valStop, sourceNextKey, sourceIdx, sourceMembers) {
  if (sourceIdx < 0 || sourceIdx >= sourceMembers.length - 1) {
    return undefined;
  }
  const nextMember = sourceMembers[sourceIdx + 1];
  if (nextMember.key().start !== sourceNextKey) {
    return undefined;
  }
  const hiddenLeftNext = hiddenLeft(tokenStream, sourceNextKey);
  const purePrefix = purePrefixHiddenTokens(tokenStream, valStop, sourceNextKey, hiddenLeftNext);
  if (purePrefix.length === 0) return undefined;
  return new Set(purePrefix.map((t) => t.tokenIndex));
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {object} objCtx
 * @param {WeakMap<object, ObjectAnchor>} objects
 * @param {WeakMap<object, MemberAnchor>} memberAnchors
 */
function collectObjectAnchors(tokenStream, objCtx, objects, memberAnchors) {
  const openTok = objCtx.start;
  const closeTok = objCtx.stop;
  const sourceMembers = objCtx.member ? objCtx.member() : [];

  objects.set(objCtx, {
    openAfter: hiddenRight(tokenStream, openTok),
  });

  for (let i = 0; i < sourceMembers.length; i++) {
    const member = sourceMembers[i];
    const keyTok = member.key().start;
    const valStop = endToken(member.value());
    const sourceNextKey =
      i < sourceMembers.length - 1 ? sourceMembers[i + 1].key().start : closeTok;

    collectValueAnchors(tokenStream, member.value(), objects, memberAnchors);

    const excludeIndices = excludedNextMemberPrefixIndices(
      tokenStream,
      valStop,
      sourceNextKey,
      i,
      sourceMembers,
    );

    memberAnchors.set(member, {
      prefixSorted: computePrefixSorted(tokenStream, keyTok, i, sourceMembers),
      suffixEntries: spanEntries(tokenStream, valStop, sourceNextKey, excludeIndices),
    });
  }
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {object} valueCtx
 * @param {WeakMap<object, ObjectAnchor>} objects
 * @param {WeakMap<object, MemberAnchor>} memberAnchors
 */
function collectValueAnchors(tokenStream, valueCtx, objects, memberAnchors) {
  if (!valueCtx) return;
  if (valueCtx.object()) {
    collectObjectAnchors(tokenStream, valueCtx.object(), objects, memberAnchors);
    return;
  }
  if (valueCtx.array()) {
    const arrCtx = valueCtx.array();
    const values = arrCtx.value ? arrCtx.value() : [];
    for (const v of values) {
      collectValueAnchors(tokenStream, v, objects, memberAnchors);
    }
  }
}

/**
 * parse + fill 后构建注释锚点索引（单次 token 区间扫描，按 object/member 预分类）。
 * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @returns {CommentAnchorIndex}
 */
export function buildCommentAnchorIndex(root, tokenStream) {
  tokenStream.fill();

  /** @type {WeakMap<object, ObjectAnchor>} */
  const objects = new WeakMap();
  /** @type {WeakMap<object, MemberAnchor>} */
  const memberAnchors = new WeakMap();

  const valueCtx = root.value();
  const doc = {
    before: hiddenLeft(tokenStream, valueCtx.start),
    after: hiddenRight(tokenStream, endToken(valueCtx)),
  };

  collectValueAnchors(tokenStream, valueCtx, objects, memberAnchors);

  return { doc, objects, memberAnchors };
}
