import antlr4 from 'antlr4';
import Java8Parser from '../../grammars/java8/Java8Parser.js';

/** @param {import('antlr4').ParserRuleContext} node */
function isBlockedAnnotationExpression(node) {
  return (
    node instanceof Java8Parser.MethodInvocationContext ||
    node instanceof Java8Parser.MethodInvocation_lf_primaryContext ||
    node instanceof Java8Parser.MethodInvocation_lfno_primaryContext ||
    node instanceof Java8Parser.ClassInstanceCreationExpressionContext ||
    node instanceof Java8Parser.ClassInstanceCreationExpression_lf_primaryContext ||
    node instanceof Java8Parser.ClassInstanceCreationExpression_lfno_primaryContext ||
    node instanceof Java8Parser.LambdaExpressionContext ||
    (node instanceof Java8Parser.ConditionalExpressionContext && !!node.QUESTION?.())
  );
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.TypeNameContext | null | undefined} ctx */
export function typeNameSimpleName(ctx) {
  if (!ctx) return '';
  const id = ctx.Identifier();
  if (id) return id.getText();
  return ctx.getText().split('.').pop() ?? '';
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.AnnotationContext} ctx @returns {[string, import('./models.js').AnnotationAttrs]} */
export function extractAnnotationPair(ctx) {
  const normal = ctx.normalAnnotation?.();
  if (normal) {
    const [name, attrs] = extractNormalAnnotationPair(normal);
    return [name, attrs];
  }

  const marker = ctx.markerAnnotation?.();
  if (marker) {
    return [typeNameSimpleName(marker.typeName()), {}];
  }

  const single = ctx.singleElementAnnotation?.();
  if (single) {
    const name = typeNameSimpleName(single.typeName());
    /** @type {import('./models.js').AnnotationAttrs} */
    const attrs = {};
    const value = parseElementValue(single.elementValue());
    if (value !== undefined) {
      attrs.value = value;
    }
    return [name, attrs];
  }

  return ['', {}];
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.NormalAnnotationContext} ctx @returns {[string, import('./models.js').AnnotationAttrs]} */
function extractNormalAnnotationPair(ctx) {
  /** @type {import('./models.js').AnnotationAttrs} */
  const attrs = {};
  const pairs = ctx.elementValuePairList()?.elementValuePair?.() ?? [];
  for (const pair of pairs) {
    const key = pair.Identifier()?.getText();
    if (!key) continue;
    const value = parseElementValue(pair.elementValue());
    if (value !== undefined) {
      attrs[key] = value;
    }
  }
  return [typeNameSimpleName(ctx.typeName()), attrs];
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.AnnotationContext[]} annotationCtxs @returns {import('./models.js').AnnotationMap} */
export function buildAnnotationMapFromAnnotations(annotationCtxs) {
  /** @type {import('./models.js').AnnotationMap} */
  const map = {};
  for (const ann of annotationCtxs ?? []) {
    const [name, attrs] = extractAnnotationPair(ann);
    if (name) map[name] = attrs;
  }
  return map;
}

/** @param {import('antlr4').ParserRuleContext[]} modifierCtxs @returns {import('./models.js').AnnotationMap} */
export function buildAnnotationMap(modifierCtxs) {
  /** @type {import('./models.js').AnnotationMap} */
  const map = {};
  for (const m of modifierCtxs ?? []) {
    const ann = m.annotation?.();
    if (!ann) continue;
    const [name, attrs] = extractAnnotationPair(ann);
    if (name) map[name] = attrs;
  }
  return map;
}

