import antlr4 from 'antlr4';

const HIDDEN = antlr4.Token.HIDDEN_CHANNEL;

/** @typedef {{ idx: number, text: string }} SpanEntry */

/**
 * Build-phase token stream helpers (not used during emit).
 */
export class TokenStreamHelper {
  /**
   * @param {import('antlr4').CommonTokenStream} tokenStream
   */
  constructor(tokenStream) {
    this.tokens = tokenStream;
    this._tokensFilled = false;
    /** @type {Map<string, SpanEntry[]>} */
    this._spanCache = new Map();
  }

  ensureTokensFilled() {
    if (!this._tokensFilled) {
      this.tokens.fill();
      this._tokensFilled = true;
    }
  }

  /**
   * @param {import('antlr4').ParserRuleContext | import('antlr4').Token | null | undefined} ctx
   */
  endToken(ctx) {
    if (!ctx) return null;
    if (ctx.stop) return ctx.stop;
    if (ctx.start) return ctx.start;
    if (ctx.tokenIndex != null) return ctx;
    return null;
  }

  /**
   * @param {import('antlr4').Token} token
   */
  hiddenLeft(token) {
    if (!token || token.tokenIndex == null) return [];
    this.ensureTokensFilled();
    return this.tokens.getHiddenTokensToLeft(token.tokenIndex, HIDDEN) ?? [];
  }

  /**
   * @param {import('antlr4').Token} token
   */
  hiddenRight(token) {
    if (!token || token.tokenIndex == null) return [];
    this.ensureTokensFilled();
    const idx = token.tokenIndex;
    if (idx >= this.tokens.tokens.length - 1) return [];
    return this.tokens.getHiddenTokensToRight(idx, HIDDEN) ?? [];
  }

  /**
   * @param {import('antlr4').Token[]} hiddenTokens
   */
  emitHidden(hiddenTokens) {
    return hiddenTokens.map((t) => t.text).join('');
  }

  /**
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   * @param {Set<number>} [excludeIndices]
   */
  hiddenBetween(fromTok, toTok, excludeIndices) {
    if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
      return [];
    }
    this.ensureTokensFilled();
    /** @type {import('antlr4').Token[]} */
    const hidden = [];
    for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
      const t = this.tokens.tokens[i];
      if (t && t.channel === HIDDEN) {
        if (!excludeIndices || !excludeIndices.has(t.tokenIndex)) {
          hidden.push(t);
        }
      }
    }
    return hidden;
  }

  /**
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   * @returns {SpanEntry[]}
   */
  _spanEntries(fromTok, toTok) {
    const cacheKey = `${fromTok.tokenIndex}:${toTok.tokenIndex}`;
    let entries = this._spanCache.get(cacheKey);
    if (!entries) {
      this.ensureTokensFilled();
      entries = [];
      for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
        const t = this.tokens.tokens[i];
        if (!t || t.type === antlr4.Token.EOF) continue;
        entries.push({ idx: t.tokenIndex, text: t.text });
      }
      this._spanCache.set(cacheKey, entries);
    }
    return entries;
  }

  /**
   * @param {SpanEntry[]} entries
   * @param {Set<number>} [excludeIndices]
   */
  _joinSpanEntries(entries, excludeIndices) {
    if (!excludeIndices) {
      return entries.map((e) => e.text).join('');
    }
    return entries.filter((e) => !excludeIndices.has(e.idx)).map((e) => e.text).join('');
  }

  /**
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   * @param {Set<number>} [excludeIndices]
   */
  spanBetween(fromTok, toTok, excludeIndices) {
    if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
      return '';
    }
    return this._joinSpanEntries(this._spanEntries(fromTok, toTok), excludeIndices);
  }

  /**
   * @param {string} span
   * @param {import('antlr4').Token} commentToken
   */
  isNextMemberPurePrefix(span, commentToken) {
    const commentText = commentToken.text;
    const idx = span.indexOf(commentText);
    if (idx < 0) return false;
    const beforeComment = span.slice(0, idx);
    const lastComma = beforeComment.lastIndexOf(',');
    if (lastComma < 0) return true;
    return /\n/.test(beforeComment.slice(lastComma + 1));
  }

  /**
   * @param {string} span
   * @param {import('antlr4').Token[]} hiddenLeftTokens
   */
  purePrefixHiddenTokens(span, hiddenLeftTokens) {
    let firstPurePrefixIdx = hiddenLeftTokens.length;
    for (let i = 0; i < hiddenLeftTokens.length; i++) {
      const t = hiddenLeftTokens[i];
      if (
        (t.text.includes('//') || t.text.includes('/*')) &&
        this.isNextMemberPurePrefix(span, t)
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
   * @param {import('antlr4').Token} valStop
   * @param {import('antlr4').Token} nextKeyTok
   */
  excludedNextMemberPrefixIndices(valStop, nextKeyTok) {
    const hiddenLeft = this.hiddenLeft(nextKeyTok);
    const span = this.spanBetween(valStop, nextKeyTok);
    const purePrefix = this.purePrefixHiddenTokens(span, hiddenLeft);
    if (purePrefix.length === 0) return undefined;
    return new Set(purePrefix.map((t) => t.tokenIndex));
  }

  /**
   * @param {import('antlr4').Token} valStop
   * @param {import('antlr4').Token} nextKeyTok
   */
  memberBefore(valStop, nextKeyTok) {
    const hiddenLeft = this.hiddenLeft(nextKeyTok);
    if (!valStop) {
      return this.emitHidden(hiddenLeft);
    }
    const span = this.spanBetween(valStop, nextKeyTok);
    const purePrefix = this.purePrefixHiddenTokens(span, hiddenLeft);
    return this.emitHidden(purePrefix);
  }

  /**
   * Hidden-only text between two tokens (exclusive endpoints).
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   */
  hiddenOnlySpan(fromTok, toTok) {
    return this.emitHidden(this.hiddenBetween(fromTok, toTok));
  }
}
