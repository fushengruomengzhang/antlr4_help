// ESM 入口：用 antlr4 运行时驱动由 Hello.g4 生成的解析器
import antlr4 from 'antlr4';
import HelloLexer from './parser/HelloLexer.js';
import HelloParser from './parser/HelloParser.js';
import HelloListener from './parser/HelloListener.js';

// 解析出错时抛异常，从而让进程以非 0 退出码结束
class ThrowingErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg) {
    throw new Error(`语法错误 (行 ${line}:${column}): ${msg}`);
  }
}

// 监听器：进入 greeting 规则时取出被问候的名字
class GreetingListener extends HelloListener {
  enterGreeting(ctx) {
    this.target = ctx.ID().getText();
  }
}

function parseGreeting(input) {
  const chars = new antlr4.InputStream(input);
  const lexer = new HelloLexer(chars);
  lexer.removeErrorListeners();
  lexer.addErrorListener(new ThrowingErrorListener());

  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new HelloParser(tokens);
  parser.removeErrorListeners();
  parser.addErrorListener(new ThrowingErrorListener());
  parser.buildParseTrees = true;

  const tree = parser.greeting();

  const listener = new GreetingListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

  return { tree, target: listener.target, parser };
}

const input = process.argv[2] ?? 'hello world';
console.log(`输入: ${JSON.stringify(input)}`);

const { tree, target, parser } = parseGreeting(input);
console.log(`解析树: ${tree.toStringTree(parser.ruleNames, parser)}`);
console.log(`问候对象: ${target}`);
console.log('解析成功 ✅');
