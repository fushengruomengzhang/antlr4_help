/**
 * @typedef {'class' | 'interface' | 'enum' | 'annotation'} TypeKind
 */

/**
 * @typedef {'field' | 'method' | 'constructor' | 'enumConstant' | 'interfaceConstant' | 'annotationElement'} MemberKind
 */

/**
 * @typedef {Record<string, AnnotationValue>} AnnotationMap
 */

/**
 * @typedef {Record<string, AnnotationValue>} AnnotationAttrs
 */

/**
 * @typedef {string | number | boolean | null | AnnotationMap | AnnotationValue[]} AnnotationValue
 */

/**
 * @typedef {object} PrimitiveTypeSignature
 * @property {'primitive'} kind
 * @property {string} name
 */

/**
 * @typedef {object} VoidTypeSignature
 * @property {'void'} kind
 */

/**
 * @typedef {object} ClassTypeSignature
 * @property {'class'} kind
 * @property {string} name
 * @property {TypeSignature[]} [typeArguments]
 */

/**
 * @typedef {object} TypeVariableSignature
 * @property {'typeVariable'} kind
 * @property {string} name
 */

/**
 * @typedef {object} ArrayTypeSignature
 * @property {'array'} kind
 * @property {TypeSignature} elementType
 * @property {number} dimensions
 */

/**
 * @typedef {object} WildcardBound
 * @property {'extends' | 'super'} kind
 * @property {TypeSignature} type
 */

/**
 * @typedef {object} WildcardTypeSignature
 * @property {'wildcard'} kind
 * @property {WildcardBound} [bound]
 */

/**
 * @typedef {PrimitiveTypeSignature | ClassTypeSignature | TypeVariableSignature | ArrayTypeSignature | WildcardTypeSignature | VoidTypeSignature} TypeSignature
 */

/**
 * @typedef {object} TypeParameterBound
 * @property {TypeSignature} extends
 * @property {TypeSignature[]} [additional]
 */

/**
 * @typedef {object} TypeParameterModel
 * @property {string} name
 * @property {AnnotationMap} [annotations]
 * @property {TypeParameterBound} [bound]
 */

/**
 * @typedef {object} ParameterModel
 * @property {string} name
 * @property {TypeSignature} type
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {boolean} [varargs]
 */

/**
 * @typedef {object} FieldMemberModel
 * @property {'field'} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {TypeSignature} type
 * @property {AnnotationValue} [defaultValue]
 */

/**
 * @typedef {object} MethodMemberModel
 * @property {'method'} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {TypeParameterModel[]} [typeParameters]
 * @property {TypeSignature} returnType
 * @property {number} [returnDimensions]
 * @property {ParameterModel[]} parameters
 * @property {TypeSignature[]} [throwsTypes]
 */

/**
 * @typedef {object} ConstructorMemberModel
 * @property {'constructor'} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {TypeParameterModel[]} [typeParameters]
 * @property {ParameterModel[]} parameters
 * @property {TypeSignature[]} [throwsTypes]
 */

/**
 * @typedef {object} EnumConstantMemberModel
 * @property {'enumConstant'} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 */

/**
 * @typedef {object} InterfaceConstantMemberModel
 * @property {'interfaceConstant'} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {TypeSignature} type
 * @property {AnnotationValue} [defaultValue]
 */

/**
 * @typedef {object} AnnotationElementMemberModel
 * @property {'annotationElement'} kind
 * @property {string} name
 * @property {AnnotationMap} [annotations]
 * @property {TypeSignature} type
 * @property {AnnotationValue} [defaultValue]
 */

/**
 * @typedef {FieldMemberModel | MethodMemberModel | ConstructorMemberModel | EnumConstantMemberModel | InterfaceConstantMemberModel | AnnotationElementMemberModel} MemberModel
 */

/**
 * @typedef {object} TypeModel
 * @property {TypeKind} kind
 * @property {string} name
 * @property {AnnotationMap} annotations
 * @property {string[]} modifiers
 * @property {TypeParameterModel[]} [typeParameters]
 * @property {TypeSignature} [extendsType]
 * @property {TypeSignature[]} [implementsTypes]
 * @property {MemberModel[]} ownMembers
 * @property {TypeModel[]} nestedTypes
 */

/**
 * @typedef {object} FileModel
 * @property {TypeModel[]} types
 */

export {};
