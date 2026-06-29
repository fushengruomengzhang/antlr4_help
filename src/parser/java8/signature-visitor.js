import Java8Parser from '../../grammars/java8/Java8Parser.js';
import {
  parseElementValue,
  parseVariableInitializer,
  splitAnnotationsAndModifiers,
} from './annotation-parser.js';
import {
  parseExtendsType,
  parseFormalParameters,
  parseImplementsTypes,
  parseReturnType,
  parseThrowsTypes,
  parseTypeParameters,
  parseTypeSignature,
} from './type-parser.js';

/** @param {import('../../grammars/java8/Java8Parser.js').default.DimsContext | null | undefined} ctx */
function countDimensions(ctx) {
  if (!ctx) return 0;
  return ctx.LBRACK?.()?.length ?? 0;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.FieldDeclarationContext} ctx @returns {import('./models.js').FieldMemberModel[]} */
function extractFields(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.fieldModifier?.() ?? []);
  const type = parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' };
  const list = ctx.variableDeclaratorList()?.variableDeclarator?.() ?? [];

  return list.map((v) => {
    /** @type {import('./models.js').FieldMemberModel} */
    const member = {
      kind: 'field',
      name: v.variableDeclaratorId()?.Identifier()?.getText() ?? '',
      annotations,
      modifiers,
      type,
    };
    const defaultValue = parseVariableInitializer(v.variableInitializer?.());
    if (defaultValue !== undefined) {
      member.defaultValue = defaultValue;
    }
    return member;
  });
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.MethodHeaderContext | null | undefined} header @param {import('./models.js').AnnotationMap} memberAnnotations @param {string[]} memberModifiers @param {string} name @param {'method' | 'constructor'} kind @param {import('./models.js').TypeParameterModel[] | undefined} outerTypeParameters */
function buildCallableMember(header, memberAnnotations, memberModifiers, name, kind, outerTypeParameters) {
  const typeParameters = parseTypeParameters(header?.typeParameters?.()) ?? outerTypeParameters;
  const parameters = parseFormalParameters(header?.methodDeclarator?.()?.formalParameterList?.());
  const throwsTypes = parseThrowsTypes(header?.throws_?.());

  if (kind === 'constructor') {
    /** @type {import('./models.js').ConstructorMemberModel} */
    const model = {
      kind: 'constructor',
      name,
      annotations: memberAnnotations,
      modifiers: memberModifiers,
      parameters,
    };
    if (typeParameters?.length) model.typeParameters = typeParameters;
    if (throwsTypes?.length) model.throwsTypes = throwsTypes;
    return model;
  }

  const declarator = header?.methodDeclarator?.();
  const returnDimensions = countDimensions(declarator?.dims?.());
  /** @type {import('./models.js').MethodMemberModel} */
  const model = {
    kind: 'method',
    name,
    annotations: memberAnnotations,
    modifiers: memberModifiers,
    returnType: parseReturnType(header?.result?.()),
    parameters,
  };
  if (typeParameters?.length) model.typeParameters = typeParameters;
  if (returnDimensions > 0) model.returnDimensions = returnDimensions;
  if (throwsTypes?.length) model.throwsTypes = throwsTypes;
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.MethodDeclarationContext} ctx */
function extractMethod(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.methodModifier?.() ?? []);
  const header = ctx.methodHeader();
  const name = header?.methodDeclarator?.()?.Identifier()?.getText() ?? '';
  return buildCallableMember(header, annotations, modifiers, name, 'method', undefined);
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.InterfaceMethodDeclarationContext} ctx */
function extractInterfaceMethod(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.interfaceMethodModifier?.() ?? []);
  const header = ctx.methodHeader();
  const name = header?.methodDeclarator?.()?.Identifier()?.getText() ?? '';
  return buildCallableMember(header, annotations, modifiers, name, 'method', undefined);
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ConstructorDeclarationContext} ctx */
function extractConstructor(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.constructorModifier?.() ?? []);
  const declarator = ctx.constructorDeclarator();
  const name = declarator?.simpleTypeName()?.Identifier()?.getText() ?? '';
  const typeParameters = parseTypeParameters(ctx.typeParameters?.());
  const parameters = parseFormalParameters(declarator?.formalParameterList?.());
  const throwsTypes = parseThrowsTypes(ctx.throws_?.());

  /** @type {import('./models.js').ConstructorMemberModel} */
  const model = {
    kind: 'constructor',
    name,
    annotations,
    modifiers,
    parameters,
  };
  if (typeParameters?.length) model.typeParameters = typeParameters;
  if (throwsTypes?.length) model.throwsTypes = throwsTypes;
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.EnumConstantContext} ctx */
function extractEnumConstant(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.enumConstantModifier?.() ?? []);
  return /** @type {import('./models.js').EnumConstantMemberModel} */ ({
    kind: 'enumConstant',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    modifiers,
  });
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ConstantDeclarationContext} ctx @returns {import('./models.js').InterfaceConstantMemberModel[]} */
function extractInterfaceConstants(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.constantModifier?.() ?? []);
  const type = parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' };
  const list = ctx.variableDeclaratorList()?.variableDeclarator?.() ?? [];

  return list.map((v) => {
    /** @type {import('./models.js').InterfaceConstantMemberModel} */
    const member = {
      kind: 'interfaceConstant',
      name: v.variableDeclaratorId()?.Identifier()?.getText() ?? '',
      annotations,
      modifiers,
      type,
    };
    const defaultValue = parseVariableInitializer(v.variableInitializer?.());
    if (defaultValue !== undefined) {
      member.defaultValue = defaultValue;
    }
    return member;
  });
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ClassDeclarationContext} classDecl */
function extractFromClassDeclaration(classDecl) {
  if (classDecl.normalClassDeclaration()) {
    return extractNormalClass(classDecl.normalClassDeclaration());
  }
  if (classDecl.enumDeclaration()) {
    return extractEnum(classDecl.enumDeclaration());
  }
  return null;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.NormalClassDeclarationContext} ctx */
