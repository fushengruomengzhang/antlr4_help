import { TextBuf } from '../../core/text-buf.js';
import { decodeJson5String, encodeDoubleQuotedString } from '../decode.js';
import { normalizeFormatOptions } from './format-options.js';
import { stripTrailingCommaSuffix } from './ast-transform.js';

export class DocumentEmitter {
  /**
   * @param {Required<import('./format-options.js').FormatOptions>} options
   */
  constructor(options) {
    this.options = options;
    /** @type {Map<number, string>} */
    this._indentCache = new Map();
  }

  /** @param {number} depth */
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

  /** @param {string} text */
  compactWhitespace(text) {
    return text.replace(/\n{2,}/g, '\n');
  }

  /**
   * @param {string} text
   * @param {boolean} compact
   */
  layoutHidden(text, compact) {
    if (!text) return '';
    return compact ? this.compactWhitespace(text) : text;
  }

  entrySuffix(entry, isLast) {
    const raw = this.options.sortKeys ? entry.suffixSort : entry.suffix;
    return this.normalizeMemberSuffix(raw, isLast, this.options.compact);
  }

  /** @param {string} suffix @param {boolean} isLast @param {boolean} compact */
  normalizeMemberSuffix(suffix, isLast, compact) {
    let out = suffix;
    if (compact) {
      out = this.compactWhitespace(out);
      out = out.replace(/\n[ \t]*(?=\n)/g, '\n').replace(/\n{2,}/g, '\n');
      out = out.replace(/\n[ \t]*$/g, '');
    }
    if (isLast) {
      out = stripTrailingCommaSuffix(out);
    } else if (!/,/.test(out)) {
      out = ',' + out;
    }
    return this.normalizeCommaBeforeComment(out);
  }

  /** @param {string} suffix */
  normalizeCommaBeforeComment(suffix) {
    if (!suffix) return suffix;
    return suffix
      .replace(/^(\s*)((?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)\s*),(\s*)$/m, ',$1$2$3')
      .replace(/(\s*(?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)\s*),(\s*)$/, ',$1$2');
  }

  /** @param {string} text */
  splitOpeningHiddenFromText(text) {
    if (!text) return { inline: '', hasLayout: false };
    if (!/\n/.test(text)) return { inline: text, hasLayout: false };
    let inline = '';
    let hasLayout = false;
    for (const part of text.split(/(?=\n)/)) {
      if (/\n/.test(part)) {
        hasLayout = true;
      } else {
        inline += part;
      }
    }
    return { inline, hasLayout };
  }

  /**
   * @param {import('./types.js').ValueNode} node
   * @param {number} depth
   */
  emitValue(node, depth) {
    switch (node.kind) {
      case 'object':
        return this.options.compact
          ? this.emitObjectCompact(node, depth)
          : this.emitObjectPretty(node, depth);
      case 'array':
        return this.options.compact
          ? this.emitArrayCompact(node, depth)
          : this.emitArrayPretty(node, depth);
      case 'tripleSingle':
        return this.emitTripleSingle(node);
      case 'tripleDouble':
        return this.emitTripleDouble(node);
      default:
        return this.options.compact
          ? node.source
          : this.formatPrimitiveSource(node.source);
    }
  }

  /** @param {import('./types.js').DocumentNode} doc */
  emitDocument(doc) {
    const buf = new TextBuf();
    const compact = this.options.compact;
    buf.push(this.layoutHidden(doc.before, compact));
    buf.push(this.emitValue(doc.value, 0));
    buf.push(this.layoutHidden(doc.after, compact));
    return buf.toString().trimEnd();
  }

  /** @param {string} source */
  formatPrimitiveSource(source) {
    if (
      (source.startsWith('"') && source.endsWith('"')) ||
      (source.startsWith("'") && source.endsWith("'"))
    ) {
      return encodeDoubleQuotedString(decodeJson5String(source));
    }
    return source;
  }

  /** @param {import('./types.js').TripleSingleNode} node */
  emitTripleSingle(node) {
    const buf = new TextBuf();
    buf.push("'''");
    buf.push(node.openRight);
    buf.push(node.body);
    buf.push("'''");
    return buf.toString();
  }

