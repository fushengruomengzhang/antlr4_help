import antlr4 from 'antlr4';

const HIDDEN = antlr4.Token.HIDDEN_CHANNEL;

/** @returns {import('./types.js').TokenCoord} */
export function sentinelStart() {
  return { idx: -1, start: 0, stop: 0, line: 1, col: 0, type: 'SENTINEL_START' };
}

/** @param {number} len @returns {import('./types.js').TokenCoord} */
export function sentinelEnd(len) {
  return { idx: Number.MAX_SAFE_INTEGER, start: len, stop: len, line: 0, col: 0, type: 'SENTINEL_END' };
}

/**
 * @param {import('antlr4').Token | null | undefined} token
 * @returns {import('./types.js').TokenCoord | null}
 */
export function toCoord(token) {
  if (!token || token.tokenIndex == null) return null;
  return {
    idx: token.tokenIndex,
    start: token.start,
    stop: token.stop,
    line: token.line,
    col: token.column,
    type: String(token.type),
  };
}

/**
 * @param {import('./types.js').TokenCoord} prev
 * @param {import('./types.js').TokenCoord} current
 * @param {import('./types.js').TokenCoord} next
 * @returns {import('./types.js').AnchorTriplet}
 */
export function makeTriplet(prev, current, next) {
  return { prev, current, next };
}

/**
 * @param {import('antlr4').Token} token
 */
