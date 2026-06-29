import antlr4 from 'antlr4';
import {
  decodeJson5String,
  encodeDoubleQuotedString,
  keyToString,
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

export const DEFAULT_FORMAT_OPTIONS = {
  indent: { type: 'space', size: 2 },
  sortKeys: false,
  compact: false,
};

/**
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

export class FormatEmitter {
  /**
   * @param {import('antlr4').CommonTokenStream} tokenStream
   * @param {FormatOptions} [options]
   */
  constructor(tokenStream, options) {
    this.tokens = tokenStream;
    this.options = normalizeFormatOptions(options);
  }

  /** @param {number} depth */
  indentUnit(depth) {
    const { indent } = this.options;
    if (indent.type === 'tab') return '\t'.repeat(Math.max(0, depth));
    return ' '.repeat(Math.max(0, depth * indent.size));
  }

  /** @param {import('antlr4').Token} token */
  hiddenLeft(token) {
    if (!token || token.tokenIndex == null) return [];
    this.tokens.fill();
    const hidden = this.tokens.getHiddenTokensToLeft(token.tokenIndex, HIDDEN);
    return hidden ?? [];
  }

  /** @param {import('antlr4').Token} token */
  hiddenRight(token) {
    if (!token || token.tokenIndex == null) return [];
    this.tokens.fill();
    const idx = token.tokenIndex;
    if (idx >= this.tokens.tokens.length - 1) return [];
    const hidden = this.tokens.getHiddenTokensToRight(idx, HIDDEN);
    return hidden ?? [];
  }

  /** @param {import('antlr4').ParserRuleContext} ctx */
  endToken(ctx) {
    if (ctx.stop) return ctx.stop;
    if (ctx.start) return ctx.start;
    return null;
  }

  /** @param {import('antlr4').Token[]} hiddenTokens */
  emitHidden(hiddenTokens) {
    return hiddenTokens.map((t) => t.text).join('');
  }

  /**
   * @param {import('antlr4').Token[]} hiddenTokens
   * @param {Set<number>} [excludeIndices]
   */
  emitHiddenCompact(hiddenTokens, excludeIndices) {
    const filtered = excludeIndices
      ? hiddenTokens.filter((t) => !excludeIndices.has(t.tokenIndex))
      : hiddenTokens;
    return this.compactWhitespace(this.emitHidden(filtered));
  }

  /** @param {string} text */
  compactWhitespace(text) {
    return text.replace(/\n{2,}/g, '\n');
  }

  /** @param {string} out @param {number} depth */
  beginMemberLine(out, depth) {
    let line = out.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) {
      line += '\n';
    }
    return line + this.indentUnit(depth + 1);
  }

  /** @param {string} out @param {number} depth */
  beginCloseLine(out, depth) {
    let line = out.replace(/\n[ \t]+$/, '\n');
    if (!line.endsWith('\n')) {
      line += '\n';
    }
    return line + this.indentUnit(depth);
  }

  /**
   * @param {import('antlr4').Token} fromTok
   * @param {import('antlr4').Token} toTok
   */
  spanBetween(fromTok, toTok) {
    if (!fromTok || !toTok || fromTok.tokenIndex == null || toTok.tokenIndex == null) {
      return '';
    }
    this.tokens.fill();
    const parts = [];
    for (let i = fromTok.tokenIndex + 1; i < toTok.tokenIndex; i++) {
      const t = this.tokens.tokens[i];
      if (!t || t.type === antlr4.Token.EOF) continue;
      parts.push(t.text);
    }
    return parts.join('');
  }

  /** @param {string} suffix */
  stripTrailingCommaSuffix(suffix) {
    return suffix.replace(/,(\s*(?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)?\s*)$/, '$1');
  }

  /** @param {string} text */
  containsComma(text) {
    return /,/.test(text);
  }

  /**
   * @param {import('../../grammars/json5/Json5Parser.js').default.Json5Context} root
   */
  formatDocument(root) {
    const valueCtx = root.value();
    let out = this.emitHidden(this.hiddenLeft(valueCtx.start));
    if (this.options.compact) {
      out = this.compactWhitespace(out);
    }
    out += this.formatValue(valueCtx, 0);
    let footer = this.emitHidden(this.hiddenRight(this.endToken(valueCtx)));
    if (this.options.compact) {
      footer = this.compactWhitespace(footer);
    }
    out += footer;
    return out.trimEnd();
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx @param {number} depth */
  formatValue(ctx, depth) {
    if (ctx.object()) return this.formatObject(ctx.object(), depth);
    if (ctx.array()) return this.formatArray(ctx.array(), depth);
    return this.options.compact ? this.emitSourceValue(ctx) : this.formatPrimitiveValue(ctx);
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx */
  emitSourceValue(ctx) {
    if (ctx.STRING()) return ctx.STRING().getText();
    if (ctx.TRIPLE_DOUBLE_STRING()) return ctx.TRIPLE_DOUBLE_STRING().getText();
    if (ctx.TRIPLE_SINGLE_STRING()) return ctx.TRIPLE_SINGLE_STRING().getText();
    if (ctx.NUMBER()) return ctx.NUMBER().getText();
    if (ctx.TRUE()) return 'true';
    if (ctx.FALSE()) return 'false';
    if (ctx.NULL()) return 'null';
    if (ctx.literal()) return ctx.literal().getText();
    return ctx.getText();
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx */
  formatPrimitiveValue(ctx) {
    if (ctx.STRING()) {
      return encodeDoubleQuotedString(decodeJson5String(ctx.STRING().getText()));
    }
    if (ctx.TRIPLE_DOUBLE_STRING()) {
      return this.formatTriple(ctx.TRIPLE_DOUBLE_STRING().getText(), '"""');
    }
    if (ctx.TRIPLE_SINGLE_STRING()) {
      const decoded = decodeJson5String(ctx.TRIPLE_SINGLE_STRING().getText());
      return this.formatTripleFromDecoded(decoded);
    }
    if (ctx.NUMBER()) return ctx.NUMBER().getText();
    if (ctx.TRUE()) return 'true';
    if (ctx.FALSE()) return 'false';
    if (ctx.NULL()) return 'null';
    if (ctx.literal()) return ctx.literal().getText();
    return ctx.getText();
  }

  /** @param {string} decoded inner content without delimiters */
  formatTripleFromDecoded(decoded) {
    if (!decoded.includes('\n') && !decoded.includes('\r')) {
      return `"""${decoded.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"""`;
    }
    const lines = decoded.split(/\r\n|\n|\r/);
    return `"""\n${lines.join('\n')}\n"""`;
  }

  /** @param {string} tokenText full token including delimiters @param {string} delim */
  formatTriple(tokenText, delim) {
    const decoded = decodeJson5String(tokenText);
    return this.formatTripleFromDecoded(decoded);
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.KeyContext} keyCtx */
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

  /** @param {import('../../grammars/json5/Json5Parser.js').default.KeyContext} keyCtx */
  keySortString(keyCtx) {
    return keyToString(keyCtx);
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx @param {number} depth */
  formatObject(ctx, depth) {
    if (this.options.compact) return this.formatObjectCompact(ctx, depth);
    return this.formatObjectPretty(ctx, depth);
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx @param {number} depth */
  formatArray(ctx, depth) {
    if (this.options.compact) return this.formatArrayCompact(ctx, depth);
    return this.formatArrayPretty(ctx, depth);
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx @param {number} depth */
  formatObjectCompact(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    let members = ctx.member ? ctx.member() : [];
    if (this.options.sortKeys) {
      members = [...members].sort((a, b) =>
        this.keySortString(a.key()).localeCompare(this.keySortString(b.key())),
      );
    }

    const useSortAnchors = this.options.sortKeys;
    let out = '{';
    const openingHidden = useSortAnchors ? [] : this.hiddenRight(openTok);

    if (members.length === 0) {
      out += this.emitHiddenCompact(openingHidden);
      out += '}';
      return out;
    }

    if (!useSortAnchors) {
      out += this.emitHiddenCompact(openingHidden);
    }

    let lastMemberTrailingHidden = [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const keyTok = member.key().start;
      const valCtx = member.value();
      const valStop = this.endToken(valCtx);

      out = this.beginMemberLine(out, depth);

      if (useSortAnchors) {
        out += this.emitHiddenCompact(this.hiddenLeft(keyTok));
      }

      out += this.emitKey(member.key());
      out += ': ';
      out += this.formatValue(valCtx, depth + 1);

      if (useSortAnchors) {
        const trailingHidden = this.hiddenRight(valStop);
        let trailing = this.compactWhitespace(this.emitHidden(trailingHidden));
        if (i === members.length - 1) {
          trailing = this.stripTrailingCommaSuffix(trailing);
          lastMemberTrailingHidden = trailingHidden;
        } else if (!this.containsComma(trailing)) {
          trailing += ',';
        }
        out += trailing;
      } else {
        const boundaryTok = i < members.length - 1 ? members[i + 1].key().start : closeTok;
        let suffix = this.compactWhitespace(this.spanBetween(valStop, boundaryTok));
        if (i === members.length - 1) {
          suffix = this.stripTrailingCommaSuffix(suffix);
        }
        out += suffix;
      }
    }

    if (useSortAnchors) {
      const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
        (t) => !lastMemberTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
      );
      out += this.compactWhitespace(this.emitHidden(beforeCloseHidden));
    }

    out = this.beginCloseLine(out, depth);
    out += '}';
    return out;
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx @param {number} depth */
  formatArrayCompact(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    const values = ctx.value ? ctx.value() : [];

    let out = '[';
    const openingHidden = this.hiddenRight(openTok);

    if (values.length === 0) {
      out += this.emitHiddenCompact(openingHidden);
      out += ']';
      return out;
    }

    out += this.emitHiddenCompact(openingHidden);

    for (let i = 0; i < values.length; i++) {
      const valCtx = values[i];
      const valStop = this.endToken(valCtx);
      const boundaryTok = i < values.length - 1 ? values[i + 1].start : closeTok;

      out = this.beginMemberLine(out, depth);
      out += this.formatValue(valCtx, depth + 1);

      let suffix = this.compactWhitespace(this.spanBetween(valStop, boundaryTok));
      if (i === values.length - 1) {
        suffix = this.stripTrailingCommaSuffix(suffix);
      }
      out += suffix;
    }

    out = this.beginCloseLine(out, depth);
    out += ']';
    return out;
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx @param {number} depth */
  formatObjectPretty(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    let members = ctx.member ? ctx.member() : [];
    if (this.options.sortKeys) {
      members = [...members].sort((a, b) =>
        this.keySortString(a.key()).localeCompare(this.keySortString(b.key())),
      );
    }

    let out = '{';

    if (members.length === 0) {
      out += this.emitHidden(this.hiddenRight(openTok));
      out += '}';
      return out;
    }

    let lastMemberTrailingHidden = [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const keyTok = member.key().start;
      out += '\n';
      out += this.indentUnit(depth + 1);
      out += this.emitHidden(this.hiddenLeft(keyTok));
      out += this.emitKey(member.key());
      out += ': ';
      const valCtx = member.value();
      if (valCtx.object() || valCtx.array()) {
        out += this.formatValue(valCtx, depth + 1);
      } else {
        out += this.formatPrimitiveValue(valCtx);
      }
      const valStop = this.endToken(valCtx);
      const trailingHidden = this.hiddenRight(valStop);
      out += this.emitHidden(trailingHidden);
      if (i === members.length - 1) {
        lastMemberTrailingHidden = trailingHidden;
      }
      if (i < members.length - 1) {
        out += ',';
      }
    }

    out += '\n';
    out += this.indentUnit(depth);
    const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
      (t) => !lastMemberTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
    );
    out += this.emitHidden(beforeCloseHidden);
    out += '}';
    return out;
  }

  /** @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx @param {number} depth */
  formatArrayPretty(ctx, depth) {
    const openTok = ctx.start;
    const closeTok = ctx.stop;
    const values = ctx.value ? ctx.value() : [];

    let out = '[';

    if (values.length === 0) {
      out += this.emitHidden(this.hiddenRight(openTok));
      out += ']';
      return out;
    }

    let lastElementTrailingHidden = [];

    for (let i = 0; i < values.length; i++) {
      const valCtx = values[i];
      out += '\n';
      out += this.indentUnit(depth + 1);
      out += this.emitHidden(this.hiddenLeft(valCtx.start));
      if (valCtx.object() || valCtx.array()) {
        out += this.formatValue(valCtx, depth + 1);
      } else {
        out += this.formatPrimitiveValue(valCtx);
      }
      const trailingHidden = this.hiddenRight(this.endToken(valCtx));
      out += this.emitHidden(trailingHidden);
      if (i === values.length - 1) {
        lastElementTrailingHidden = trailingHidden;
      }
      if (i < values.length - 1) {
        out += ',';
      }
    }

    out += '\n';
    out += this.indentUnit(depth);
    const beforeCloseHidden = this.hiddenLeft(closeTok).filter(
      (t) => !lastElementTrailingHidden.some((e) => e.tokenIndex === t.tokenIndex),
    );
    out += this.emitHidden(beforeCloseHidden);
    out += ']';
    return out;
  }
}
