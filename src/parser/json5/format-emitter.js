import antlr4 from 'antlr4';
import {
  decodeJson5String,
  encodeDoubleQuotedString,
  keyToString,
  tripleStringBodyText,
} from './value-visitor.js';

const HIDDEN = antlr4.Token.HIDDEN_CHANNEL;

/**
 * @typedef {object} IndentConfig
 * @property {'space' | 'tab'} type
 * @property {number} [size] required when type is 'space'
 */

/**
 * @typedef {object} FormatOptions
 * @property {IndentConfig} [indent]
 * @property {boolean} [sortKeys]
 * @property {boolean} [compact]
 */

/** @typedef {{ idx: number, text: string }} SpanEntry */

export const DEFAULT_FORMAT_OPTIONS = {
  indent: { type: 'space', size: 2 },
  sortKeys: false,
  compact: false,
};

/**
 * 合并并规范化 format 选项。
 * @param {FormatOptions} [options]
 * @returns {Required<FormatOptions>}
 */
export function normalizeFormatOptions(options) {
  const indent = options?.indent ?? DEFAULT_FORMAT_OPTIONS.indent;
  return {
    indent: indent.type === 'tab' ? { type: 'tab' } : { type: 'space', size: indent.size ?? 2 },
    sortKeys: options?.sortKeys ?? false,
    compact: options?.compact ?? false,
  };
}

/** compact 容器 formatter 用的分块字符串缓冲，减少深层 += 分配。 */
class TextBuf {
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

  toString() {
    return this.parts.join('');
  }

  /**
   * 新 member 行前去掉行尾空白，补换行与 member 缩进。
   * @param {(memberDepth: number) => string} indentAtMemberDepth
   * @param {number} depth 当前容器 depth
   */
  beginMemberLine(indentAtMemberDepth, depth) {
    let line = this.parts.join('');
    line = line.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) line += '\n';
    this.parts = [line + indentAtMemberDepth(depth + 1)];
  }

  /**
   * 闭合括号行前补容器级缩进。
   * @param {(closeDepth: number) => string} indentAtCloseDepth
   * @param {number} depth
   */
  beginCloseLine(indentAtCloseDepth, depth) {
    let line = this.parts.join('');
    line = line.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) line += '\n';
    this.parts = [line + indentAtCloseDepth(depth)];
  }
}

export class FormatEmitter {
  /**
   * @param {import('antlr4').CommonTokenStream} tokenStream
   * @param {FormatOptions} [options]
   * @param {import('./comment-anchor-index.js').CommentAnchorIndex} [anchorIndex]
   */
  constructor(tokenStream, options, anchorIndex) {
    this.tokens = tokenStream;
    this.options = normalizeFormatOptions(options);
    this.anchorIndex = anchorIndex ?? null;
    /** @type {Map<number, string>} */
    this._indentCache = new Map();
    this._tokensFilled = false;
    /** @type {Map<string, SpanEntry[]> | null} */
    this._spanCache = null;
    this.ensureTokensFilled();
  }

  /** 整个 emit 生命周期内只 fill token 流一次。 */
  ensureTokensFilled() {
    if (!this._tokensFilled) {
      this.tokens.fill();
      this._tokensFilled = true;
    }
  }

  /**
   * 按 depth 返回缩进串（带实例缓存）。
   * @param {number} depth
   */
  indentUnit(depth) {
    if (this._indentCache.has(depth)) {
      return this._indentCache.get(depth);
    }
    const { indent } = this.options;
    const unit =
      indent.type === 'tab'
        ? '\t'.repeat(Math.max(0, depth))
        : ' '.repeat(Math.max(0, depth * indent.size));
    this._indentCache.set(depth, unit);
    return unit;
  }

  /**
   * 读取 token 左侧 HIDDEN 通道 token（注释、空白等）。
   * @param {import('antlr4').Token} token
   */
  hiddenLeft(token) {
    if (!token || token.tokenIndex == null) return [];
    this.ensureTokensFilled();
    const hidden = this.tokens.getHiddenTokensToLeft(token.tokenIndex, HIDDEN);
    return hidden ?? [];
  }

