/**
 * @param {string} typeName
 * @param {Record<string, import('../../java8/models.js').TypeModel>} classMap
 * @returns {import('../../java8/models.js').TypeModel[]}
 */
export function collectExtendsChain(typeName, classMap) {
  /** @type {import('../../java8/models.js').TypeModel[]} */
  const chain = [];
  let current = classMap[typeName];
  while (current) {
    chain.unshift(current);
    const ext = current.extendsType;
    if (!ext || ext.kind !== 'class') {
      break;
    }
    current = classMap[ext.name];
  }
  return chain;
}

/**
 * @param {string} typeName
 * @param {Record<string, import('../../java8/models.js').TypeModel>} classMap
 * @returns {import('../../java8/models.js').FieldMemberModel[]}
 */
export function effectiveFields(typeName, classMap) {
  const chain = collectExtendsChain(typeName, classMap);
  if (chain.length === 0) {
    return [];
  }

  /** @type {Map<string, import('../../java8/models.js').FieldMemberModel>} */
  const byName = new Map();
  for (const type of chain) {
    for (const member of type.ownMembers) {
      if (member.kind === 'field') {
        byName.set(member.name, member);
      }
    }
  }

  /** @type {import('../../java8/models.js').FieldMemberModel[]} */
  const result = [];
  const seen = new Set();
  for (const type of chain) {
    for (const member of type.ownMembers) {
      if (member.kind !== 'field' || seen.has(member.name)) {
        continue;
      }
      result.push(byName.get(member.name) ?? member);
      seen.add(member.name);
    }
  }
  return result;
}

/**
 * @param {import('../../java8/models.js').TypeSignature} typeSig
 * @param {Set<string>} [names]
 * @returns {Set<string>}
 */
export function collectObjectTypeNames(typeSig, names = new Set()) {
  if (!typeSig) {
    return names;
  }
  if (typeSig.kind === 'class') {
    if (typeSig.name === 'List') {
      const inner = typeSig.typeArguments?.[0];
      return inner ? collectObjectTypeNames(inner, names) : names;
    }
    if (typeSig.name === 'Map') {
      const value = typeSig.typeArguments?.[1] ?? typeSig.typeArguments?.[0];
      return value ? collectObjectTypeNames(value, names) : names;
    }
    names.add(typeSig.name);
    return names;
  }
  if (typeSig.kind === 'array') {
    return collectObjectTypeNames(typeSig.elementType, names);
  }
  return names;
}

/**
 * @param {import('../../java8/models.js').TypeSignature} typeSig
 * @param {string} typeName
 * @returns {boolean}
 */
export function fieldReferencesType(typeSig, typeName) {
  if (!typeSig || !typeName) {
    return false;
  }
  return collectObjectTypeNames(typeSig).has(typeName);
}

/**
 * @param {import('../../java8/models.js').TypeSignature} typeSig
 * @param {string[]} path
 * @returns {boolean}
 */
export function fieldReferencesTypeInPath(typeSig, path) {
  if (!path?.length) {
    return false;
  }
  for (const name of collectObjectTypeNames(typeSig)) {
    if (path.includes(name)) {
      return true;
    }
  }
  return false;
}
