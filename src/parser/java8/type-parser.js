import { buildAnnotationMap, buildAnnotationMapFromAnnotations, extractAnnotationPair } from './annotation-parser.js';

/** @param {import('./Java8Parser.js').default.DimsContext | null | undefined} ctx */
function countDimensions(ctx) {
  if (!ctx) return 0;
  return ctx.LBRACK?.()?.length ?? 0;
}

/** @param {import('./Java8Parser.js').default.UnannTypeContext | null | undefined} @returns {import('./models.js').TypeSignature | undefined} */
export function parseTypeSignature(ctx) {
  if (!ctx) return undefined;

  const primitive = ctx.unannPrimitiveType?.();
  if (primitive) {
    return { kind: 'primitive', name: primitive.getText() };
  }

  const ref = ctx.unannReferenceType?.();
  if (ref) return parseUnannReferenceType(ref);

  return undefined;
}

/** @param {import('./Java8Parser.js').default.UnannReferenceTypeContext} ctx @returns {import('./models.js').TypeSignature | undefined} */
function parseUnannReferenceType(ctx) {
  const classType = ctx.unannClassOrInterfaceType?.();
  if (classType) return parseUnannClassOrInterfaceType(classType);

  const typeVar = ctx.unannTypeVariable?.();
  if (typeVar) {
    return { kind: 'typeVariable', name: typeVar.Identifier()?.getText() ?? '' };
  }

  const arrayType = ctx.unannArrayType?.();
  if (arrayType) {
    const dims = countDimensions(arrayType.dims?.());
    const innerPrimitive = arrayType.unannPrimitiveType?.();
    if (innerPrimitive) {
      return {
        kind: 'array',
        elementType: { kind: 'primitive', name: innerPrimitive.getText() },
        dimensions: dims,
      };
    }
    const innerClass = arrayType.unannClassOrInterfaceType?.();
    if (innerClass) {
      const elementType = parseUnannClassOrInterfaceType(innerClass);
      if (elementType) {
        return { kind: 'array', elementType, dimensions: dims };
      }
    }
    const innerVar = arrayType.unannTypeVariable?.();
    if (innerVar) {
      return {
        kind: 'array',
        elementType: { kind: 'typeVariable', name: innerVar.Identifier()?.getText() ?? '' },
        dimensions: dims,
      };
    }
  }

  return undefined;
}

/** @param {import('./Java8Parser.js').default.UnannClassOrInterfaceTypeContext} ctx @returns {import('./models.js').ClassTypeSignature | undefined} */
function parseUnannClassOrInterfaceType(ctx) {
  const lfno =
    ctx.unannClassType_lfno_unannClassOrInterfaceType?.() ??
    ctx.unannInterfaceType_lfno_unannClassOrInterfaceType?.();
  const lfList =
    ctx.unannClassType_lf_unannClassOrInterfaceType?.() ??
    ctx.unannInterfaceType_lf_unannClassOrInterfaceType?.() ??
    [];

  if (!lfno) return undefined;

  let name = lfno.Identifier()?.getText() ?? '';
  let typeArguments = parseTypeArguments(lfno.typeArguments?.());

  for (const lf of lfList) {
    const segment =
      lf.unannClassType_lf_unannClassOrInterfaceType?.() ??
      lf.unannInterfaceType_lf_unannClassOrInterfaceType?.();
    if (!segment) continue;
    name = segment.Identifier()?.getText() ?? name;
    typeArguments = parseTypeArguments(segment.typeArguments?.());
  }

  /** @type {import('./models.js').ClassTypeSignature} */
  const result = { kind: 'class', name };
  if (typeArguments?.length) {
    result.typeArguments = typeArguments;
  }
  return result;
}