  /** @param {import('./types.js').TripleDoubleNode} node */
  emitTripleDouble(node) {
    const buf = new TextBuf();
    buf.push('"""');
    buf.push(node.openRight);
    buf.push(node.body);
    buf.push('"""');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ValueNode} node
   * @param {number} depth
   */
  emitMemberValue(node, depth) {
    if (node.kind === 'object' || node.kind === 'array') {
      return this.emitValue(node, depth);
    }
    if (node.kind === 'tripleSingle' || node.kind === 'tripleDouble') {
      return this.emitValue(node, depth);
    }
    return this.options.compact ? node.source : this.formatPrimitiveSource(node.source);
  }

  /**
   * @param {import('./types.js').ObjectNode} node
   * @param {number} depth
   */
  emitObjectCompact(node, depth) {
    const buf = new TextBuf();
    const indentMember = (d) => this.indentUnit(d);

    if (node.entries.length === 0) {
      const { inline, hasLayout } = this.splitOpeningHiddenFromText(
        this.layoutHidden(node.openRight, true),
      );
      buf.push('{');
      buf.push(inline);
      if (hasLayout) {
        buf.beginCloseLine(indentMember, depth);
      }
      buf.push('}');
      return buf.toString();
    }

    buf.push('{');
    buf.push(this.layoutHidden(node.openRight, true));

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.beginMemberLine(indentMember, depth);
      const useSortBefore = this.options.sortKeys;
      if (useSortBefore) {
        buf.push(this.layoutHidden(entry.before, true));
      }
      buf.push(entry.keySource, ': ', this.emitMemberValue(entry.value, depth + 1));
      buf.push(this.entrySuffix(entry, isLast));
    }

    buf.push(this.layoutHidden(node.closeBefore, true));
    buf.beginCloseLine(indentMember, depth);
    buf.push('}');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ArrayNode} node
   * @param {number} depth
   */
  emitArrayCompact(node, depth) {
    const buf = new TextBuf();
    const indentMember = (d) => this.indentUnit(d);

    if (node.entries.length === 0) {
      const { inline, hasLayout } = this.splitOpeningHiddenFromText(
        this.layoutHidden(node.openRight, true),
      );
      buf.push('[');
      buf.push(inline);
      if (hasLayout) {
        buf.beginCloseLine(indentMember, depth);
      }
      buf.push(']');
      return buf.toString();
    }

    buf.push('[');
    buf.push(this.layoutHidden(node.openRight, true));

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.beginMemberLine(indentMember, depth);
      if (i === 0) {
        buf.push(this.layoutHidden(entry.before, true));
      }
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      buf.push(this.entrySuffix(entry, isLast));
    }

    buf.push(this.layoutHidden(node.closeBefore, true));
    buf.beginCloseLine(indentMember, depth);
    buf.push(']');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ObjectNode} node
   * @param {number} depth
   */
  emitObjectPretty(node, depth) {
    const buf = new TextBuf();
    buf.push('{');

    if (node.entries.length === 0) {
      buf.push(node.openRight, '}');
      return buf.toString();
    }

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.push('\n', this.indentUnit(depth + 1));
      const prefix =
        !this.options.sortKeys && entry.beforeFull != null
          ? entry.beforeFull
          : entry.before;
      buf.push(prefix);
      buf.push(entry.keySource, ': ');
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      if (this.options.sortKeys) {
        buf.push(this.entrySuffix(entry, isLast));
      } else {
        buf.push(entry.afterValue);
        if (!isLast) {
          buf.push(',');
        }
      }
    }

    buf.push('\n', this.indentUnit(depth));
    buf.push(node.closeBefore, '}');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ArrayNode} node
   * @param {number} depth
   */
  emitArrayPretty(node, depth) {
    const buf = new TextBuf();
    buf.push('[');

    if (node.entries.length === 0) {
      buf.push(node.openRight, ']');
      return buf.toString();
    }

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.push('\n', this.indentUnit(depth + 1));
      const prefix = i === 0 && entry.beforeFull != null ? entry.beforeFull : entry.before;
      buf.push(prefix);
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      if (this.options.sortKeys) {
        buf.push(this.entrySuffix(entry, isLast));
      } else {
        buf.push(entry.afterValue);
        if (!isLast) {
          buf.push(',');
        }
      }
    }

    buf.push('\n', this.indentUnit(depth));
    buf.push(node.closeBefore, ']');
    return buf.toString();
  }
}

/**
 * @param {import('./types.js').DocumentNode} doc
 * @param {import('./format-options.js').FormatOptions} [options]
 */
export function emitDocument(doc, options) {
  const normalized = normalizeFormatOptions(options);
  const emitter = new DocumentEmitter(normalized);
  return emitter.emitDocument(doc);
}
