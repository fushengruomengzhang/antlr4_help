lexer grammar Json5Lexer;

tokens { TRIPLE_S_BODY, TRIPLE_S_CLOSE, TRIPLE_D_BODY, TRIPLE_D_CLOSE }

// ============================================================
// 隐藏通道：空白与注释
// ============================================================
WS
    : [ \t\r\n\uFEFF]+ -> channel(HIDDEN)
    ;

LINE_COMMENT
    : '//' ~[\r\n]* -> channel(HIDDEN)
    ;

BLOCK_COMMENT
    : '/*' .*? '*/' -> channel(HIDDEN)
    ;

// ============================================================
// 三引号 opener（模式规则见文件末尾）
// ============================================================
TRIPLE_S_OPEN
    : '\'\'\'' -> pushMode(TRIPLE_S_FIRST)
    ;

TRIPLE_D_OPEN
    : '"""' -> pushMode(TRIPLE_D_FIRST)
    ;

// ============================================================
// 单行字符串
// ============================================================
STRING
    : '"' ( ESC | LINE_CONT | ~["\\\r\n] )* '"'
    | '\'' ( ESC | LINE_CONT | ~['\\\r\n] )* '\''
    ;

fragment ESC
    : '\\' ["\\/bfnrt]
    | '\\' 'u' HEX HEX HEX HEX
    ;

fragment LINE_CONT
    : '\\' [\r\n\u2028\u2029]
    | '\\' '\r' '\n'
    ;

fragment HEX
    : [0-9a-fA-F]
    ;

// ============================================================
// 数字
// ============================================================
NUMBER
    : [+-]? INT ('.' [0-9]+)? EXP?
    | [+-]? '.' [0-9]+ EXP?
    | '0' [xX] HEX+
    ;

fragment INT
    : '0'
    | [1-9] [0-9]*
    ;

fragment EXP
    : [eE] [+-]? [0-9]+
    ;

// ============================================================
// 字面量
// ============================================================
TRUE     : 'true';
FALSE    : 'false';
NULL     : 'null';
INFINITY : 'Infinity';
NAN      : 'NaN';

// ============================================================
// 标识符 - 完整 Unicode 支持（lexer 只做 tokenization）
// ============================================================
IdentifierName
    : IdentifierStart IdentifierPart*
    ;

fragment IdentifierStart
    : [A-Za-z_$]
    | [\u00A0-\uFFFF]
    | '\\' 'u' HEX HEX HEX HEX
    ;

fragment IdentifierPart
    : IdentifierStart
    | [0-9]
    | [\u0300-\u036F]
    | [\u200C-\u200D]
    | '\\' 'u' HEX HEX HEX HEX
    ;

// ============================================================
// 标点符号
// ============================================================
LBRACE   : '{';
RBRACE   : '}';
LBRACK   : '[';
RBRACK   : ']';
COLON    : ':';
COMMA    : ',';
PLUS     : '+';
MINUS    : '-';

// ============================================================
// 错误处理 - 保持可见，让 parser 处理
// ============================================================
UNKNOWN  : .;

// ============================================================
// 三引号字符串模式（OPEN 在 DEFAULT_MODE）
// ============================================================
mode TRIPLE_S_FIRST;
TRIPLE_S_FIRST_LINE_COMMENT
    : '//' ~[\r\n]* -> channel(HIDDEN)
    ;
TRIPLE_S_FIRST_BLOCK_COMMENT
    : '/*' .*? '*/' -> channel(HIDDEN)
    ;
TRIPLE_S_FIRST_WS
    : [ \t]+ -> channel(HIDDEN)
    ;
TRIPLE_S_FIRST_EOL
    : [\r\n]+ -> channel(HIDDEN), mode(TRIPLE_S_IN_BODY)
    ;
TRIPLE_S_CLOSE_IN_FIRST
    : '\'\'\'' -> type(TRIPLE_S_CLOSE), popMode
    ;
TRIPLE_S_FIRST_CHAR
    : TRIPLE_S_FIRST_BODY_CHAR -> type(TRIPLE_S_BODY), mode(TRIPLE_S_IN_BODY)
    ;

mode TRIPLE_S_IN_BODY;
TRIPLE_S_CLOSE_IN_BODY
    : '\'\'\'' -> type(TRIPLE_S_CLOSE), popMode
    ;
TRIPLE_S_BODY_PART
    : TRIPLE_S_BODY_CHAR+ -> type(TRIPLE_S_BODY)
    ;

mode TRIPLE_D_FIRST;
TRIPLE_D_FIRST_LINE_COMMENT
    : '//' ~[\r\n]* -> channel(HIDDEN)
    ;
TRIPLE_D_FIRST_BLOCK_COMMENT
    : '/*' .*? '*/' -> channel(HIDDEN)
    ;
TRIPLE_D_FIRST_WS
    : [ \t]+ -> channel(HIDDEN)
    ;
TRIPLE_D_FIRST_EOL
    : [\r\n]+ -> channel(HIDDEN), mode(TRIPLE_D_IN_BODY)
    ;
TRIPLE_D_CLOSE_IN_FIRST
    : '"""' -> type(TRIPLE_D_CLOSE), popMode
    ;
TRIPLE_D_FIRST_CHAR
    : TRIPLE_D_FIRST_BODY_CHAR -> type(TRIPLE_D_BODY), mode(TRIPLE_D_IN_BODY)
    ;

mode TRIPLE_D_IN_BODY;
TRIPLE_D_CLOSE_IN_BODY
    : '"""' -> type(TRIPLE_D_CLOSE), popMode
    ;
TRIPLE_D_BODY_PART
    : TRIPLE_D_BODY_CHAR+ -> type(TRIPLE_D_BODY)
    ;

fragment TRIPLE_S_FIRST_BODY_CHAR
    : ~[\r\n'\\]
    | '\\' .
    | '\'' ~['\\]
    | '\'\'' ~['\\]
    ;

fragment TRIPLE_S_BODY_CHAR
    : ~['\\]
    | '\\' .
    | '\'' ~['\\]
    | '\'\'' ~['\\]
    ;

fragment TRIPLE_D_FIRST_BODY_CHAR
    : ~[\r\n"\\]
    | '\\' .
    | '"' ~["\\]
    | '""' ~["\\]
    ;

fragment TRIPLE_D_BODY_CHAR
    : ~["\\]
    | '\\' .
    | '"' ~["\\]
    | '""' ~["\\]
    ;