/** @param {import('./Java8Parser.js').default.ClassOrInterfaceTypeContext} ctx @returns {import('./models.js').ClassTypeSignature | undefined} */
function parseClassOrInterfaceType(ctx) {
  const lfno =
    ctx.classType_lfno_classOrInterfaceType?.() ?? ctx.interfaceType_lfno_classOrInterfaceType?.();
  const lfList =
    ctx.classType_lf_classOrInterfaceType?.() ?? ctx.interfaceType_lf_classOrInterfaceType?.() ?? [];

  if (!lfno) return undefined;

  let name = lfno.Identifier()?.getText() ?? '';
  let typeArguments = parseTypeArguments(lfno.typeArguments?.());

  for (const lf of lfList) {
    name = lf.Identifier()?.getText() ?? name;
    typeArguments = parseTypeArguments(lf.typeArguments?.());
  }

  /** @type {import('./models.js').ClassTypeSignature} */
  const result = { kind: 'class', name };
  if (typeArguments?.length) {
    result.typeArguments = typeArguments;
  }
  return result;
}

/** @param {import('./Java8Parser.js').default.ClassTypeContext} ctx @returns {import('./models.js').ClassTypeSignature | undefined} */
function parseClassType(ctx) {
  if (!ctx) return undefined;

  if (ctx.classOrInterfaceType?.()) {
    const parent = parseClassOrInterfaceType(ctx.classOrInterfaceType());
    const name = ctx.Identifier()?.getText() ?? parent?.name ?? '';
    const typeArguments = parseTypeArguments(ctx.typeArguments?.());
    /** @type {import('./models.js').ClassTypeSignature} */
    const result = { kind: 'class', name };
    if (typeArguments?.length) {
      result.typeArguments = typeArguments;
    } else if (parent?.typeArguments?.length) {
      result.typeArguments = parent.typeArguments;
    }
    return result;
  }

  /** @type {import('./models.js').ClassTypeSignature} */
  const result = {
    kind: 'class',
    name: ctx.Identifier()?.getText() ?? '',
  };
  const typeArguments = parseTypeArguments(ctx.typeArguments?.());
  if (typeArguments?.length) {
    result.typeArguments = typeArguments;
  }
  return result;
}

/** @param {import('./Java8Parser.js').default.ReferenceTypeContext} ctx @returns {import('./models.js').TypeSignature | undefined} */
function parseReferenceType(ctx) {
  if (!ctx) return undefined;

  const classType = ctx.classOrInterfaceType?.();
  if (classType) return parseClassOrInterfaceType(classType);

  const typeVar = ctx.typeVariable?.();
  if (typeVar) {
    return { kind: 'typeVariable', name: typeVar.Identifier()?.getText() ?? '' };
  }

  const arrayType = ctx.arrayType?.();
  if (arrayType) {
    const dims = countDimensions(arrayType.dims?.());
    const innerRef = arrayType.primitiveType?.() ?? arrayType.classOrInterfaceType?.() ?? arrayType.typeVariable?.();
    if (arrayType.primitiveType?.()) {
      return {
        kind: 'array',
        elementType: { kind: 'primitive', name: arrayType.primitiveType().getText() },
        dimensions: dims,
      };
    }
    if (arrayType.classOrInterfaceType?.()) {
      const elementType = parseClassOrInterfaceType(arrayType.classOrInterfaceType());
      if (elementType) return { kind: 'array', elementType, dimensions: dims };
    }
    if (arrayType.typeVariable?.()) {
      return {
        kind: 'array',
        elementType: { kind: 'typeVariable', name: arrayType.typeVariable().Identifier()?.getText() ?? '' },
        dimensions: dims,
      };
    }
    void innerRef;
  }

  return undefined;
}

/** @param {import('./Java8Parser.js').default.TypeArgumentsContext | null | undefined} @returns {import('./models.js').TypeSignature[] | undefined} */
function parseTypeArguments(ctx) {
  if (!ctx) return undefined;
  const args = ctx.typeArgumentList?.()?.typeArgument?.() ?? [];
  if (!args.length) return undefined;

  /** @type {import('./models.js').TypeSignature[]} */
  const result = [];
  for (const arg of args) {
    const parsed = parseTypeArgument(arg);
    if (parsed) result.push(parsed);
  }
  return result.length ? result : undefined;
}

/** @param {import('./Java8Parser.js').default.TypeArgumentContext} ctx @returns {import('./models.js').TypeSignature | undefined} */
function parseTypeArgument(ctx) {
  const wildcard = ctx.wildcard?.();
  if (wildcard) return parseWildcard(wildcard);

  const ref = ctx.referenceType?.();
  if (ref) return parseReferenceType(ref);

  return undefined;
}