  /**
   * 读取 token 右侧 HIDDEN 通道 token。
   * @param {import('antlr4').Token} token
   */
  hiddenRight(token) {
    if (!token || token.tokenIndex == null) return [];
    this.ensureTokensFilled();
    const idx = token.tokenIndex;
    if (idx >= this.tokens.tokens.length - 1) return [];
    const hidden = this.tokens.getHiddenTokensToRight(idx, HIDDEN);
    return hidden ?? [];
  }

  /** 取 parse tree 节点对应的结束 token。 */
  endToken(ctx) {
    if (ctx.stop) return ctx.stop;
    if (ctx.start) return ctx.start;
    return null;
  }

  /** 将 hidden token 数组拼成原始文本。 */
  emitHidden(hiddenTokens) {
    return hiddenTokens.map((t) => t.text).join('');
  }

  /**
   * compact 路径 emit hidden，并折叠多余空行。
   * @param {import('antlr4').Token[]} hiddenTokens
   * @param {Set<number>} [excludeIndices]
   */
  emitHiddenCompact(hiddenTokens, excludeIndices) {
    const filtered = excludeIndices
      ? hiddenTokens.filter((t) => !excludeIndices.has(t.tokenIndex))
      : hiddenTokens;
    return this.compactWhitespace(this.emitHidden(filtered));
  }

  /** 折叠连续换行为单行换行。 */
  compactWhitespace(text) {
    return text.replace(/\n{2,}/g, '\n');
  }

