grammar Hello;

// 入口规则：匹配形如 "hello world" 的问候语
greeting : 'hello' ID EOF ;

ID  : [a-zA-Z]+ ;
WS  : [ \t\r\n]+ -> skip ;
