import { decodeJsonString } from './string-utils.js';

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ValueContext} ctx
 */
export function visitValue(ctx) {
  if (ctx.STRING()) {
    return decodeJsonString(ctx.STRING().getText());
  }
  if (ctx.NUMBER()) {
    return Number(ctx.NUMBER().getText());
  }
  if (ctx.obj()) {
    return visitObj(ctx.obj());
  }
  if (ctx.arr()) {
    return visitArr(ctx.arr());
  }
  const text = ctx.getText();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  throw new Error(`Unexpected value: ${text}`);
}

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ObjContext} ctx
 */
function visitObj(ctx) {
  const result = Object.create(null);
  const pairs = ctx.pair ? ctx.pair() : [];
  for (const pair of pairs) {
    const key = decodeJsonString(pair.STRING().getText());
    result[key] = visitValue(pair.value());
  }
  return result;
}

/**
 * @param {import('../../grammars/json/JSONParser.js').default.ArrContext} ctx
 */
function visitArr(ctx) {
  const values = ctx.value ? ctx.value() : [];
  return values.map(visitValue);
}
