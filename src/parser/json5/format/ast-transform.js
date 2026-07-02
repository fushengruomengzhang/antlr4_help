import { normalizeFormatOptions } from './format-options.js';

/** @param {string} suffix */
export function stripTrailingCommaSuffix(suffix) {
  return suffix.replace(/,(\s*(?:\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)?\s*)$/, '$1');
}

/**
 * @param {import('./types.js').DocumentNode} doc
 * @param {import('./format-options.js').FormatOptions} [options]
 */
export function transformDocumentAst(doc, options) {
  const normalized = normalizeFormatOptions(options);
  return {
    ...doc,
    value: transformValue(doc.value, normalized),
  };
}

/**
 * @param {import('./types.js').ValueNode} node
 * @param {Required<import('./format-options.js').FormatOptions>} options
 */
function transformValue(node, options) {
  if (node.kind === 'object') return transformObject(node, options);
  if (node.kind === 'array') return transformArray(node, options);
  return node;
}

/**
 * @param {import('./types.js').ObjectNode} node
 * @param {Required<import('./format-options.js').FormatOptions>} options
 */
function transformObject(node, options) {
  let entries = node.entries.map((entry) => ({
    ...entry,
    value: transformValue(entry.value, options),
  }));

  if (options.sortKeys) {
    entries = entries
      .map((entry, ord) => ({ entry, ord }))
      .sort((a, b) => a.entry.sortKey.localeCompare(b.entry.sortKey) || a.ord - b.ord)
      .map((x) => x.entry);
  }

  entries = entries.map((entry, index) => {
    if (index !== entries.length - 1) return entry;
    return {
      ...entry,
      suffix: stripTrailingCommaSuffix(entry.suffix),
      suffixSort: stripTrailingCommaSuffix(entry.suffixSort),
    };
  });

  return { ...node, entries };
}

/**
 * @param {import('./types.js').ArrayNode} node
 * @param {Required<import('./format-options.js').FormatOptions>} options
 */
function transformArray(node, options) {
  let entries = node.entries.map((entry) => ({
    ...entry,
    value: transformValue(entry.value, options),
  }));

  entries = entries.map((entry, index) => {
    if (index !== entries.length - 1) return entry;
    return {
      ...entry,
      suffix: stripTrailingCommaSuffix(entry.suffix),
      suffixSort: stripTrailingCommaSuffix(entry.suffixSort),
    };
  });

  return { ...node, entries };
}
