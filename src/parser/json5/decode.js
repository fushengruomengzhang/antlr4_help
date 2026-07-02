import { decodeJsonString, encodeJsonString } from '../core/string-decode.js';

/** @param {string} bodyText triple-quoted string body (no delimiters) */
export function decodeTripleBody(bodyText) {
  if (!bodyText) return '';
  return bodyText
    .replace(/\\(['"\\/bfnrt])/g, (_, c) => {
      switch (c) {
        case 'b': return '\b';
        case 'f': return '\f';
        case 'n': return '\n';
        case 'r': return '\r';
        case 't': return '\t';
        default: return c;
      }
    })
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/** @param {string} tokenText STRING token including quotes */
export function decodeJson5String(tokenText) {
  if (tokenText.startsWith('"""') || tokenText.startsWith("'''")) {
    const inner = tokenText.slice(3, -3);
    return decodeTripleBody(inner);
  }
  const quote = tokenText[0];
  if (quote === '"' || quote === "'") {
    if (quote === '"') return decodeJsonString(tokenText);
    return decodeJsonString(`"${tokenText.slice(1, -1).replace(/"/g, '\\"')}"`);
  }
  return tokenText;
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.TripleSingleStringContext | import('../../grammars/json5/Json5Parser.js').default.TripleDoubleStringContext} ctx */
export function tripleStringBodyText(ctx) {
  const parts = ctx.TRIPLE_S_BODY ? ctx.TRIPLE_S_BODY() : ctx.TRIPLE_D_BODY();
  if (!parts || parts.length === 0) return '';
  return parts.map((t) => t.getText()).join('');
}

export function encodeDoubleQuotedString(value) {
  return `"${encodeJsonString(value)}"`;
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.KeyContext} ctx */
export function keyToString(ctx) {
  if (ctx.IdentifierName()) return ctx.IdentifierName().getText();
  if (ctx.NUMBER()) return ctx.NUMBER().getText();
  if (ctx.STRING()) return decodeJson5String(ctx.STRING().getText());
  if (ctx.TRUE()) return 'true';
  if (ctx.FALSE()) return 'false';
  if (ctx.NULL()) return 'null';
  if (ctx.INFINITY()) return 'Infinity';
  if (ctx.NAN()) return 'NaN';
  return ctx.getText();
}

/** @param {string} text */
export function parseJson5Number(text) {
  if (/^0[xX]/.test(text)) {
    return parseInt(text, 16);
  }
  return Number(text);
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.KeyContext} ctx */
export function keySourceText(ctx) {
  if (ctx.IdentifierName()) return ctx.IdentifierName().getText();
  if (ctx.NUMBER()) return ctx.NUMBER().getText();
  if (ctx.STRING()) return ctx.STRING().getText();
  if (ctx.TRUE()) return 'true';
  if (ctx.FALSE()) return 'false';
  if (ctx.NULL()) return 'null';
  if (ctx.INFINITY()) return 'Infinity';
  if (ctx.NAN()) return 'NaN';
  return ctx.getText();
}
