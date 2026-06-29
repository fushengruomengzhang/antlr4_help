parser grammar Json5Parser;

options {
    tokenVocab = Json5Lexer;
}

// ============================================================
// 入口
// ============================================================
json5
    : value EOF
    ;

// ============================================================
// 值 - 明确分离：数字 vs 字面量
// ============================================================
value
    : object
    | array
    | STRING
    | TRIPLE_DOUBLE_STRING
    | TRIPLE_SINGLE_STRING
    | NUMBER              // 纯数字：123, 1.2, 0x10, -5
    | TRUE
    | FALSE
    | NULL
    | literal             // 特殊字面量：Infinity, NaN, +Infinity, -NaN
    ;

// 特殊字面量 - 完全独立于 NUMBER
literal
    : INFINITY
    | NAN
    | signedLiteral
    ;

signedLiteral
    : PLUS INFINITY
    | MINUS INFINITY
    | PLUS NAN
    | MINUS NAN
    ;

// ============================================================
// 对象
// ============================================================
object
    : LBRACE (member (COMMA member)* COMMA?)? RBRACE
    ;

member
    : key COLON value
    ;

key
    : IdentifierName
    | TRUE
    | FALSE
    | NULL
    | INFINITY
    | NAN
    | STRING
    | NUMBER               // 数字 key，JSON5 支持
    ;

// ============================================================
// 数组
// ============================================================
array
    : LBRACK (value (COMMA value)* COMMA?)? RBRACK
    ;