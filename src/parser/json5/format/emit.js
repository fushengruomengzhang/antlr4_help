import { TextBuf } from '../../core/text-buf.js';
import { decodeJson5String, encodeDoubleQuotedString } from '../decode.js';
import { normalizeFormatOptions } from './format-options.js';
import { CommentSlicer } from './token-slice.js';

export class DocumentEmitter {
  /**
   * @param {import('antlr4').CommonTokenStream} tokenStream
   * @param {Required<import('./format-options.js').FormatOptions>} options
   * @param {number} [inputLen]
   */
  constructor(tokenStream, options, inputLen = 0) {
    this.options = options;
    this.slicer = new CommentSlicer(tokenStream, inputLen);
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

  /** @param {import('./types.js').AnchorTriplet} triplet */
  openInlineText(triplet) {
    const parts = this.slicer.suffixComments(triplet, true);
    return parts.join(' ');
  }

  /** @param {import('./types.js').AnchorTriplet} triplet */
  inlineSuffix(triplet) {
    const parts = this.slicer.suffixComments(triplet, true);
    if (parts.length === 0) return '';
    return parts.join(' ');
  }

  /** @param {import('./types.js').ObjectEntry} entry @param {boolean} isLast */
  emitEntryEnd(entry, isLast) {
    const inline = this.inlineSuffix(entry.end);
    if (!isLast) return inline ? ', ' + inline : ',';
    if (inline) return (entry.endHasComma ? ', ' : ' ') + inline;
    return '';
  }

  /** @param {import('./types.js').ArrayEntry} entry @param {boolean} isLast */
  emitArrayEntryEnd(entry, isLast) {
    return this.emitEntryEnd(/** @type {import('./types.js').ObjectEntry} */ (entry), isLast);
  }

  /** @param {import('./types.js').AnchorTriplet} triplet */
  prefixCommentLines(triplet) {
    return this.slicer.prefixComments(triplet);
  }

  /**
   * @param {import('./types.js').AnchorTriplet} triplet
   * @param {number} depth
   */
  emitPrefixLines(triplet, depth) {
    const comments = this.slicer.prefixComments(triplet);
    if (comments.length === 0) return '';
    const indent = this.indentUnit(depth);
    return comments.map((c) => `${indent}${c}`).join('\n') + '\n' + indent;
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
    buf.push(this.slicer.hiddenGap(doc.lead.prev, doc.lead.current));
    buf.push(this.emitValue(doc.value, 0));
    buf.push(this.slicer.hiddenGap(doc.trail.prev, doc.trail.current));
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
    buf.push(this.slicer.hiddenRightText(node.open.current));
    buf.push(node.body);
    buf.push("'''");
    return buf.toString();
  }

  /** @param {import('./types.js').TripleDoubleNode} node */
  emitTripleDouble(node) {
    const buf = new TextBuf();
    buf.push('"""');
    buf.push(this.slicer.hiddenRightText(node.open.current));
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
      const layout = this.slicer.openLayout(node.open);
      buf.push('{');
      if (layout.inline) {
        buf.push(layout.inline.startsWith(' ') ? layout.inline : ' ' + layout.inline);
      }
      if (layout.hasMultiline) {
        buf.beginCloseLine(indentMember, depth);
      }
      buf.push('}');
      return buf.toString();
    }

    if (depth > 0) {
      const pre = this.emitPrefixLines(node.open, depth);
      if (pre) buf.push(pre);
    }

    buf.push('{');
    const openInline = this.openInlineText(node.open);
    if (openInline) buf.push(' ', openInline);

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.beginMemberLine(indentMember, depth);
      const prefixComments = this.prefixCommentLines(entry.key);
      for (let p = 0; p < prefixComments.length; p++) {
        if (p > 0) buf.push('\n', indentMember(depth + 1));
        buf.push(prefixComments[p]);
      }
      if (prefixComments.length > 0) {
        buf.push('\n', indentMember(depth + 1));
      }
      buf.push(entry.keySource, ': ', this.emitMemberValue(entry.value, depth + 1));
      buf.push(this.emitEntryEnd(entry, isLast));
    }

