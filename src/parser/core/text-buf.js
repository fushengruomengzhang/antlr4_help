/**
 * 分块字符串缓冲：减少深层 `+=` 与 format 路径上的重复全量 join。
 */
export class TextBuf {
  constructor() {
    /** @type {string} 已 materialize 的 completed 前缀 */
    this.head = '';
    /** @type {string[]} 当前行/段落的待拼接块 */
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
    return this.parts.length === 0 ? this.head : this.head + this.parts.join('');
  }

  toString() {
    return this.materialize();
  }

  /**
   * 新 member 行前去掉行尾空白，补换行与 member 缩进。
   * @param {(memberDepth: number) => string} indentAtMemberDepth
   * @param {number} depth
   */
  beginMemberLine(indentAtMemberDepth, depth) {
    let line = this.materialize();
    line = line.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) line += '\n';
    this.head = line + indentAtMemberDepth(depth + 1);
    this.parts = [];
  }

  /**
   * 闭合括号行前补容器级缩进。
   * @param {(closeDepth: number) => string} indentAtCloseDepth
   * @param {number} depth
   */
  beginCloseLine(indentAtCloseDepth, depth) {
    let line = this.materialize();
    line = line.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) line += '\n';
    this.head = line + indentAtCloseDepth(depth);
    this.parts = [];
  }
}
