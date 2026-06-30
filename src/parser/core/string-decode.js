/**
 * 标准 JSON 双引号字符串 token 解码/编码（JSON4 与 JSON5 共用）。
 */

/** @param {string} tokenText 含外层引号的 STRING token */
export function decodeJsonString(tokenText) {
  const inner = tokenText.slice(1, -1);
  if (inner.indexOf('\\') === -1) {
    return inner;
  }

  /** @type {string[]} */
  const parts = [];
  let chunk = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch !== '\\') {
      chunk += ch;
      continue;
    }
    if (chunk) {
      parts.push(chunk);
      chunk = '';
    }
    const esc = inner[++i];
    switch (esc) {
      case '"':
      case '\\':
      case '/':
        parts.push(esc);
        break;
      case 'b':
        parts.push('\b');
        break;
      case 'f':
        parts.push('\f');
        break;
      case 'n':
        parts.push('\n');
        break;
      case 'r':
        parts.push('\r');
        break;
      case 't':
        parts.push('\t');
        break;
      case 'u': {
        const hex = inner.slice(i + 1, i + 5);
        parts.push(String.fromCharCode(parseInt(hex, 16)));
        i += 4;
        break;
      }
      default:
        parts.push(esc);
    }
  }
  if (chunk) parts.push(chunk);
  return parts.join('');
}

/** @param {string} value 不含外层引号 */
export function encodeJsonString(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\u0008/g, '\\b')
    .replace(/\f/g, '\\f')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}