/** @param {import('./Java8Parser.js').default.WildcardContext} ctx @returns {import('./models.js').WildcardTypeSignature} */
function parseWildcard(ctx) {
  /** @type {import('./models.js').WildcardTypeSignature} */
  const result = { kind: 'wildcard' };
  const bounds = ctx.wildcardBounds?.();
  if (!bounds) return result;

  const ref = bounds.referenceType?.();
  if (!ref) return result;

  const type = parseReferenceType(ref);
  if (!type) return result;

  if (bounds.EXTENDS?.()) {
    result.bound = { kind: 'extends', type };
  } else if (bounds.SUPER?.()) {
    result.bound = { kind: 'super', type };
  }
  return result;
}

/** @param {import('./Java8Parser.js').default.TypeParametersContext | null | undefined} @returns {import('./models.js').TypeParameterModel[] | undefined} */
export function parseTypeParameters(ctx) {
  if (!ctx) return undefined;
  const params = ctx.typeParameterList?.()?.typeParameter?.() ?? [];
  if (!params.length) return undefined;
  return params.map(parseTypeParameter).filter(Boolean);
}

/** @param {import('./Java8Parser.js').default.TypeParameterContext} ctx @returns {import('./models.js').TypeParameterModel} */
export function parseTypeParameter(ctx) {
  /** @type {import('./models.js').TypeParameterModel} */
  const model = {
    name: ctx.Identifier()?.getText() ?? '',
  };

  const modifiers = ctx.typeParameterModifier?.() ?? [];
  if (modifiers.length) {
    const annotations = buildAnnotationMap(modifiers);
    if (Object.keys(annotations).length) {
      model.annotations = annotations;
    }
  }

  const bound = ctx.typeBound?.();
  if (bound) {
    const parsedBound = parseTypeBound(bound);
    if (parsedBound) {
      model.bound = parsedBound;
    }
  }

  return model;
}

/** @param {import('./Java8Parser.js').default.TypeParameterModifierContext[]} modifiers @returns {import('./models.js').AnnotationMap} */
export function parseTypeParameterAnnotations(modifiers) {
  return buildAnnotationMap(modifiers);
}

/** @param {import('./Java8Parser.js').default.TypeBoundContext} ctx @returns {import('./models.js').TypeParameterBound | undefined} */
function parseTypeBound(ctx) {
  const typeVar = ctx.typeVariable?.();
  if (typeVar) {
    return {
      extends: { kind: 'typeVariable', name: typeVar.Identifier()?.getText() ?? '' },
    };
  }

  const classType = ctx.classOrInterfaceType?.();
  if (classType) {
    const extendsType = parseClassOrInterfaceType(classType);
    if (!extendsType) return undefined;

    /** @type {import('./models.js').TypeParameterBound} */
    const bound = { extends: extendsType };
    const additional = ctx.additionalBound?.() ?? [];
    if (additional.length) {
      bound.additional = additional
        .map((ab) => parseClassType(ab.interfaceType?.()?.classType?.()))
        .filter((t) => t !== undefined);
      if (!bound.additional.length) {
        delete bound.additional;
      }
    }
    return bound;
  }

  return undefined;
}

/** @param {import('./Java8Parser.js').default.SuperclassContext | null | undefined} @returns {import('./models.js').TypeSignature | undefined} */
export function parseExtendsType(ctx) {
  if (!ctx) return undefined;
  return parseClassType(ctx.classType?.());
}

/** @param {import('./Java8Parser.js').default.SuperinterfacesContext | import('./Java8Parser.js').default.ExtendsInterfacesContext | null | undefined} @returns {import('./models.js').TypeSignature[] | undefined} */
export function parseImplementsTypes(ctx) {
  if (!ctx) return undefined;
  const list = ctx.interfaceTypeList?.()?.interfaceType?.() ?? [];
  if (!list.length) return undefined;

  /** @type {import('./models.js').TypeSignature[]} */
  const result = [];
  for (const iface of list) {
    const parsed = parseClassType(iface.classType?.());
    if (parsed) result.push(parsed);
  }
  return result.length ? result : undefined;
}

