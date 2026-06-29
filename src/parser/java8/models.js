/**
 * @typedef {'class' | 'interface' | 'enum' | 'annotation'} TypeKind
 */

/**
 * @typedef {'field' | 'method' | 'constructor' | 'enumConstant' | 'interfaceConstant' | 'annotationElement'} MemberKind
 */

/**
 * @typedef {object} MemberModel
 * @property {MemberKind} kind
 * @property {string} [name]
 * @property {string} [type]
 * @property {string[]} [names]
 * @property {string} [returnType]
 * @property {string} [params]
 * @property {string[]} modifiers
 * @property {string} [throws]
 * @property {string} [signature] raw signature text
 */

/**
 * @typedef {object} TypeModel
 * @property {TypeKind} kind
 * @property {string} name
 * @property {string[]} modifiers
 * @property {string} [typeParameters]
 * @property {string} [extends]
 * @property {string[]} [implements]
 * @property {MemberModel[]} ownMembers
 * @property {TypeModel[]} nestedTypes
 */

/**
 * @typedef {object} FileModel
 * @property {TypeModel[]} types
 */

export {};