/** @param {import('antlr4').ParserRuleContext[]} modifierCtxs */
export function splitAnnotationsAndModifiers(modifierCtxs) {
  /** @type {string[]} */
  const modifiers = [];

  for (const m of modifierCtxs ?? []) {
    if (m.annotation?.()) continue;
    const text = m.getText();
    if (text) modifiers.push(text);
  }

  return {
    annotations: buildAnnotationMap(modifierCtxs),
    modifiers,
  };
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ElementValueContext | null | undefined} ctx @returns {import('./models.js').AnnotationValue | undefined} */
export function parseElementValue(ctx) {
  if (!ctx) return undefined;

  const nested = ctx.annotation?.();
  if (nested) {
    const [name, attrs] = extractAnnotationPair(nested);
    if (!name) return undefined;
    return { [name]: attrs };
  }

  const arrayInit = ctx.elementValueArrayInitializer?.();
  if (arrayInit) return parseElementValueArray(arrayInit);

  const expr = ctx.conditionalExpression?.();
  if (expr) return findLiteralInExpression(expr);

  return undefined;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ElementValueArrayInitializerContext} ctx */
function parseElementValueArray(ctx) {
  const values = ctx.elementValueList()?.elementValue?.() ?? [];
  /** @type {import('./models.js').AnnotationValue[]} */
  const result = [];
  for (const valueCtx of values) {
    const value = parseElementValue(valueCtx);
    if (value !== undefined) {
      result.push(value);
    }
  }
  return result;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.VariableInitializerContext | null | undefined} ctx @returns {import('./models.js').AnnotationValue | undefined} */
export function parseVariableInitializer(ctx) {
  if (!ctx) return undefined;

  const arrayInit = ctx.arrayInitializer?.();
  if (arrayInit) return parseArrayInitializer(arrayInit);

  const expr = ctx.expression?.();
  if (expr) return findLiteralInExpression(expr);

  return undefined;
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.ArrayInitializerContext} ctx */
function parseArrayInitializer(ctx) {
  const inits = ctx.variableInitializerList()?.variableInitializer?.() ?? [];
  /** @type {import('./models.js').AnnotationValue[]} */
  const result = [];
  for (const init of inits) {
    const value = parseVariableInitializer(init);
    if (value !== undefined) {
      result.push(value);
    }
  }
  return result;
}

/** @param {import('antlr4').ParserRuleContext} ctx @returns {import('./models.js').AnnotationValue | undefined} */
function findLiteralInExpression(ctx) {
  /** @type {import('../../grammars/java8/Java8Parser.js').default.LiteralContext | null} */
  let literal = null;
  let blocked = false;

  /** @param {import('antlr4').ParserRuleContext} node */
  function walk(node) {
    if (!node || blocked) return;
    if (isBlockedAnnotationExpression(node)) {
      blocked = true;
      return;
    }
    if (node instanceof Java8Parser.LiteralContext) {
      literal = node;
      return;
    }
    for (let i = 0; i < node.getChildCount(); i++) {
      const child = node.getChild(i);
      if (child instanceof antlr4.ParserRuleContext) {
        walk(child);
      }
    }
  }

  walk(ctx);
  if (blocked || !literal) return undefined;
  return parseLiteral(literal);
}

/** @param {import('../../grammars/java8/Java8Parser.js').default.LiteralContext} ctx @returns {import('./models.js').AnnotationValue | undefined} */
function parseLiteral(ctx) {
  const str = ctx.StringLiteral?.();
  if (str) {
    const text = str.getText();
    try {
      return JSON.parse(text.replace(/\\'/g, "'"));
    } catch {
      return text.slice(1, -1);
    }
  }

  const bool = ctx.BooleanLiteral?.();
  if (bool) return bool.getText() === 'true';

  const integer = ctx.IntegerLiteral?.();
  if (integer) {
    const text = integer.getText().replace(/_/g, '');
    if (/^[0-9]+L$/.test(text)) return Number(text.slice(0, -1));
    if (/^0[xX]/.test(text)) return parseInt(text, 16);
    return Number(text);
  }

  const floating = ctx.FloatingPointLiteral?.();
  if (floating) {
    const text = floating.getText().replace(/_/g, '').replace(/[fFdD]$/, '');
    return Number(text);
  }

  const ch = ctx.CharacterLiteral?.();
  if (ch) return ch.getText().slice(1, -1);

  const nil = ctx.NullLiteral?.();
  if (nil) return null;

  return undefined;
}