/** @param {import('./Java8Parser.js').default.Throws_Context | null | undefined} @returns {import('./models.js').TypeSignature[] | undefined} */
export function parseThrowsTypes(ctx) {
  if (!ctx) return undefined;
  const types = ctx.exceptionTypeList?.()?.exceptionType?.() ?? [];
  if (!types.length) return undefined;

  /** @type {import('./models.js').TypeSignature[]} */
  const result = [];
  for (const t of types) {
    const classType = t.classType?.();
    if (classType) {
      const parsed = parseClassType(classType);
      if (parsed) result.push(parsed);
      continue;
    }
    const typeVar = t.typeVariable?.();
    if (typeVar) {
      result.push({ kind: 'typeVariable', name: typeVar.Identifier()?.getText() ?? '' });
    }
  }
  return result.length ? result : undefined;
}

/** @param {import('./Java8Parser.js').default.FormalParameterListContext | null | undefined} @returns {import('./models.js').ParameterModel[]} */
export function parseFormalParameters(ctx) {
  if (!ctx) return [];

  /** @type {import('./models.js').ParameterModel[]} */
  const parameters = [];

  const receiver = ctx.receiverParameter?.();
  if (receiver) {
    parameters.push(parseReceiverParameter(receiver));
  }

  const formalParams = ctx.formalParameters?.();
  if (formalParams) {
    for (const param of formalParams.formalParameter?.() ?? []) {
      parameters.push(parseFormalParameter(param));
    }
  }

  const last = ctx.lastFormalParameter?.();
  if (last) {
    if (last.formalParameter?.()) {
      parameters.push(parseFormalParameter(last.formalParameter()));
    } else {
      parameters.push(parseVarargsParameter(last));
    }
  }

  return parameters;
}

/** @param {import('./Java8Parser.js').default.ReceiverParameterContext} ctx */
function parseReceiverParameter(ctx) {
  const { annotations, modifiers } = splitParameterAnnotations(ctx.annotation?.() ?? []);
  return {
    name: 'this',
    type: parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' },
    annotations,
    modifiers,
  };
}

/** @param {import('./Java8Parser.js').default.FormalParameterContext} ctx */
function parseFormalParameter(ctx) {
  const { annotations, modifiers } = splitVariableModifiers(ctx.variableModifier?.() ?? []);
  return {
    name: ctx.variableDeclaratorId()?.Identifier()?.getText() ?? '',
    type: parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' },
    annotations,
    modifiers,
  };
}

/** @param {import('./Java8Parser.js').default.LastFormalParameterContext} ctx */
function parseVarargsParameter(ctx) {
  const { annotations, modifiers } = splitVariableModifiers(ctx.variableModifier?.() ?? []);
  for (const ann of ctx.annotation?.() ?? []) {
    const [name, attrs] = extractAnnotationPair(ann);
    if (name) annotations[name] = attrs;
  }
  return {
    name: ctx.variableDeclaratorId()?.Identifier()?.getText() ?? '',
    type: parseTypeSignature(ctx.unannType?.()) ?? { kind: 'primitive', name: 'void' },
    annotations,
    modifiers,
    varargs: true,
  };
}

/** @param {import('./Java8Parser.js').default.AnnotationContext[]} annotationCtxs */
function splitParameterAnnotations(annotationCtxs) {
  return { annotations: buildAnnotationMapFromAnnotations(annotationCtxs), modifiers: [] };
}

/** @param {import('./Java8Parser.js').default.VariableModifierContext[]} modifierCtxs */
function splitVariableModifiers(modifierCtxs) {
  /** @type {string[]} */
  const modifiers = [];
  for (const m of modifierCtxs ?? []) {
    if (m.annotation?.()) continue;
    if (m.FINAL?.()) modifiers.push('final');
  }
  return { annotations: buildAnnotationMap(modifierCtxs), modifiers };
}

/** @param {import('./Java8Parser.js').default.ResultContext | null | undefined} @returns {import('./models.js').TypeSignature} */
export function parseReturnType(ctx) {
  if (!ctx) return { kind: 'void' };
  if (ctx.VOID?.()) return { kind: 'void' };
  return parseTypeSignature(ctx.unannType?.()) ?? { kind: 'void' };
}
