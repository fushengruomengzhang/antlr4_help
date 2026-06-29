import Java8Parser from './Java8Parser.js';

/** @param {import('antlr4').ParserRuleContext[]} modifierCtxs */
function extractModifiers(modifierCtxs) {
  if (!modifierCtxs || modifierCtxs.length === 0) return [];
  return modifierCtxs.map((m) => m.getText()).filter(Boolean);
}

/** @param {import('antlr4').ParserRuleContext | null | undefined} ctx */
function ctxText(ctx) {
  if (!ctx) return undefined;
  return ctx.getText();
}

/** @param {import('./Java8Parser.js').default.SuperclassContext | null | undefined} ctx */
function extractExtends(ctx) {
  if (!ctx) return undefined;
  const text = ctx.getText();
  return text.replace(/^extends\s*/, '') || undefined;
}

/** @param {import('./Java8Parser.js').default.SuperinterfacesContext | null | undefined} ctx */
function extractImplements(ctx) {
  if (!ctx) return undefined;
  const text = ctx.getText().replace(/^implements\s*/, '');
  if (!text) return undefined;
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

/** @param {import('./Java8Parser.js').default.ExtendsInterfacesContext | null | undefined} ctx */
function extractInterfaceExtends(ctx) {
  if (!ctx) return undefined;
  const text = ctx.getText().replace(/^extends\s*/, '');
  if (!text) return undefined;
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

/** @param {import('./Java8Parser.js').default.FieldDeclarationContext} ctx */
function extractField(ctx) {
  const type = ctx.unannType()?.getText() ?? '';
  const modifiers = extractModifiers(ctx.fieldModifier?.() ?? []);
  const list = ctx.variableDeclaratorList()?.variableDeclarator?.() ?? [];
  const names = list.map((v) => v.variableDeclaratorId()?.getText() ?? '');
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'field',
    type,
    names,
    modifiers,
    signature: ctx.getText().replace(/;+$/, ''),
  });
}

/** @param {import('./Java8Parser.js').default.MethodDeclarationContext} ctx */
function extractMethod(ctx) {
  const header = ctx.methodHeader();
  const modifiers = extractModifiers(ctx.methodModifier?.() ?? []);
  const declarator = header?.methodDeclarator();
  const name = declarator?.Identifier()?.getText();
  const returnType = header?.result()?.getText();
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'method',
    name,
    returnType,
    params: declarator?.getText()?.match(/\(.*\)/)?.[0],
    modifiers,
    throws: ctxText(header?.throws_?.()),
    signature: `${modifiers.join(' ')} ${header?.getText() ?? ''}`.trim(),
  });
}

/** @param {import('./Java8Parser.js').default.InterfaceMethodDeclarationContext} ctx */
function extractInterfaceMethod(ctx) {
  const header = ctx.methodHeader();
  const modifiers = extractModifiers(ctx.interfaceMethodModifier?.() ?? []);
  const declarator = header?.methodDeclarator();
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'method',
    name: declarator?.Identifier()?.getText(),
    returnType: header?.result()?.getText(),
    params: declarator?.getText()?.match(/\(.*\)/)?.[0],
    modifiers,
    signature: `${modifiers.join(' ')} ${header?.getText() ?? ''}`.trim(),
  });
}

/** @param {import('./Java8Parser.js').default.ConstructorDeclarationContext} ctx */
function extractConstructor(ctx) {
  const declarator = ctx.constructorDeclarator();
  const modifiers = extractModifiers(ctx.constructorModifier?.() ?? []);
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'constructor',
    name: declarator?.simpleTypeName()?.Identifier()?.getText(),
    params: declarator?.getText()?.match(/\(.*\)/)?.[0],
    modifiers,
    throws: ctxText(ctx.throws_?.()),
    signature: `${modifiers.join(' ')} ${declarator?.getText() ?? ''}`.trim(),
  });
}

/** @param {import('./Java8Parser.js').default.EnumConstantContext} ctx */
function extractEnumConstant(ctx) {
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'enumConstant',
    name: ctx.Identifier()?.getText(),
    modifiers: [],
    signature: ctx.getText().split('{')[0],
  });
}

/** @param {import('./Java8Parser.js').default.ConstantDeclarationContext} ctx */
function extractInterfaceConstant(ctx) {
  const type = ctx.unannType()?.getText() ?? '';
  const modifiers = extractModifiers(ctx.constantModifier?.() ?? []);
  const names = ctx.variableDeclaratorList()?.variableDeclarator?.().map((v) => v.variableDeclaratorId()?.getText() ?? '') ?? [];
  return /** @type {import('./models.js').MemberModel} */ ({
    kind: 'interfaceConstant',
    type,
    names,
    modifiers,
    signature: ctx.getText().replace(/;+$/, ''),
  });
}