export function isCommentToken(token) {
  const text = token.text;
  return text.includes('//') || text.includes('/*');
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 */
export class CommentSlicer {
  /**
   * @param {import('antlr4').CommonTokenStream} tokenStream
   * @param {number} [inputLen]
   */
  constructor(tokenStream, inputLen = 0) {
    this.stream = tokenStream;
    this.inputLen = inputLen;
    this._filled = false;
  }

  ensureFilled() {
    if (!this._filled) {
      this.stream.fill();
      this._filled = true;
    }
  }

  /** @param {import('./types.js').TokenCoord} coord */
  _isBoundaryPrev(coord) {
    if (coord.type === 'SENTINEL_START' || coord.type === 'SENTINEL_END') return true;
    this.ensureFilled();
    const t = this.stream.tokens[coord.idx];
    if (!t || t.channel !== antlr4.Token.DEFAULT_CHANNEL) return false;
    return t.text === ',' || t.text === '{' || t.text === '[' || t.text === '}' || t.text === ']';
  }

  /** @param {import('./types.js').AnchorTriplet} triplet @returns {string[]} */
  prefixComments(triplet) {
    const excludeLine = this._isBoundaryPrev(triplet.prev) ? triplet.prev.line : undefined;
    return this._sliceComments(triplet.prev, triplet.current, false, { excludeLine });
  }

  /**
   * @param {import('./types.js').TokenCoord} from
   * @param {import('./types.js').TokenCoord} to
   */
  hiddenGap(from, to) {
    this.ensureFilled();
    const tokens = this.stream.tokens;
    const fromIdx = from.idx;
    const toIdx = to.idx;
    let out = '';

    if (fromIdx < 0 && toIdx >= 0) {
      for (let i = 0; i < toIdx; i++) {
        const t = tokens[i];
        if (t && t.channel === HIDDEN) out += t.text;
      }
      return out;
    }

    if (toIdx >= tokens.length || to.type === 'SENTINEL_END') {
      for (let i = fromIdx + 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (!t || t.type === antlr4.Token.EOF) continue;
        if (t.channel === HIDDEN) out += t.text;
      }
      return out;
    }

    for (let i = fromIdx + 1; i < toIdx; i++) {
      const t = tokens[i];
      if (t && t.channel === HIDDEN) out += t.text;
    }
    return out;
  }

  /** @param {import('./types.js').TokenCoord} coord */
  hiddenRightText(coord) {
    this.ensureFilled();
    const tokens = this.stream.tokens;
    let out = '';
    for (let i = coord.idx + 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (!t || t.type === antlr4.Token.EOF) break;
      if (t.channel === HIDDEN) out += t.text;
      else break;
    }
    return out;
  }

  /**
   * Hidden immediately before `close`, excluding the span after the last member value.
   * @param {import('./types.js').AnchorTriplet} closeTriplet
   * @param {import('./types.js').TokenCoord} lastValStop
   */
  closeBeforeText(closeTriplet, lastValStop) {
    this.ensureFilled();
    const closeIdx = closeTriplet.current.idx;
    const assigned = new Set();
    for (let i = lastValStop.idx + 1; i < closeIdx; i++) assigned.add(i);
    const hidden = this.stream.getHiddenTokensToLeft(closeIdx, HIDDEN) ?? [];
    let out = '';
    for (const t of hidden) {
      if (!assigned.has(t.tokenIndex)) out += t.text;
    }
    return out;
  }

  /**
   * @param {import('./types.js').AnchorTriplet} triplet
   * @param {boolean} [sameLineOnly]
   * @returns {string[]}
   */
  suffixComments(triplet, sameLineOnly = true) {
    return this._sliceComments(triplet.current, triplet.next, sameLineOnly);
  }

  /** @param {import('./types.js').TokenCoord} from @param {import('./types.js').TokenCoord} to */
  prefixText(from, to) {
    return this._sliceComments(from, to, false, { excludeLine: from.line }).join('');
  }

  /**
   * @param {import('./types.js').TokenCoord} from
   * @param {import('./types.js').TokenCoord} to
   * @param {boolean} sameLineOnly
   * @param {{ excludeLine?: number }} [opts]
   */
  _sliceComments(from, to, sameLineOnly, opts = {}) {
    this.ensureFilled();
    const tokens = this.stream.tokens;
    const fromIdx = from.idx;
    const toIdx = to.idx;
    /** @type {string[]} */
    const out = [];

    if (fromIdx < 0 && toIdx >= 0) {
      for (let i = 0; i < toIdx; i++) {
        const t = tokens[i];
        if (t && t.channel === HIDDEN && isCommentToken(t)) {
          out.push(t.text);
        }
      }
      return out;
    }

    if (toIdx >= tokens.length || to.type === 'SENTINEL_END') {
      const start = fromIdx + 1;
      const end = tokens.length;
      for (let i = start; i < end; i++) {
        const t = tokens[i];
        if (!t || t.type === antlr4.Token.EOF) continue;
        if (t.channel === HIDDEN && isCommentToken(t)) {
          if (opts.excludeLine != null && t.line === opts.excludeLine) continue;
          if (!sameLineOnly || t.line === from.line) {
            out.push(t.text);
          }
        }
      }
      return out;
    }

    for (let i = fromIdx + 1; i < toIdx; i++) {
      const t = tokens[i];
      if (!t || t.type === antlr4.Token.EOF) continue;
      if (t.channel === HIDDEN && isCommentToken(t)) {
        if (opts.excludeLine != null && t.line === opts.excludeLine) continue;
        if (!sameLineOnly || t.line === from.line) {
          out.push(t.text);
        }
      }
    }
    return out;
  }

  /**
   * @param {import('./types.js').AnchorTriplet} triplet
   * @returns {{ inline: string, hasMultiline: boolean }}
   */
  openLayout(triplet) {
    this.ensureFilled();
    const tokens = this.stream.tokens;
    const fromIdx = triplet.current.idx;
    const toIdx = triplet.next.idx;
    let inline = '';
    let hasMultiline = false;

    for (let i = fromIdx + 1; i < toIdx; i++) {
      const t = tokens[i];
      if (!t || t.channel !== HIDDEN) continue;
      if (isCommentToken(t)) {
        if (t.line === triplet.current.line) {
          inline += t.text;
        } else {
          hasMultiline = true;
        }
      } else if (/\n/.test(t.text)) {
        hasMultiline = true;
      } else if (t.line === triplet.current.line) {
        inline += t.text;
      }
    }
    return { inline, hasMultiline };
  }
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {number} fromIdx
 * @param {number} toIdx
 */
export function findCommaToken(tokenStream, fromIdx, toIdx) {
  tokenStream.fill();
  const tokens = tokenStream.tokens;
  for (let i = fromIdx + 1; i < toIdx; i++) {
    const t = tokens[i];
    if (t && t.channel === antlr4.Token.DEFAULT_CHANNEL && t.text === ',') {
      return t;
    }
  }
  return null;
}

/**
 * @param {import('antlr4').ParserRuleContext | import('antlr4').Token | null | undefined} ctx
 */
export function endToken(ctx) {
  if (!ctx) return null;
  if (ctx.stop) return ctx.stop;
  if (ctx.start) return ctx.start;
  if (ctx.tokenIndex != null) return ctx;
  return null;
}

/**
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} token
 */
export function streamNextToken(tokenStream, token) {
  tokenStream.fill();
  const tokens = tokenStream.tokens;
  const idx = token.tokenIndex;
  for (let i = idx + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t && t.type !== antlr4.Token.EOF) return t;
  }
  return null;
}

/**
 * Last token on the same line as `openTok`, or `fallbackTok` when the line ends at `{`/`[`.
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('antlr4').Token} openTok
 * @param {import('antlr4').Token} fallbackTok
 */
export function openLineEndToken(tokenStream, openTok, fallbackTok) {
  tokenStream.fill();
  const tokens = tokenStream.tokens;
  const line = openTok.line;
  let lastOnLine = openTok;
  for (let i = openTok.tokenIndex + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t || t.type === antlr4.Token.EOF) break;
    if (t.line !== line) break;
    lastOnLine = t;
  }
  if (lastOnLine.tokenIndex >= fallbackTok.tokenIndex) return fallbackTok;
  return lastOnLine;
}