function extractNormalClass(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.classModifier?.() ?? []);
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'class',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    modifiers,
    ownMembers: [],
    nestedTypes: [],
  };

  const typeParameters = parseTypeParameters(ctx.typeParameters?.());
  if (typeParameters?.length) model.typeParameters = typeParameters;

  const extendsType = parseExtendsType(ctx.superclass?.());
  if (extendsType) model.extendsType = extendsType;

  const implementsTypes = parseImplementsTypes(ctx.superinterfaces?.());
  if (implementsTypes?.length) model.implementsTypes = implementsTypes;

  fillClassBody(model, ctx.classBody());
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.EnumDeclarationContext} ctx */
function extractEnum(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.classModifier?.() ?? []);
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'enum',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    modifiers,
    ownMembers: [],
    nestedTypes: [],
  };

  const implementsTypes = parseImplementsTypes(ctx.superinterfaces?.());
  if (implementsTypes?.length) model.implementsTypes = implementsTypes;

  const body = ctx.enumBody();
  if (body) {
    const constants = body.enumConstantList()?.enumConstant?.() ?? [];
    for (const c of constants) {
      model.ownMembers.push(extractEnumConstant(c));
    }
    const decls = body.enumBodyDeclarations()?.classBodyDeclaration?.() ?? [];
    for (const decl of decls) {
      processClassBodyDeclaration(model, decl);
    }
  }
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.InterfaceDeclarationContext} ifaceDecl */
function extractFromInterfaceDeclaration(ifaceDecl) {
  if (ifaceDecl.normalInterfaceDeclaration()) {
    return extractNormalInterface(ifaceDecl.normalInterfaceDeclaration());
  }
  if (ifaceDecl.annotationTypeDeclaration()) {
    return extractAnnotationType(ifaceDecl.annotationTypeDeclaration());
  }
  return null;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.NormalInterfaceDeclarationContext} ctx */
function extractNormalInterface(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.interfaceModifier?.() ?? []);
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'interface',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    modifiers,
    ownMembers: [],
    nestedTypes: [],
  };

  const typeParameters = parseTypeParameters(ctx.typeParameters?.());
  if (typeParameters?.length) model.typeParameters = typeParameters;

  const implementsTypes = parseImplementsTypes(ctx.extendsInterfaces?.());
  if (implementsTypes?.length) model.implementsTypes = implementsTypes;

  fillInterfaceBody(model, ctx.interfaceBody());
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.AnnotationTypeDeclarationContext} ctx */
function extractAnnotationType(ctx) {
  const { annotations, modifiers } = splitAnnotationsAndModifiers(ctx.interfaceModifier?.() ?? []);
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'annotation',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    modifiers,
    ownMembers: [],
    nestedTypes: [],
  };

  const body = ctx.annotationTypeBody();
  const members = body?.annotationTypeMemberDeclaration?.() ?? [];
  for (const m of members) {
    if (m.constantDeclaration()) {
      model.ownMembers.push(...extractInterfaceConstants(m.constantDeclaration()));
    }
    if (m.annotationTypeElementDeclaration()) {
      model.ownMembers.push(extractAnnotationElement(m.annotationTypeElementDeclaration()));
    }
    if (m.classDeclaration()) {
      const nested = extractFromClassDeclaration(m.classDeclaration());
      if (nested) model.nestedTypes.push(nested);
    }
    if (m.interfaceDeclaration()) {
      const nested = extractFromInterfaceDeclaration(m.interfaceDeclaration());
      if (nested) model.nestedTypes.push(nested);
    }
  }
  return model;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.AnnotationTypeElementDeclarationContext} ctx */
