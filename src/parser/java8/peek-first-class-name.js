import antlr4 from 'antlr4';
import Java8Lexer from '../../grammars/java8/Java8Lexer.js';
import Java8Parser from '../../grammars/java8/Java8Parser.js';
import Java8ParserListener from '../../grammars/java8/Java8ParserListener.js';
import { ParseError } from '../core/parse-error.js';
import { extractFirstClassName } from './signature-visitor.js';

/** @extends {Error} */
class PeekFirstClassNameComplete extends Error {
  /** @param {string} name */
  constructor(name) {
    super('peekFirstClassName complete');
    this.name = name;
  }
}

/** 收集词法/语法错误，供 pipeline 统一抛出 ParseError。 */
class CollectingErrorListener extends antlr4.error.ErrorListener {
  constructor() {
    super();
    /** @type {{ line: number, column: number, message: string }[]} */
    this.errors = [];
  }

  syntaxError(_recognizer, _offendingSymbol, line, column, msg) {
    this.errors.push({ line, column, message: msg });
  }
}

/**
 * @param {ParseLanguage} language
 * @param {CollectingErrorListener} listener
 */
function throwIfErrors(language, listener) {
  if (listener.errors.length === 0) return;
  const { line, column, message } = listener.errors[0];
  throw new ParseError({ language, line, column, message });
}

/** @param {import('antlr4').ParserRuleContext} ctx */
function identifierFromParent(ctx) {
  const parent = ctx.parentCtx;
  if (parent instanceof Java8Parser.NormalClassDeclarationContext) {
    return parent.Identifier()?.getText() ?? null;
  }
  if (parent instanceof Java8Parser.EnumDeclarationContext) {
    return parent.Identifier()?.getText() ?? null;
  }
  if (parent instanceof Java8Parser.NormalInterfaceDeclarationContext) {
    return parent.Identifier()?.getText() ?? null;
  }
  if (parent instanceof Java8Parser.AnnotationTypeDeclarationContext) {
    return parent.Identifier()?.getText() ?? null;
  }
  return null;
}

class PeekFirstClassNameListener extends Java8ParserListener {
  /** @param {string} name */
  finish(name) {
    throw new PeekFirstClassNameComplete(name);
  }

  /** @param {import('../../grammars/java8/Java8Parser.js').default.ClassBodyContext} ctx */
  enterClassBody(ctx) {
    const name = identifierFromParent(ctx);
    if (name) this.finish(name);
  }

  /** @param {import('../../grammars/java8/Java8Parser.js').default.EnumBodyContext} ctx */
  enterEnumBody(ctx) {
    const name = identifierFromParent(ctx);
    if (name) this.finish(name);
  }

  /** @param {import('../../grammars/java8/Java8Parser.js').default.InterfaceBodyContext} ctx */
  enterInterfaceBody(ctx) {
    const name = identifierFromParent(ctx);
    if (name) this.finish(name);
  }

  /** @param {import('../../grammars/java8/Java8Parser.js').default.AnnotationTypeBodyContext} ctx */
  enterAnnotationTypeBody(ctx) {
    const name = identifierFromParent(ctx);
    if (name) this.finish(name);
  }
}

/**
 * 快速提取首个顶层类型名：parse 至类型 body 入口即终止，不 lex/parse body。
 * 不验证 body 语法；需 strict 校验时使用 firstClassName。
 *
 * @param {string} input
 * @returns {string | null}
 */
export function peekFirstClassName(input) {
  const chars = new antlr4.InputStream(input);
  const lexer = new Java8Lexer(chars);
  const lexerListener = new CollectingErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerListener);

  const tokenStream = new antlr4.CommonTokenStream(lexer);
  const parser = new Java8Parser(tokenStream);
  const parserListener = new CollectingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parserListener);
  parser.addParseListener(new PeekFirstClassNameListener());

  try {
    const tree = parser.compilationUnit();
    throwIfErrors('java8', lexerListener);
    throwIfErrors('java8', parserListener);
    return extractFirstClassName(tree);
  } catch (error) {
    if (error instanceof PeekFirstClassNameComplete) {
      throwIfErrors('java8', lexerListener);
      return error.name;
    }
    throw error;
  }
}