    const closeBefore = this.closeBeforeText(node);
    if (closeBefore) buf.push(closeBefore);
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
      const layout = this.slicer.openLayout(node.open);
      buf.push('[');
      if (layout.inline) {
        buf.push(layout.inline.startsWith(' ') ? layout.inline : ' ' + layout.inline);
      }
      if (layout.hasMultiline) {
        buf.beginCloseLine(indentMember, depth);
      }
      buf.push(']');
      return buf.toString();
    }

    if (depth > 0) {
      const pre = this.emitPrefixLines(node.open, depth);
      if (pre) buf.push(pre);
    }

    buf.push('[');
    const openInline = this.openInlineText(node.open);
    if (openInline) buf.push(' ', openInline);

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.beginMemberLine(indentMember, depth);
      const prefixComments = this.prefixCommentLines(entry.item);
      for (let p = 0; p < prefixComments.length; p++) {
        if (p > 0) buf.push('\n', indentMember(depth + 1));
        buf.push(prefixComments[p]);
      }
      if (prefixComments.length > 0) {
        buf.push('\n', indentMember(depth + 1));
      }
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      buf.push(this.emitArrayEntryEnd(entry, isLast));
    }

    const closeBefore = this.closeBeforeTextArray(node);
    if (closeBefore) buf.push(closeBefore);
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
    const indent = (d) => this.indentUnit(d);

    buf.push('{');

    if (node.entries.length === 0) {
      buf.push(
        this.slicer.hiddenGap(node.open.prev, node.open.current),
        this.slicer.hiddenGap(node.close.prev, node.close.current),
        '}',
      );
      return buf.toString();
    }

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.push('\n', indent(depth + 1));
      if (this.options.sortKeys) {
        const prefixComments = this.prefixCommentLines(entry.key);
        for (let p = 0; p < prefixComments.length; p++) {
          if (p > 0) buf.push('\n', indent(depth + 1));
          buf.push(prefixComments[p]);
        }
        if (prefixComments.length > 0) buf.push('\n', indent(depth + 1));
      } else {
        buf.push(this.slicer.hiddenGap(entry.key.prev, entry.key.current));
      }
      buf.push(entry.keySource, ': ');
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      if (this.options.sortKeys) {
        buf.push(this.emitEntryEnd(entry, isLast));
      } else {
        buf.push(this.slicer.hiddenRightText(entry.end.prev));
        if (!isLast) buf.push(',');
      }
    }

    buf.push('\n', indent(depth), this.closeBeforeText(node), '}');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ObjectNode} node
   */
  closeBeforeText(node) {
    const lastValStop =
      node.entries.length > 0
        ? node.entries[node.entries.length - 1].end.prev
        : node.open.current;
    return this.slicer.closeBeforeText(node.close, lastValStop);
  }

  /**
   * @param {import('./types.js').ArrayNode} node
   * @param {number} depth
   */
  emitArrayPretty(node, depth) {
    const buf = new TextBuf();
    const indent = (d) => this.indentUnit(d);

    buf.push('[');

    if (node.entries.length === 0) {
      buf.push(
        this.slicer.hiddenGap(node.open.prev, node.open.current),
        this.slicer.hiddenGap(node.close.prev, node.close.current),
        ']',
      );
      return buf.toString();
    }

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];
      const isLast = i === node.entries.length - 1;
      buf.push('\n', indent(depth + 1));
      if (this.options.sortKeys) {
        const prefixComments = this.prefixCommentLines(entry.item);
        for (let p = 0; p < prefixComments.length; p++) {
          if (p > 0) buf.push('\n', indent(depth + 1));
          buf.push(prefixComments[p]);
        }
        if (prefixComments.length > 0) buf.push('\n', indent(depth + 1));
      } else {
        buf.push(this.slicer.hiddenGap(entry.item.prev, entry.item.current));
      }
      buf.push(this.emitMemberValue(entry.value, depth + 1));
      if (this.options.sortKeys) {
        buf.push(this.emitArrayEntryEnd(entry, isLast));
      } else {
        buf.push(this.slicer.hiddenRightText(entry.end.prev));
        if (!isLast) buf.push(',');
      }
    }

    buf.push('\n', indent(depth), this.closeBeforeTextArray(node), ']');
    return buf.toString();
  }

  /**
   * @param {import('./types.js').ArrayNode} node
   */
  closeBeforeTextArray(node) {
    const lastValStop =
      node.entries.length > 0
        ? node.entries[node.entries.length - 1].end.prev
        : node.open.current;
    return this.slicer.closeBeforeText(node.close, lastValStop);
  }
}

/**
 * @param {import('./types.js').DocumentNode} doc
 * @param {import('antlr4').CommonTokenStream} tokenStream
 * @param {import('./format-options.js').FormatOptions} [options]
 * @param {string} [input]
 */
export function emitDocument(doc, tokenStream, options, input = '') {
  const normalized = normalizeFormatOptions(options);
  const emitter = new DocumentEmitter(tokenStream, normalized, input.length);
  return emitter.emitDocument(doc);
}