function extractAnnotationElement(ctx) {
  const { annotations } = splitAnnotationsAndModifiers(ctx.annotationTypeElementModifier?.() ?? []);
  /** @type {import('./models.js').AnnotationElementMemberModel} */
  const model = {
    kind: 'annotationElement',
    name: ctx.Identifier()?.getText() ?? '',
    annotations,
    type: parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' },
  };

  const defaultValue = parseElementValue(ctx.defaultValue?.()?.elementValue?.());
  if (defaultValue !== undefined) {
    model.defaultValue = defaultValue;
  }
  return model;
}

/** @param {import('./models.js').TypeModel} model @param {import('../../grammars/java8/Java8Parser.js').default.ClassBodyContext | null | undefined} body */
function fillClassBody(model, body) {
  if (!body) return;
  const decls = body.classBodyDeclaration?.() ?? [];
  for (const decl of decls) {
    processClassBodyDeclaration(model, decl);
  }
}

/** @param {import('./models.js').TypeModel} model @param {import('../../grammars/java8/Java8Parser.js').default.ClassBodyDeclarationContext} decl */
function processClassBodyDeclaration(model, decl) {
  if (decl.constructorDeclaration()) {
    model.ownMembers.push(extractConstructor(decl.constructorDeclaration()));
    return;
  }
  const member = decl.classMemberDeclaration?.();
  if (!member) return;
  if (member.fieldDeclaration()) {
    model.ownMembers.push(...extractFields(member.fieldDeclaration()));
  } else if (member.methodDeclaration()) {
    model.ownMembers.push(extractMethod(member.methodDeclaration()));
  } else if (member.classDeclaration()) {
    const nested = extractFromClassDeclaration(member.classDeclaration());
    if (nested) model.nestedTypes.push(nested);
  } else if (member.interfaceDeclaration()) {
    const nested = extractFromInterfaceDeclaration(member.interfaceDeclaration());
    if (nested) model.nestedTypes.push(nested);
  }
}

/** @param {import('./models.js').TypeModel} model @param {import('../../grammars/java8/Java8Parser.js').default.InterfaceBodyContext | null | undefined} body */
function fillInterfaceBody(model, body) {
  if (!body) return;
  const decls = body.interfaceMemberDeclaration?.() ?? [];
  for (const decl of decls) {
    if (decl.constantDeclaration()) {
      model.ownMembers.push(...extractInterfaceConstants(decl.constantDeclaration()));
    } else if (decl.interfaceMethodDeclaration()) {
      model.ownMembers.push(extractInterfaceMethod(decl.interfaceMethodDeclaration()));
    } else if (decl.classDeclaration()) {
      const nested = extractFromClassDeclaration(decl.classDeclaration());
      if (nested) model.nestedTypes.push(nested);
    } else if (decl.interfaceDeclaration()) {
      const nested = extractFromInterfaceDeclaration(decl.interfaceDeclaration());
      if (nested) model.nestedTypes.push(nested);
    }
  }
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.CompilationUnitContext} ctx */
export function extractFileModel(ctx) {
  /** @type {import('./models.js').FileModel} */
  const file = { types: [] };
  const decls = ctx.typeDeclaration?.() ?? [];
  for (const decl of decls) {
    if (decl.classDeclaration()) {
      const t = extractFromClassDeclaration(decl.classDeclaration());
      if (t) file.types.push(t);
    } else if (decl.interfaceDeclaration()) {
      const t = extractFromInterfaceDeclaration(decl.interfaceDeclaration());
      if (t) file.types.push(t);
    }
  }
  return file;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.CompilationUnitContext} ctx */
export function extractFirstClassName(ctx) {
  const decls = ctx.typeDeclaration?.() ?? [];
  for (const decl of decls) {
    if (decl.classDeclaration()) {
      const normal = decl.classDeclaration().normalClassDeclaration();
      if (normal?.Identifier()) return normal.Identifier().getText();
      const en = decl.classDeclaration().enumDeclaration();
      if (en?.Identifier()) return en.Identifier().getText();
    }
    if (decl.interfaceDeclaration()) {
      const normal = decl.interfaceDeclaration().normalInterfaceDeclaration();
      if (normal?.Identifier()) return normal.Identifier().getText();
      const ann = decl.interfaceDeclaration().annotationTypeDeclaration();
      if (ann?.Identifier()) return ann.Identifier().getText();
    }
  }
  return null;
}

export { Java8Parser };
