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
 */

export const DEFAULT_FORMAT_OPTIONS = {
  indent: { type: 'space', size: 2 },
  sortKeys: false,
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
   * @param {import('./Json5Parser.js').default.Json5Context} root
   */
  formatDocument(root) {
    return this.formatValue(root.value(), 0).trimEnd();
  }

  /** @param {import('./Json5Parser.js').default.ValueContext} ctx @param {number} depth */
  formatValue(ctx, depth) {
    if (ctx.object()) return this.formatObject(ctx.object(), depth);
    if (ctx.array()) return this.formatArray(ctx.array(), depth);
    return this.formatPrimitiveValue(ctx);
  }

  /** @param {import('./Json5Parser.js').default.ValueContext} ctx */
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

  /** @param {import('./Json5Parser.js').default.KeyContext} keyCtx */
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

  /** @param {import('./Json5Parser.js').default.KeyContext} keyCtx */
  keySortString(keyCtx) {
    return keyToString(keyCtx);
  }

  /** @param {import('./Json5Parser.js').default.ObjectContext} ctx @param {number} depth */
  formatObject(ctx, depth) {
    const lbrace = ctx.LBRACE();
    const rbrace = ctx.RBRACE();
    let members = ctx.member ? ctx.member() : [];
    if (this.options.sortKeys) {
      members = [...members].sort((a, b) =>
        this.keySortString(a.key()).localeCompare(this.keySortString(b.key())),
      );
    }

    let out = '{';
    out += this.emitHidden(this.hiddenRight(lbrace));

    if (members.length === 0) {
      out += this.emitHidden(this.hiddenLeft(rbrace));
      out += '}';
      return out;
    }

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
      out += this.emitHidden(this.hiddenRight(valStop));
      if (i < members.length - 1) {
        out += ',';
      }
    }

    out += '\n';
    out += this.indentUnit(depth);
    out += this.emitHidden(this.hiddenLeft(rbrace));
    out += '}';
    return out;
  }

  /** @param {import('./Json5Parser.js').default.ArrayContext} ctx @param {number} depth */
  formatArray(ctx, depth) {
    const lbrack = ctx.LBRACK();
    const rbrack = ctx.RBRACK();
    const values = ctx.value ? ctx.value() : [];

    let out = '[';
    out += this.emitHidden(this.hiddenRight(lbrack));

    if (values.length === 0) {
      out += this.emitHidden(this.hiddenLeft(rbrack));
      out += ']';
      return out;
    }

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
      out += this.emitHidden(this.hiddenRight(this.endToken(valCtx)));
      if (i < values.length - 1) {
        out += ',';
      }
    }

    out += '\n';
    out += this.indentUnit(depth);
    out += this.emitHidden(this.hiddenLeft(rbrack));
    out += ']';
    return out;
  }
}
