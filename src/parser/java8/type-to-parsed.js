import { resolveBaseType } from './base-type-map.js';

/**
 * @typedef {{ kind: 'base', type: string }} BaseParsed
 * @typedef {{ kind: 'object', type: string }} ObjectParsed
 * @typedef {{ kind: 'list', inner: ParsedType }} ListParsed
 * @typedef {{ kind: 'map', inner: ParsedType }} MapParsed
 * @typedef {BaseParsed | ObjectParsed | ListParsed | MapParsed} ParsedType
 */

/**
 * @param {import('./models.js').TypeSignature} sig
 * @returns {ParsedType}
 */
export function typeSignatureToParsed(sig) {
  if (sig.kind === 'primitive') {
    const mapped = resolveBaseType(sig.name);
    if (mapped) {
      return { kind: 'base', type: mapped };
    }
    return { kind: 'object', type: sig.name };
  }

  if (sig.kind === 'class') {
    if (sig.name === 'List') {
      const inner = sig.typeArguments?.[0];
      if (!inner) {
        return { kind: 'list', inner: { kind: 'object', type: 'Object' } };
      }
      return { kind: 'list', inner: typeSignatureToParsed(inner) };
    }
    if (sig.name === 'Map') {
      const valueType = sig.typeArguments?.[1] ?? sig.typeArguments?.[0];
      if (!valueType) {
        return { kind: 'map', inner: { kind: 'object', type: 'Object' } };
      }
      return { kind: 'map', inner: typeSignatureToParsed(valueType) };
    }
    const mapped = resolveBaseType(sig.name);
    if (mapped) {
      return { kind: 'base', type: mapped };
    }
    return { kind: 'object', type: sig.name };
  }

  if (sig.kind === 'array') {
    return {
      kind: 'list',
      inner: typeSignatureToParsed(sig.elementType),
    };
  }

  if (sig.kind === 'typeVariable') {
    return { kind: 'object', type: sig.name };
  }

  if (sig.kind === 'wildcard') {
    const boundType = sig.bound?.type;
    if (boundType) {
      return typeSignatureToParsed(boundType);
    }
    return { kind: 'object', type: 'Object' };
  }

  return { kind: 'object', type: 'Object' };
}
