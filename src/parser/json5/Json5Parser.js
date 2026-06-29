// Generated from /Users/zfs/work/cursor_space/antlr4_help/src/grammars/json5/Json5Parser.g4 by ANTLR 4.9.3
// jshint ignore: start
import antlr4 from 'antlr4';
import Json5ParserListener from './Json5ParserListener.js';

const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003\u0018W\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004",
    "\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007",
    "\u0004\b\t\b\u0004\t\t\t\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003 \n\u0003\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0005\u0004%\n\u0004\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0005\u0005/\n\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006",
    "\u0007\u00065\n\u0006\f\u0006\u000e\u00068\u000b\u0006\u0003\u0006\u0005",
    "\u0006;\n\u0006\u0005\u0006=\n\u0006\u0003\u0006\u0003\u0006\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\t\u0003\t",
    "\u0003\t\u0003\t\u0007\tK\n\t\f\t\u000e\tN\u000b\t\u0003\t\u0005\tQ",
    "\n\t\u0005\tS\n\t\u0003\t\u0003\t\u0003\t\u0002\u0002\n\u0002\u0004",
    "\u0006\b\n\f\u000e\u0010\u0002\u0003\u0003\u0002\b\u000f\u0002b\u0002",
    "\u0012\u0003\u0002\u0002\u0002\u0004\u001f\u0003\u0002\u0002\u0002\u0006",
    "$\u0003\u0002\u0002\u0002\b.\u0003\u0002\u0002\u0002\n0\u0003\u0002",
    "\u0002\u0002\f@\u0003\u0002\u0002\u0002\u000eD\u0003\u0002\u0002\u0002",
    "\u0010F\u0003\u0002\u0002\u0002\u0012\u0013\u0005\u0004\u0003\u0002",
    "\u0013\u0014\u0007\u0002\u0002\u0003\u0014\u0003\u0003\u0002\u0002\u0002",
    "\u0015 \u0005\n\u0006\u0002\u0016 \u0005\u0010\t\u0002\u0017 \u0007",
    "\b\u0002\u0002\u0018 \u0007\u0006\u0002\u0002\u0019 \u0007\u0007\u0002",
    "\u0002\u001a \u0007\t\u0002\u0002\u001b \u0007\n\u0002\u0002\u001c ",
    "\u0007\u000b\u0002\u0002\u001d \u0007\f\u0002\u0002\u001e \u0005\u0006",
    "\u0004\u0002\u001f\u0015\u0003\u0002\u0002\u0002\u001f\u0016\u0003\u0002",
    "\u0002\u0002\u001f\u0017\u0003\u0002\u0002\u0002\u001f\u0018\u0003\u0002",
    "\u0002\u0002\u001f\u0019\u0003\u0002\u0002\u0002\u001f\u001a\u0003\u0002",
    "\u0002\u0002\u001f\u001b\u0003\u0002\u0002\u0002\u001f\u001c\u0003\u0002",
    "\u0002\u0002\u001f\u001d\u0003\u0002\u0002\u0002\u001f\u001e\u0003\u0002",
    "\u0002\u0002 \u0005\u0003\u0002\u0002\u0002!%\u0007\r\u0002\u0002\"",
    "%\u0007\u000e\u0002\u0002#%\u0005\b\u0005\u0002$!\u0003\u0002\u0002",
    "\u0002$\"\u0003\u0002\u0002\u0002$#\u0003\u0002\u0002\u0002%\u0007\u0003",
    "\u0002\u0002\u0002&\'\u0007\u0016\u0002\u0002\'/\u0007\r\u0002\u0002",
    "()\u0007\u0017\u0002\u0002)/\u0007\r\u0002\u0002*+\u0007\u0016\u0002",
    "\u0002+/\u0007\u000e\u0002\u0002,-\u0007\u0017\u0002\u0002-/\u0007\u000e",
    "\u0002\u0002.&\u0003\u0002\u0002\u0002.(\u0003\u0002\u0002\u0002.*\u0003",
    "\u0002\u0002\u0002.,\u0003\u0002\u0002\u0002/\t\u0003\u0002\u0002\u0002",
    "0<\u0007\u0010\u0002\u000216\u0005\f\u0007\u000223\u0007\u0015\u0002",
    "\u000235\u0005\f\u0007\u000242\u0003\u0002\u0002\u000258\u0003\u0002",
    "\u0002\u000264\u0003\u0002\u0002\u000267\u0003\u0002\u0002\u00027:\u0003",
    "\u0002\u0002\u000286\u0003\u0002\u0002\u00029;\u0007\u0015\u0002\u0002",
    ":9\u0003\u0002\u0002\u0002:;\u0003\u0002\u0002\u0002;=\u0003\u0002\u0002",
    "\u0002<1\u0003\u0002\u0002\u0002<=\u0003\u0002\u0002\u0002=>\u0003\u0002",
    "\u0002\u0002>?\u0007\u0011\u0002\u0002?\u000b\u0003\u0002\u0002\u0002",
    "@A\u0005\u000e\b\u0002AB\u0007\u0014\u0002\u0002BC\u0005\u0004\u0003",
    "\u0002C\r\u0003\u0002\u0002\u0002DE\t\u0002\u0002\u0002E\u000f\u0003",
    "\u0002\u0002\u0002FR\u0007\u0012\u0002\u0002GL\u0005\u0004\u0003\u0002",
    "HI\u0007\u0015\u0002\u0002IK\u0005\u0004\u0003\u0002JH\u0003\u0002\u0002",
    "\u0002KN\u0003\u0002\u0002\u0002LJ\u0003\u0002\u0002\u0002LM\u0003\u0002",
    "\u0002\u0002MP\u0003\u0002\u0002\u0002NL\u0003\u0002\u0002\u0002OQ\u0007",
    "\u0015\u0002\u0002PO\u0003\u0002\u0002\u0002PQ\u0003\u0002\u0002\u0002",
    "QS\u0003\u0002\u0002\u0002RG\u0003\u0002\u0002\u0002RS\u0003\u0002\u0002",
    "\u0002ST\u0003\u0002\u0002\u0002TU\u0007\u0013\u0002\u0002U\u0011\u0003",
    "\u0002\u0002\u0002\u000b\u001f$.6:<LPR"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class Json5Parser extends antlr4.Parser {

    static grammarFileName = "Json5Parser.g4";
    static literalNames = [ null, null, null, null, null, null, null, null, 
                            "'true'", "'false'", "'null'", "'Infinity'", 
                            "'NaN'", null, "'{'", "'}'", "'['", "']'", "':'", 
                            "','", "'+'", "'-'" ];
    static symbolicNames = [ null, "WS", "LINE_COMMENT", "BLOCK_COMMENT", 
                             "TRIPLE_DOUBLE_STRING", "TRIPLE_SINGLE_STRING", 
                             "STRING", "NUMBER", "TRUE", "FALSE", "NULL", 
                             "INFINITY", "NAN", "IdentifierName", "LBRACE", 
                             "RBRACE", "LBRACK", "RBRACK", "COLON", "COMMA", 
                             "PLUS", "MINUS", "UNKNOWN" ];
    static ruleNames = [ "json5", "value", "literal", "signedLiteral", "object", 
                         "member", "key", "array" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = Json5Parser.ruleNames;
        this.literalNames = Json5Parser.literalNames;
        this.symbolicNames = Json5Parser.symbolicNames;
    }

    get atn() {
        return atn;
    }



	json5() {
	    let localctx = new Json5Context(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, Json5Parser.RULE_json5);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 16;
	        this.value();
	        this.state = 17;
	        this.match(Json5Parser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	value() {
	    let localctx = new ValueContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, Json5Parser.RULE_value);
	    try {
	        this.state = 29;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case Json5Parser.LBRACE:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 19;
	            this.object();
	            break;
	        case Json5Parser.LBRACK:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 20;
	            this.array();
	            break;
	        case Json5Parser.STRING:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 21;
	            this.match(Json5Parser.STRING);
	            break;
	        case Json5Parser.TRIPLE_DOUBLE_STRING:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 22;
	            this.match(Json5Parser.TRIPLE_DOUBLE_STRING);
	            break;
	        case Json5Parser.TRIPLE_SINGLE_STRING:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 23;
	            this.match(Json5Parser.TRIPLE_SINGLE_STRING);
	            break;
	        case Json5Parser.NUMBER:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 24;
	            this.match(Json5Parser.NUMBER);
	            break;
	        case Json5Parser.TRUE:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 25;
	            this.match(Json5Parser.TRUE);
	            break;
	        case Json5Parser.FALSE:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 26;
	            this.match(Json5Parser.FALSE);
	            break;
	        case Json5Parser.NULL:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 27;
	            this.match(Json5Parser.NULL);
	            break;
	        case Json5Parser.INFINITY:
	        case Json5Parser.NAN:
	        case Json5Parser.PLUS:
	        case Json5Parser.MINUS:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 28;
	            this.literal();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	literal() {
	    let localctx = new LiteralContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, Json5Parser.RULE_literal);
	    try {
	        this.state = 34;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case Json5Parser.INFINITY:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 31;
	            this.match(Json5Parser.INFINITY);
	            break;
	        case Json5Parser.NAN:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 32;
	            this.match(Json5Parser.NAN);
	            break;
	        case Json5Parser.PLUS:
	        case Json5Parser.MINUS:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 33;
	            this.signedLiteral();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	signedLiteral() {
	    let localctx = new SignedLiteralContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, Json5Parser.RULE_signedLiteral);
	    try {
	        this.state = 44;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 36;
	            this.match(Json5Parser.PLUS);
	            this.state = 37;
	            this.match(Json5Parser.INFINITY);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 38;
	            this.match(Json5Parser.MINUS);
	            this.state = 39;
	            this.match(Json5Parser.INFINITY);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 40;
	            this.match(Json5Parser.PLUS);
	            this.state = 41;
	            this.match(Json5Parser.NAN);
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 42;
	            this.match(Json5Parser.MINUS);
	            this.state = 43;
	            this.match(Json5Parser.NAN);
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	object() {
	    let localctx = new ObjectContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, Json5Parser.RULE_object);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 46;
	        this.match(Json5Parser.LBRACE);
	        this.state = 58;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << Json5Parser.STRING) | (1 << Json5Parser.NUMBER) | (1 << Json5Parser.TRUE) | (1 << Json5Parser.FALSE) | (1 << Json5Parser.NULL) | (1 << Json5Parser.INFINITY) | (1 << Json5Parser.NAN) | (1 << Json5Parser.IdentifierName))) !== 0)) {
	            this.state = 47;
	            this.member();
	            this.state = 52;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,3,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 48;
	                    this.match(Json5Parser.COMMA);
	                    this.state = 49;
	                    this.member(); 
	                }
	                this.state = 54;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,3,this._ctx);
	            }

	            this.state = 56;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===Json5Parser.COMMA) {
	                this.state = 55;
	                this.match(Json5Parser.COMMA);
	            }

	        }

	        this.state = 60;
	        this.match(Json5Parser.RBRACE);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	member() {
	    let localctx = new MemberContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, Json5Parser.RULE_member);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 62;
	        this.key();
	        this.state = 63;
	        this.match(Json5Parser.COLON);
	        this.state = 64;
	        this.value();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	key() {
	    let localctx = new KeyContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, Json5Parser.RULE_key);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 66;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << Json5Parser.STRING) | (1 << Json5Parser.NUMBER) | (1 << Json5Parser.TRUE) | (1 << Json5Parser.FALSE) | (1 << Json5Parser.NULL) | (1 << Json5Parser.INFINITY) | (1 << Json5Parser.NAN) | (1 << Json5Parser.IdentifierName))) !== 0))) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	array() {
	    let localctx = new ArrayContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, Json5Parser.RULE_array);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 68;
	        this.match(Json5Parser.LBRACK);
	        this.state = 80;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << Json5Parser.TRIPLE_DOUBLE_STRING) | (1 << Json5Parser.TRIPLE_SINGLE_STRING) | (1 << Json5Parser.STRING) | (1 << Json5Parser.NUMBER) | (1 << Json5Parser.TRUE) | (1 << Json5Parser.FALSE) | (1 << Json5Parser.NULL) | (1 << Json5Parser.INFINITY) | (1 << Json5Parser.NAN) | (1 << Json5Parser.LBRACE) | (1 << Json5Parser.LBRACK) | (1 << Json5Parser.PLUS) | (1 << Json5Parser.MINUS))) !== 0)) {
	            this.state = 69;
	            this.value();
	            this.state = 74;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,6,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 70;
	                    this.match(Json5Parser.COMMA);
	                    this.state = 71;
	                    this.value(); 
	                }
	                this.state = 76;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,6,this._ctx);
	            }

	            this.state = 78;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===Json5Parser.COMMA) {
	                this.state = 77;
	                this.match(Json5Parser.COMMA);
	            }

	        }

	        this.state = 82;
	        this.match(Json5Parser.RBRACK);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

