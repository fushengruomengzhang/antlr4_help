import {runParsePipeline, visitArrayChildren} from '../core/parse-pipeline.js';
import Json5Lexer from '../../grammars/json5/Json5Lexer.js';
import Json5Parser from '../../grammars/json5/Json5Parser.js';
import {decodeJson5String, decodeTripleBody, keyToString, parseJson5Number, tripleStringBodyText,} from './decode.js';
import {validate} from "./validate.js";

/** @param {import('../../grammars/json5/Json5Parser.js').default.ValueContext} ctx */
function visitValue(ctx) {
    if (ctx.object()) return visitObject(ctx.object());
    if (ctx.array()) return visitArray(ctx.array());
    if (ctx.STRING()) return decodeJson5String(ctx.STRING().getText());
    if (ctx.tripleSingleString()) {
        return decodeTripleBody(tripleStringBodyText(ctx.tripleSingleString()));
    }
    if (ctx.tripleDoubleString()) {
        return decodeTripleBody(tripleStringBodyText(ctx.tripleDoubleString()));
    }
    if (ctx.NUMBER()) return parseJson5Number(ctx.NUMBER().getText());
    if (ctx.TRUE()) return true;
    if (ctx.FALSE()) return false;
    if (ctx.NULL()) return null;
    if (ctx.literal()) return visitLiteral(ctx.literal());
    throw new Error(`Unexpected value: ${ctx.getText()}`);
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.LiteralContext} ctx */
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

/** @param {import('../../grammars/json5/Json5Parser.js').default.ObjectContext} ctx */
function visitObject(ctx) {
    const result = {};
    const members = ctx.member ? ctx.member() : [];
    for (const member of members) {
        const key = keyToString(member.key());
        result[key] = visitValue(member.value());
    }
    return result;
}

/** @param {import('../../grammars/json5/Json5Parser.js').default.ArrayContext} ctx */
function visitArray(ctx) {
    const values = ctx.value ? ctx.value() : [];
    return visitArrayChildren(values, visitValue);
}

/**
 * @param {string} input
 * @returns {unknown}
 */
export function parse(input) {
    const {tree} = runParsePipeline({
        language: 'json5',
        input,
        Lexer: Json5Lexer,
        Parser: Json5Parser,
        entryRule: 'json5',
    });
    return visitValue(tree.value());
}


export const JSON5 = {parse, validate}