  /**
   * 收集两 token 之间（不含端点）的文本；可排除指定 token index。
   * sort 路径 suffix 收集时 exclude 下一 member 的 pure prefix。
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   * @param {Set<number>} [excludeTokenIndices]
   */
  spanBetween(fromTok, toTok, excludeTokenIndices) {
    if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
      return '';
    }
    this.ensureTokensFilled();
    const cacheKey = `${fromTok.tokenIndex}:${toTok.tokenIndex}`;
    let entries = this._spanCache?.get(cacheKey);
    if (!entries) {
      entries = [];
      for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
        const t = this.tokens.tokens[i];
        if (!t || t.type === antlr4.Token.EOF) continue;
        entries.push({ idx: t.tokenIndex, text: t.text });
      }
      if (this._spanCache) this._spanCache.set(cacheKey, entries);
    }
    if (!excludeTokenIndices) {
      return entries.map((e) => e.text).join('');
    }
    return entries.filter((e) => !excludeTokenIndices.has(e.idx)).map((e) => e.text).join('');
  }

  /** 去掉末 member suffix 中 trailing 逗号（保留注释）。 */
  stripTrailingCommaSuffix(suffix) {
    return suffix.replace(/,(\s*(?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)?\s*)$/, '$1');
  }

  /** suffix 是否已含逗号。 */
  containsComma(text) {
    return /,/.test(text);
  }

  /** 行尾 inline 注释前确保逗号在注释之前（`, //`）。 */
  normalizeCommaBeforeComment(suffix) {
    if (!suffix) return suffix;
    return suffix
      .replace(/^(\s*)((?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)\s*),(\s*)$/m, ',$1$2$3')
      .replace(/(\s*(?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)\s*),(\s*)$/, ',$1$2');
  }

  /**
   * 源码 member 列表 → member context → 下标 Map（O(1) 查找）。
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} sourceMembers
   */
  buildMemberIndexMap(sourceMembers) {
    const map = new Map();
    for (let i = 0; i < sourceMembers.length; i++) {
      map.set(sourceMembers[i], i);
    }
    return map;
  }

  /**
   * 按 sortKeys 预计算 sort key 并稳定排序。
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} members
   */
  sortMembers(members) {
    if (!this.options.sortKeys) return members;
    return members
      .map((member, ord) => ({ member, sortKey: this.keySortString(member.key()), ord }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.ord - b.ord)
      .map((x) => x.member);
  }

  /**
   * 当前 member 在源码中的下一项 key token（非排序后下一项）。
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} sourceMembers
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext} member
   * @param {import('antlr4').Token} closeTok
   * @param {Map<import('../../grammars/json5/Json5Parser.js').default.MemberContext, number>} memberIdxMap
   */
  sourceNextKeyToken(sourceMembers, member, closeTok, memberIdxMap) {
    const sourceIdx = memberIdxMap.get(member);
    if (sourceIdx == null || sourceIdx < 0 || sourceIdx >= sourceMembers.length - 1) {
      return closeTok;
    }
    return sourceMembers[sourceIdx + 1].key().start;
  }

  /**
   * 两 token 之间 HIDDEN 通道 token 列表。
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   */
  hiddenTokensBetween(fromTok, toTok) {
    if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
      return [];
    }
    this.ensureTokensFilled();
    const hidden = [];
    for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
      const t = this.tokens.tokens[i];
      if (t && t.channel === HIDDEN) hidden.push(t);
    }
    return hidden;
  }

  /** 标记 hidden token 已 emit，避免 sort 路径重复输出。 */
  markHiddenEmitted(hiddenTokens, emittedIndices) {
    for (const t of hiddenTokens) {
      if (t.tokenIndex != null) emittedIndices.add(t.tokenIndex);
    }
  }

  /** compact sort suffix：压空行并去掉 member 间 layout gap。 */
  normalizeMemberSuffixCompact(suffix) {
    if (!suffix) return suffix;
    suffix = this.compactWhitespace(suffix);
    suffix = suffix.replace(/\n[ \t]*(?=\n)/g, '\n').replace(/\n{2,}/g, '\n');
    return this.trimInterMemberGapCompact(suffix);
  }

  /** 丢弃 suffix 末尾 inter-member 空白行（保留 `, // inline`）。 */
  trimInterMemberGapCompact(suffix) {
    if (!suffix) return suffix;
    return suffix.replace(/\n[ \t]*$/g, '');
  }

  /**
   * sort 路径：key 左侧 hidden，去掉上一 member 残留 gap，保留 pure prefix。
   * @param {import('antlr4').Token} keyTok
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext} member
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} sourceMembers
   * @param {import('antlr4').Token} openTok
   * @param {Set<number>} [emittedHiddenIndices]
   * @param {Map<import('../../grammars/json5/Json5Parser.js').default.MemberContext, number>} memberIdxMap
   */
  hiddenLeftForSortedMember(
    keyTok,
    member,
    sourceMembers,
    openTok,
    emittedHiddenIndices,
    memberIdxMap,
  ) {
    const anchor = this.anchorIndex?.memberAnchors.get(member);
    let hidden = anchor ? [...anchor.prefixSorted] : this.hiddenLeft(keyTok);
    if (emittedHiddenIndices) {
      hidden = hidden.filter((t) => !emittedHiddenIndices.has(t.tokenIndex));
    }
    return hidden;
  }

  /**
   * sort 路径 member suffix：以源码下一 key 为终点，保留 inline、排除 pure prefix。
   * @param {import('antlr4').Token} valStop
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext} member
   * @param {import('../../grammars/json5/Json5Parser.js').default.MemberContext[]} sourceMembers
   * @param {import('antlr4').Token} closeTok
   * @param {boolean} isLastInOutput
   * @param {boolean} [compact]
   * @param {Map<import('../../grammars/json5/Json5Parser.js').default.MemberContext, number>} memberIdxMap
   */
  memberSuffixForSortedMember(
    valStop,
    member,
    sourceMembers,
    closeTok,
    isLastInOutput,
    compact,
    memberIdxMap,
  ) {
    const anchor = this.anchorIndex?.memberAnchors.get(member);
    let suffix = anchor
      ? anchor.suffixEntries.map((e) => e.text).join('')
      : this.spanBetween(
          valStop,
          this.sourceNextKeyToken(sourceMembers, member, closeTok, memberIdxMap),
        );
    if (compact) {
      suffix = this.normalizeMemberSuffixCompact(suffix);
    }
    if (isLastInOutput) {
      suffix = this.stripTrailingCommaSuffix(suffix);
    } else if (!this.containsComma(suffix)) {
      suffix = ',' + suffix;
    }
    return this.normalizeCommaBeforeComment(suffix);
  }

  /** 格式化整份 JSON5 文档（根 value + 文档头尾注释）。 */
  formatDocument(root) {
    const valueCtx = root.value();
    const docBefore = this.anchorIndex?.doc.before ?? this.hiddenLeft(valueCtx.start);
    let out = this.emitHidden(docBefore);
    if (this.options.compact) {
      out = this.compactWhitespace(out);
    }
    out += this.formatValue(valueCtx, 0);
    let footer = this.emitHidden(
      this.anchorIndex?.doc.after ?? this.hiddenRight(this.endToken(valueCtx)),
    );
    if (this.options.compact) {
      footer = this.compactWhitespace(footer);
    }
    out += footer;
    return out.trimEnd();
  }

  /** 按 value 类型分派 object / array /  primitive。 */
  formatValue(ctx, depth) {
    if (ctx.object()) return this.formatObject(ctx.object(), depth);
    if (ctx.array()) return this.formatArray(ctx.array(), depth);
    return this.options.compact ? this.emitSourceValue(ctx) : this.formatPrimitiveValue(ctx);
  }

  /** compact：保留源 token 形态的 primitive value。 */
  emitSourceValue(ctx) {
    if (ctx.STRING()) return ctx.STRING().getText();
    if (ctx.tripleSingleString()) return this.emitTripleSingleString(ctx.tripleSingleString());
    if (ctx.tripleDoubleString()) return this.emitTripleDoubleString(ctx.tripleDoubleString());
    if (ctx.NUMBER()) return ctx.NUMBER().getText();
    if (ctx.TRUE()) return 'true';
    if (ctx.FALSE()) return 'false';
    if (ctx.NULL()) return 'null';
    if (ctx.literal()) return ctx.literal().getText();
    return ctx.getText();
  }

  /** pretty：规范化字符串为双引号等的 primitive value。 */
  formatPrimitiveValue(ctx) {
    if (ctx.STRING()) {
      return encodeDoubleQuotedString(decodeJson5String(ctx.STRING().getText()));
    }
    if (ctx.tripleSingleString()) {
      return this.emitTripleSingleString(ctx.tripleSingleString());
    }
    if (ctx.tripleDoubleString()) {
      return this.emitTripleDoubleString(ctx.tripleDoubleString());
    }
    if (ctx.NUMBER()) return ctx.NUMBER().getText();
    if (ctx.TRUE()) return 'true';
    if (ctx.FALSE()) return 'false';
    if (ctx.NULL()) return 'null';
    if (ctx.literal()) return ctx.literal().getText();
    return ctx.getText();
  }

  /** 输出单引号三引号字符串（含 opener 注释）。 */
  emitTripleSingleString(ctx) {
    const openTok = ctx.TRIPLE_S_OPEN().symbol;
    let out = openTok.text;
    out += this.emitHidden(this.hiddenRight(openTok));
    out += tripleStringBodyText(ctx);
    out += ctx.TRIPLE_S_CLOSE().symbol.text;
    return out;
  }

  /** 输出双引号三引号字符串（含 opener 注释）。 */
  emitTripleDoubleString(ctx) {
    const openTok = ctx.TRIPLE_D_OPEN().symbol;
    let out = openTok.text;
    out += this.emitHidden(this.hiddenRight(openTok));
    out += tripleStringBodyText(ctx);
    out += ctx.TRIPLE_D_CLOSE().symbol.text;
    return out;
  }

  /** 输出 key token 原文形态。 */
  emitKey(keyCtx) {
    if (keyCtx.IdentifierName()) return keyCtx.IdentifierName().getText();
    if (keyCtx.NUMBER()) return keyCtx.NUMBER().getText();
    if (keyCtx.STRING()) return keyCtx.STRING().getText();
    if (keyCtx.TRUE()) return 'true';
    if (keyCtx.FALSE()) return 'false';
    if (keyCtx.NULL()) return 'null';
    if (keyCtx.INFINITY()) return 'Infinity';
    if (keyCtx.NAN()) return 'NaN';
    return keyCtx.getText();
  }

  /** 用于 sortKeys 的 key 规范字符串。 */
  keySortString(keyCtx) {
    return keyToString(keyCtx);
  }

  /** object 分派 compact / pretty。 */
  formatObject(ctx, depth) {
    if (this.options.compact) return this.formatObjectCompact(ctx, depth);
    return this.formatObjectPretty(ctx, depth);
  }

  /** array 分派 compact / pretty。 */
  formatArray(ctx, depth) {
    if (this.options.compact) return this.formatArrayCompact(ctx, depth);
    return this.formatArrayPretty(ctx, depth);
  }

  /** 在 object format 期间启用 span 区间缓存。 */
  withSpanCache(fn) {
    const prev = this._spanCache;
    this._spanCache = new Map();
    try {
      return fn();
    } finally {
      this._spanCache = prev;
    }
  }

  /** compact object 格式化（含 sort 注释锚定）。 */
  formatObjectCompact(ctx, depth) {
    return this.withSpanCache(() => {
      const openTok = ctx.start;
      const closeTok = ctx.stop;
      const sourceMembers = ctx.member ? ctx.member() : [];
      const members = this.sortMembers(sourceMembers);
      const useSortAnchors = this.options.sortKeys;
      const memberIdxMap = useSortAnchors ? this.buildMemberIndexMap(sourceMembers) : null;
      const emittedHiddenIndices = useSortAnchors ? new Set() : null;
      const buf = new TextBuf();
      const objAnchor = this.anchorIndex?.objects.get(ctx);
      const openingHidden = objAnchor?.openAfter ?? this.hiddenRight(openTok);

      buf.push('{');

      if (members.length === 0) {
        buf.push(this.emitHiddenCompact(openingHidden), '}');
        return buf.toString();
      }

      buf.push(this.emitHiddenCompact(openingHidden));
      if (emittedHiddenIndices) {
        this.markHiddenEmitted(openingHidden, emittedHiddenIndices);
      }

      let lastMemberTrailingHidden = [];
      const indentMember = (d) => this.indentUnit(d);

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const keyTok = member.key().start;
        const valCtx = member.value();
        const valStop = this.endToken(valCtx);
        const isLastInOutput = i === members.length - 1;

        buf.beginMemberLine(indentMember, depth);

        if (useSortAnchors && memberIdxMap) {
          const prefixHidden = this.hiddenLeftForSortedMember(
            keyTok,
            member,
            sourceMembers,
            openTok,
            emittedHiddenIndices,
            memberIdxMap,
          );
          buf.push(this.emitHiddenCompact(prefixHidden));
          if (emittedHiddenIndices) {
            this.markHiddenEmitted(prefixHidden, emittedHiddenIndices);
          }
        }

        buf.push(this.emitKey(member.key()), ': ', this.formatValue(valCtx, depth + 1));

        if (useSortAnchors && memberIdxMap) {
          buf.push(
            this.memberSuffixForSortedMember(
              valStop,
              member,
              sourceMembers,
              closeTok,
              isLastInOutput,
              true,
              memberIdxMap,
            ),
          );
          if (isLastInOutput) {
            lastMemberTrailingHidden = this.hiddenTokensBetween(valStop, closeTok);
          }
        } else {
          const boundaryTok = i < members.length - 1 ? members[i + 1].key().start : closeTok;
          let suffix = this.compactWhitespace(this.spanBetween(valStop, boundaryTok));
          if (i === members.length - 1) {
            suffix = this.stripTrailingCommaSuffix(suffix);
          }
          buf.push(suffix);
        }
      }

      if (useSortAnchors) {
        const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
          (t) => !lastMemberTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
        );
        buf.push(this.compactWhitespace(this.emitHidden(beforeCloseHidden)));
      }

      buf.beginCloseLine(indentMember, depth);
      buf.push('}');
      return buf.toString();
    });
  }

  /** compact array 格式化。 */
  formatArrayCompact(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    const values = ctx.value ? ctx.value() : [];
    const buf = new TextBuf();
    const openingHidden = this.hiddenRight(openTok);
    const indentMember = (d) => this.indentUnit(d);

    buf.push('[');

    if (values.length === 0) {
      buf.push(this.emitHiddenCompact(openingHidden), ']');
      return buf.toString();
    }

    buf.push(this.emitHiddenCompact(openingHidden));

    for (let i = 0; i < values.length; i++) {
      const valCtx = values[i];
      const valStop = this.endToken(valCtx);
      const boundaryTok = i < values.length - 1 ? values[i + 1].start : closeTok;

      buf.beginMemberLine(indentMember, depth);
      buf.push(this.formatValue(valCtx, depth + 1));

      let suffix = this.compactWhitespace(this.spanBetween(valStop, boundaryTok));
      if (i === values.length - 1) {
        suffix = this.stripTrailingCommaSuffix(suffix);
      }
      buf.push(suffix);
    }

    buf.beginCloseLine(indentMember, depth);
    buf.push(']');
    return buf.toString();
  }

  /** pretty object 格式化（含 sort 注释锚定）。 */
  formatObjectPretty(ctx, depth) {
    return this.withSpanCache(() => {
      const openTok = ctx.start;
      const closeTok = ctx.stop;
      const sourceMembers = ctx.member ? ctx.member() : [];
      const members = this.sortMembers(sourceMembers);
      const buf = new TextBuf();
      const useSortAnchors = this.options.sortKeys;
      const memberIdxMap = useSortAnchors ? this.buildMemberIndexMap(sourceMembers) : null;
      const objAnchor = this.anchorIndex?.objects.get(ctx);
      const openingHidden = objAnchor?.openAfter ?? this.hiddenRight(openTok);

      buf.push('{');

      if (members.length === 0) {
        buf.push(this.emitHidden(openingHidden), '}');
        return buf.toString();
      }

      let lastMemberTrailingHidden = [];

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const keyTok = member.key().start;
        buf.push('\n', this.indentUnit(depth + 1));
        buf.push(
          this.emitHidden(
            useSortAnchors && memberIdxMap
              ? this.hiddenLeftForSortedMember(
                  keyTok,
                  member,
                  sourceMembers,
                  openTok,
                  undefined,
                  memberIdxMap,
                )
              : this.hiddenLeft(keyTok),
          ),
        );
        buf.push(this.emitKey(member.key()), ': ');
        const valCtx = member.value();
        if (valCtx.object() || valCtx.array()) {
          buf.push(this.formatValue(valCtx, depth + 1));
        } else {
          buf.push(this.formatPrimitiveValue(valCtx));
        }
        const valStop = this.endToken(valCtx);
        const isLastInOutput = i === members.length - 1;
        if (useSortAnchors && memberIdxMap) {
          buf.push(
            this.memberSuffixForSortedMember(
              valStop,
              member,
              sourceMembers,
              closeTok,
              isLastInOutput,
              false,
              memberIdxMap,
            ),
          );
          if (isLastInOutput) {
            lastMemberTrailingHidden = this.hiddenTokensBetween(valStop, closeTok);
          }
        } else {
          const trailingHidden = this.hiddenRight(valStop);
          buf.push(this.emitHidden(trailingHidden));
          if (isLastInOutput) {
            lastMemberTrailingHidden = trailingHidden;
          }
          if (!isLastInOutput) {
            buf.push(',');
          }
        }
      }

      buf.push('\n', this.indentUnit(depth));
      const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
        (t) => !lastMemberTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
      );
      buf.push(this.emitHidden(beforeCloseHidden), '}');
      return buf.toString();
    });
  }

  /** pretty array 格式化。 */
  formatArrayPretty(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    const values = ctx.value ? ctx.value() : [];
    const buf = new TextBuf();

    buf.push('[');

    if (values.length === 0) {
      buf.push(this.emitHidden(this.hiddenRight(openTok)), ']');
      return buf.toString();
    }

    let lastElementTrailingHidden = [];

    for (let i = 0; i < values.length; i++) {
      const valCtx = values[i];
      buf.push('\n', this.indentUnit(depth + 1));
      buf.push(this.emitHidden(this.hiddenLeft(valCtx.start)));
      if (valCtx.object() || valCtx.array()) {
        buf.push(this.formatValue(valCtx, depth + 1));
      } else {
        buf.push(this.formatPrimitiveValue(valCtx));
      }
      const trailingHidden = this.hiddenRight(this.endToken(valCtx));
      buf.push(this.emitHidden(trailingHidden));
      if (i === values.length - 1) {
        lastElementTrailingHidden = trailingHidden;
      }
      if (i < values.length - 1) {
        buf.push(',');
      }
    }

    buf.push('\n', this.indentUnit(depth));
    const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
      (t) => !lastElementTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
    );
    buf.push(this.emitHidden(beforeCloseHidden), ']');
    return buf.toString();
  }
}
