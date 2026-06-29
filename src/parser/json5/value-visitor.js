import { decodeJsonString, encodeJsonString } from '../json/string-utils.js';

/** @param {string} tokenText STRING / TRIPLE token including quotes */
export function decodeJson5String(tokenText) {
  if (tokenText.startsWith('"""') || tokenText.startsWith("'''")) {
    const inner = tokenText.slice(3, -3);
    return inner.replace(/\\(['"\\/bfnrt])/g, (_, c) => {
      switch (c) {
        case 'b': return '\b';
        case 'f': return '\f';
        case 'n': return '\n';
        case 'r': return '\r';
        case 't': return '\t';
        default: return c;
      }
    }).replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  const quote = tokenText[0];
  if (quote === '"' || quote === "'") {
    if (quote === '"') return decodeJsonString(tokenText);
    return decodeJsonString(`"${tokenText.slice(1, -1).replace(/"/g, '\\"')}"`);
  }
  return tokenText;
}

export function encodeDoubleQuotedString(value) {
  return `"${encodeJsonString(value)}"`;
}

/** @param {import('./Json5Parser.js').default.KeyContext} ctx */
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

/** @param {import('./Json5Parser.js').default.ValueContext} ctx */
export function visitValue(ctx) {
  if (ctx.object()) return visitObject(ctx.object());
  if (ctx.array()) return visitArray(ctx.array());
  if (ctx.STRING() || ctx.TRIPLE_DOUBLE_STRING() || ctx.TRIPLE_SINGLE_STRING()) {
    const tok = ctx.STRING() || ctx.TRIPLE_DOUBLE_STRING() || ctx.TRIPLE_SINGLE_STRING();
    return decodeJson5String(tok.getText());
  }
  if (ctx.NUMBER()) return parseJson5Number(ctx.NUMBER().getText());
  if (ctx.TRUE()) return true;
  if (ctx.FALSE()) return false;
  if (ctx.NULL()) return null;
  if (ctx.literal()) return visitLiteral(ctx.literal());
  throw new Error(`Unexpected value: ${ctx.getText()}`);
}

/** @param {import('./Json5Parser.js').default.LiteralContext} ctx */
function visitLiteral(ctx) {
  if (ctx.INFINITY()) return Infinity;
  if (ctx.NAN()) return NaN;
  if (ctx.signedLiteral()) {
    const s = ctx.signedLiteral();
    const sign = s.PLUS() ? 1 : -1;
    if (s.INFINITY()) return sign * Infinity;
    if (s.NAN()) return sign * NaN;
  }
  throw new Error(`Unexpected literal: ${ctx.getText()}`);
}

/** @param {import('./Json5Parser.js').default.ObjectContext} ctx */
function visitObject(ctx) {
  const result = {};
  const members = ctx.member ? ctx.member() : [];
  for (const member of members) {
    const key = keyToString(member.key());
    result[key] = visitValue(member.value());
  }
  return result;
}

/** @param {import('./Json5Parser.js').default.ArrayContext} ctx */
function visitArray(ctx) {
  const values = ctx.value ? ctx.value() : [];
  return values.map(visitValue);
}