Json5Parser.EOF = antlr4.Token.EOF;
Json5Parser.WS = 1;
Json5Parser.LINE_COMMENT = 2;
Json5Parser.BLOCK_COMMENT = 3;
Json5Parser.TRIPLE_DOUBLE_STRING = 4;
Json5Parser.TRIPLE_SINGLE_STRING = 5;
Json5Parser.STRING = 6;
Json5Parser.NUMBER = 7;
Json5Parser.TRUE = 8;
Json5Parser.FALSE = 9;
Json5Parser.NULL = 10;
Json5Parser.INFINITY = 11;
Json5Parser.NAN = 12;
Json5Parser.IdentifierName = 13;
Json5Parser.LBRACE = 14;
Json5Parser.RBRACE = 15;
Json5Parser.LBRACK = 16;
Json5Parser.RBRACK = 17;
Json5Parser.COLON = 18;
Json5Parser.COMMA = 19;
Json5Parser.PLUS = 20;
Json5Parser.MINUS = 21;
Json5Parser.UNKNOWN = 22;

Json5Parser.RULE_json5 = 0;
Json5Parser.RULE_value = 1;
Json5Parser.RULE_literal = 2;
Json5Parser.RULE_signedLiteral = 3;
Json5Parser.RULE_object = 4;
Json5Parser.RULE_member = 5;
Json5Parser.RULE_key = 6;
Json5Parser.RULE_array = 7;