/** @param {import('./Java8Parser.js').default.ClassDeclarationContext} classDecl */
function extractFromClassDeclaration(classDecl) {
  if (classDecl.normalClassDeclaration()) {
    return extractNormalClass(classDecl.normalClassDeclaration());
  }
  if (classDecl.enumDeclaration()) {
    return extractEnum(classDecl.enumDeclaration());
  }
  return null;
}

/** @param {import('./Java8Parser.js').default.NormalClassDeclarationContext} ctx */
function extractNormalClass(ctx) {
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'class',
    name: ctx.Identifier()?.getText() ?? '',
    modifiers: extractModifiers(ctx.classModifier?.() ?? []),
    typeParameters: ctxText(ctx.typeParameters()),
    extends: extractExtends(ctx.superclass()),
    implements: extractImplements(ctx.superinterfaces()),
    ownMembers: [],
    nestedTypes: [],
  };
  fillClassBody(model, ctx.classBody());
  return model;
}

/** @param {import('./Java8Parser.js').default.EnumDeclarationContext} ctx */
function extractEnum(ctx) {
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'enum',
    name: ctx.Identifier()?.getText() ?? '',
    modifiers: extractModifiers(ctx.classModifier?.() ?? []),
    implements: extractImplements(ctx.superinterfaces()),
    ownMembers: [],
    nestedTypes: [],
  };
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

/** @param {import('./Java8Parser.js').default.InterfaceDeclarationContext} ifaceDecl */
function extractFromInterfaceDeclaration(ifaceDecl) {
  if (ifaceDecl.normalInterfaceDeclaration()) {
    return extractNormalInterface(ifaceDecl.normalInterfaceDeclaration());
  }
  if (ifaceDecl.annotationTypeDeclaration()) {
    return extractAnnotationType(ifaceDecl.annotationTypeDeclaration());
  }
  return null;
}

/** @param {import('./Java8Parser.js').default.NormalInterfaceDeclarationContext} ctx */
function extractNormalInterface(ctx) {
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'interface',
    name: ctx.Identifier()?.getText() ?? '',
    modifiers: extractModifiers(ctx.interfaceModifier?.() ?? []),
    typeParameters: ctxText(ctx.typeParameters()),
    extends: undefined,
    implements: extractInterfaceExtends(ctx.extendsInterfaces()),
    ownMembers: [],
    nestedTypes: [],
  };
  fillInterfaceBody(model, ctx.interfaceBody());
  return model;
}

/** @param {import('./Java8Parser.js').default.AnnotationTypeDeclarationContext} ctx */
function extractAnnotationType(ctx) {
  /** @type {import('./models.js').TypeModel} */
  const model = {
    kind: 'annotation',
    name: ctx.Identifier()?.getText() ?? '',
    modifiers: extractModifiers(ctx.interfaceModifier?.() ?? []),
    ownMembers: [],
    nestedTypes: [],
  };
  const body = ctx.annotationTypeBody();
  const members = body?.annotationTypeMemberDeclaration?.() ?? [];
  for (const m of members) {
    if (m.constantDeclaration()) {
      model.ownMembers.push(extractInterfaceConstant(m.constantDeclaration()));
    }
    if (m.annotationTypeElementDeclaration()) {
      const el = m.annotationTypeElementDeclaration();
      model.ownMembers.push({
        kind: 'annotationElement',
        name: el.Identifier()?.getText(),
        type: el.unannType()?.getText(),
        modifiers: [],
        signature: el.getText().replace(/;+$/, ''),
      });
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

/** @param {import('./models.js').TypeModel} model @param {import('./Java8Parser.js').default.ClassBodyContext | null | undefined} body */
function fillClassBody(model, body) {
  if (!body) return;
  const decls = body.classBodyDeclaration?.() ?? [];
  for (const decl of decls) {
    processClassBodyDeclaration(model, decl);
  }
}

/** @param {import('./models.js').TypeModel} model @param {import('./Java8Parser.js').default.ClassBodyDeclarationContext} decl */
function processClassBodyDeclaration(model, decl) {
  if (decl.constructorDeclaration()) {
    model.ownMembers.push(extractConstructor(decl.constructorDeclaration()));
    return;
  }
  const member = decl.classMemberDeclaration?.();
  if (!member) return;
  if (member.fieldDeclaration()) {
    model.ownMembers.push(extractField(member.fieldDeclaration()));
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

/** @param {import('./models.js').TypeModel} model @param {import('./Java8Parser.js').default.InterfaceBodyContext | null | undefined} body */
function fillInterfaceBody(model, body) {
  if (!body) return;
  const decls = body.interfaceMemberDeclaration?.() ?? [];
  for (const decl of decls) {
    if (decl.constantDeclaration()) {
      model.ownMembers.push(extractInterfaceConstant(decl.constantDeclaration()));
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

/** @param {import('./Java8Parser.js').default.CompilationUnitContext} ctx */
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

/** @param {import('./Java8Parser.js').default.CompilationUnitContext} ctx */
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
