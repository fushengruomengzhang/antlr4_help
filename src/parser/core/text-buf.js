/**
 * 分块字符串缓冲：减少深层 `+=` 与 format 路径上的重复全量 join。
 */
export class TextBuf {
  constructor() {
    /** @type {string[]} */
    this.parts = [];
  }

  /** @param {...string} chunks */
  push(...chunks) {
    for (const c of chunks) {
      if (c) this.parts.push(c);
    }
  }

  /** @param {string} ch */
  pushChar(ch) {
    if (ch) this.parts.push(ch);
  }

  /** @returns {string} */
  materialize() {
    return this.parts.join('');
  }

  toString() {
    return this.materialize();
  }

  /** @returns {number} */
  _lastNewlinePartIndex() {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      if (this.parts[i].includes('\n')) return i;
    }
    return -1;
  }

  /** Trim trailing spaces/tabs on the line after the last `\n` (matches legacy `\n[ \t]+$` → `\n`). */
  _trimTrailingWhitespaceAfterLastNewline() {
    const idx = this._lastNewlinePartIndex();
    if (idx < 0) return;
    const part = this.parts[idx];
    const nl = part.lastIndexOf('\n');
    let prefix = part.slice(0, nl + 1);
    let suffix = part.slice(nl + 1);
    for (let j = idx + 1; j < this.parts.length; j++) {
      suffix += this.parts[j];
    }
    suffix = suffix.replace(/[ \t]+$/, '');
    this.parts[idx] = prefix + suffix;
    this.parts.length = idx + 1;
  }

  /** @returns {boolean} */
  _endsWithNewline() {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      if (p.length === 0) continue;
      return p.endsWith('\n');
    }
    return false;
  }

  _finishLineForBreak() {
    this._trimTrailingWhitespaceAfterLastNewline();
    if (!this._endsWithNewline()) {
      this.push('\n');
    }
  }

  /**
   * 新 member 行前去掉行尾空白，补换行与 member 缩进。
   * @param {(memberDepth: number) => string} indentAtMemberDepth
   * @param {number} depth
   */
  beginMemberLine(indentAtMemberDepth, depth) {
    this._finishLineForBreak();
    this.push(indentAtMemberDepth(depth + 1));
  }

  /**
   * 闭合括号行前补容器级缩进。
   * @param {(closeDepth: number) => string} indentAtCloseDepth
   * @param {number} depth
   */
  beginCloseLine(indentAtCloseDepth, depth) {
    this._finishLineForBreak();
    this.push(indentAtCloseDepth(depth));
  }
}