class Json5Context extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_json5;
    }

	value() {
	    return this.getTypedRuleContext(ValueContext,0);
	};

	EOF() {
	    return this.getToken(Json5Parser.EOF, 0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterJson5(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitJson5(this);
		}
	}


}



class ValueContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_value;
    }

	object() {
	    return this.getTypedRuleContext(ObjectContext,0);
	};

	array() {
	    return this.getTypedRuleContext(ArrayContext,0);
	};

	STRING() {
	    return this.getToken(Json5Parser.STRING, 0);
	};

	TRIPLE_DOUBLE_STRING() {
	    return this.getToken(Json5Parser.TRIPLE_DOUBLE_STRING, 0);
	};

	TRIPLE_SINGLE_STRING() {
	    return this.getToken(Json5Parser.TRIPLE_SINGLE_STRING, 0);
	};

	NUMBER() {
	    return this.getToken(Json5Parser.NUMBER, 0);
	};

	TRUE() {
	    return this.getToken(Json5Parser.TRUE, 0);
	};

	FALSE() {
	    return this.getToken(Json5Parser.FALSE, 0);
	};

	NULL() {
	    return this.getToken(Json5Parser.NULL, 0);
	};

	literal() {
	    return this.getTypedRuleContext(LiteralContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterValue(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitValue(this);
		}
	}


}



class LiteralContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_literal;
    }

	INFINITY() {
	    return this.getToken(Json5Parser.INFINITY, 0);
	};

	NAN() {
	    return this.getToken(Json5Parser.NAN, 0);
	};

	signedLiteral() {
	    return this.getTypedRuleContext(SignedLiteralContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitLiteral(this);
		}
	}


}



class SignedLiteralContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_signedLiteral;
    }

	PLUS() {
	    return this.getToken(Json5Parser.PLUS, 0);
	};

	INFINITY() {
	    return this.getToken(Json5Parser.INFINITY, 0);
	};

	MINUS() {
	    return this.getToken(Json5Parser.MINUS, 0);
	};

	NAN() {
	    return this.getToken(Json5Parser.NAN, 0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterSignedLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitSignedLiteral(this);
		}
	}


}



class ObjectContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_object;
    }

	LBRACE() {
	    return this.getToken(Json5Parser.LBRACE, 0);
	};

	RBRACE() {
	    return this.getToken(Json5Parser.RBRACE, 0);
	};

	member = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(MemberContext);
	    } else {
	        return this.getTypedRuleContext(MemberContext,i);
	    }
	};

	COMMA = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(Json5Parser.COMMA);
	    } else {
	        return this.getToken(Json5Parser.COMMA, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterObject(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitObject(this);
		}
	}


}



class MemberContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_member;
    }

	key() {
	    return this.getTypedRuleContext(KeyContext,0);
	};

	COLON() {
	    return this.getToken(Json5Parser.COLON, 0);
	};

	value() {
	    return this.getTypedRuleContext(ValueContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterMember(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitMember(this);
		}
	}


}



class KeyContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_key;
    }

	IdentifierName() {
	    return this.getToken(Json5Parser.IdentifierName, 0);
	};

	TRUE() {
	    return this.getToken(Json5Parser.TRUE, 0);
	};

	FALSE() {
	    return this.getToken(Json5Parser.FALSE, 0);
	};

	NULL() {
	    return this.getToken(Json5Parser.NULL, 0);
	};

	INFINITY() {
	    return this.getToken(Json5Parser.INFINITY, 0);
	};

	NAN() {
	    return this.getToken(Json5Parser.NAN, 0);
	};

	STRING() {
	    return this.getToken(Json5Parser.STRING, 0);
	};

	NUMBER() {
	    return this.getToken(Json5Parser.NUMBER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterKey(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitKey(this);
		}
	}


}



class ArrayContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_array;
    }

	LBRACK() {
	    return this.getToken(Json5Parser.LBRACK, 0);
	};

	RBRACK() {
	    return this.getToken(Json5Parser.RBRACK, 0);
	};

	value = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ValueContext);
	    } else {
	        return this.getTypedRuleContext(ValueContext,i);
	    }
	};

	COMMA = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(Json5Parser.COMMA);
	    } else {
	        return this.getToken(Json5Parser.COMMA, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterArray(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitArray(this);
		}
	}


}




Json5Parser.Json5Context = Json5Context; 
Json5Parser.ValueContext = ValueContext; 
Json5Parser.LiteralContext = LiteralContext; 
Json5Parser.SignedLiteralContext = SignedLiteralContext; 
Json5Parser.ObjectContext = ObjectContext; 
Json5Parser.MemberContext = MemberContext; 
Json5Parser.KeyContext = KeyContext; 
Json5Parser.ArrayContext = ArrayContext; 
