import { snowflakeId } from '../core/snowflake-id.js';
import { firstClassName } from './first-class-name.js';
import { signatures } from './signatures.js';
import { typeSignatureToParsed } from './type-to-parsed.js';

/**
 * @typedef {object} ApiSchemaNode
 * @property {string | number} parentId
 * @property {string} id
 * @property {string} [key]
 * @property {string} type
 * @property {boolean} check
 * @property {string} [desc]
 * @property {number} [index]
 * @property {ApiSchemaNode[]} [children]
 */

/**
 * @param {import('./models.js').FileModel[]} fileModels
 * @returns {Record<string, import('./models.js').TypeModel>}
 */
export function buildClassMap(fileModels) {
  /** @type {Record<string, import('./models.js').TypeModel>} */
  const map = {};
  for (const fm of fileModels) {
    for (const t of fm.types) {
      map[t.name] = t;
    }
  }
  return map;
}

/**
 * @param {import('./models.js').TypeModel | undefined} clazz
 * @returns {string | undefined}
 */
function getApiModelDesc(clazz) {
  const value = clazz?.annotations?.ApiModel?.value;
  return typeof value === 'string' ? value : undefined;
}

/**
 * @param {import('./models.js').AnnotationMap} annotations
 */
function getApiModelProperty(annotations) {
  const api = annotations?.ApiModelProperty;
  const desc = typeof api?.value === 'string' ? api.value : undefined;
  return {
    desc,
    required: api?.required === true,
  };
}

/**
 * @param {import('./type-to-parsed.js').ParsedType} parsed
 */
function apiTypeName(parsed) {
  if (parsed.kind === 'base') return parsed.type;
  if (parsed.kind === 'list') return 'List';
  return 'Object';
}

/**
 * @param {string | undefined} key
 * @param {import('./type-to-parsed.js').ParsedType} parsed
 * @param {Record<string, import('./models.js').TypeModel>} classMap
 * @param {string | number} parentId
 * @param {import('./models.js').AnnotationMap} fieldAnnotations
 * @param {number | undefined} index
 * @param {string[]} path
 * @returns {ApiSchemaNode}
 */
export function buildNode(key, parsed, classMap, parentId, fieldAnnotations, index, path = []) {
  const id = snowflakeId();
  const { desc: fieldDesc, required } = getApiModelProperty(fieldAnnotations);

  /** @type {ApiSchemaNode} */
  const node = {
    parentId,
    id,
    type: apiTypeName(parsed),
    check: required || false,
  };

  if (key !== undefined) {
    node.key = key;
  }
  if (index !== undefined) {
    node.index = index;
  }

  let desc = fieldDesc;
  if (!desc && parsed.kind === 'object') {
    desc = getApiModelDesc(classMap[parsed.type]);
  }
  if (!desc && (parsed.kind === 'list' || parsed.kind === 'map') && parsed.inner.kind === 'object') {
    desc = getApiModelDesc(classMap[parsed.inner.type]);
  }
  if (desc) {
    node.desc = desc;
  }

  if (parsed.kind === 'object') {
    if (path.includes(parsed.type)) {
      return node;
    }
    const clazz = classMap[parsed.type];
    if (clazz) {
      node.children = clazz.ownMembers
        .filter((m) => m.kind === 'field')
        .map((f) =>
          buildNode(
            f.name,
            typeSignatureToParsed(f.type),
            classMap,
            id,
            f.annotations,
            undefined,
            [...path, parsed.type],
          ),
        );
    }
    return node;
  }

  if (parsed.kind === 'list' || parsed.kind === 'map') {
    node.children = [
      buildNode(undefined, parsed.inner, classMap, id, {}, 0, path),
    ];
  }

  return node;
}

/**
 * @param {string | string[]} inputs
 * @param {{ rootClass?: string }} [options]
 * @returns {ApiSchemaNode[]}
 */
export function toApiSchema(inputs, options = {}) {
  const codes = Array.isArray(inputs) ? inputs : [inputs];
  if (codes.length === 0) {
    throw new Error('toApiSchema: inputs must not be empty');
  }

  const fileModels = codes.map((code) => signatures(code));
  const classMap = buildClassMap(fileModels);

  let rootName = options.rootClass;
  if (!rootName) {
    rootName = firstClassName(codes[0]) ?? undefined;
  }
  if (!rootName) {
    throw new Error('toApiSchema: cannot determine root class name');
  }

  const root = classMap[rootName];
  if (!root) {
    throw new Error(`toApiSchema: root class not found: ${rootName}`);
  }

  return root.ownMembers
    .filter((m) => m.kind === 'field')
    .map((f) => buildNode(f.name, typeSignatureToParsed(f.type), classMap, 0, f.annotations));
}
