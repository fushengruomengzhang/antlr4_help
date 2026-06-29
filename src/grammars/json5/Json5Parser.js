// Generated from /Users/zfs/work/cursor_space/antlr4_help/src/grammars/json5/Json5Parser.g4 by ANTLR 4.9.3
// jshint ignore: start
import antlr4 from 'antlr4';
import Json5ParserListener from './Json5ParserListener.js';

const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003$m\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005",
    "\u0003$\n\u0003\u0003\u0004\u0003\u0004\u0007\u0004(\n\u0004\f\u0004",
    "\u000e\u0004+\u000b\u0004\u0003\u0004\u0003\u0004\u0003\u0005\u0003",
    "\u0005\u0007\u00051\n\u0005\f\u0005\u000e\u00054\u000b\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0005\u0006;\n\u0006",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0005\u0007E\n\u0007\u0003\b\u0003\b\u0003",
    "\b\u0003\b\u0007\bK\n\b\f\b\u000e\bN\u000b\b\u0003\b\u0005\bQ\n\b\u0005",
    "\bS\n\b\u0003\b\u0003\b\u0003\t\u0003\t\u0003\t\u0003\t\u0003\n\u0003",
    "\n\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0007\u000ba\n\u000b",
    "\f\u000b\u000e\u000bd\u000b\u000b\u0003\u000b\u0005\u000bg\n\u000b\u0005",
    "\u000bi\n\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0002\u0002\f\u0002",
    "\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0002\u0003\u0003\u0002\f",
    "\u0013\u0002x\u0002\u0016\u0003\u0002\u0002\u0002\u0004#\u0003\u0002",
    "\u0002\u0002\u0006%\u0003\u0002\u0002\u0002\b.\u0003\u0002\u0002\u0002",
    "\n:\u0003\u0002\u0002\u0002\fD\u0003\u0002\u0002\u0002\u000eF\u0003",
    "\u0002\u0002\u0002\u0010V\u0003\u0002\u0002\u0002\u0012Z\u0003\u0002",
    "\u0002\u0002\u0014\\\u0003\u0002\u0002\u0002\u0016\u0017\u0005\u0004",
    "\u0003\u0002\u0017\u0018\u0007\u0002\u0002\u0003\u0018\u0003\u0003\u0002",
    "\u0002\u0002\u0019$\u0005\u000e\b\u0002\u001a$\u0005\u0014\u000b\u0002",
    "\u001b$\u0007\f\u0002\u0002\u001c$\u0005\u0006\u0004\u0002\u001d$\u0005",
    "\b\u0005\u0002\u001e$\u0007\r\u0002\u0002\u001f$\u0007\u000e\u0002\u0002",
    " $\u0007\u000f\u0002\u0002!$\u0007\u0010\u0002\u0002\"$\u0005\n\u0006",
    "\u0002#\u0019\u0003\u0002\u0002\u0002#\u001a\u0003\u0002\u0002\u0002",
    "#\u001b\u0003\u0002\u0002\u0002#\u001c\u0003\u0002\u0002\u0002#\u001d",
    "\u0003\u0002\u0002\u0002#\u001e\u0003\u0002\u0002\u0002#\u001f\u0003",
    "\u0002\u0002\u0002# \u0003\u0002\u0002\u0002#!\u0003\u0002\u0002\u0002",
    "#\"\u0003\u0002\u0002\u0002$\u0005\u0003\u0002\u0002\u0002%)\u0007\n",
    "\u0002\u0002&(\u0007\u0003\u0002\u0002\'&\u0003\u0002\u0002\u0002(+",
    "\u0003\u0002\u0002\u0002)\'\u0003\u0002\u0002\u0002)*\u0003\u0002\u0002",
    "\u0002*,\u0003\u0002\u0002\u0002+)\u0003\u0002\u0002\u0002,-\u0007\u0004",
    "\u0002\u0002-\u0007\u0003\u0002\u0002\u0002.2\u0007\u000b\u0002\u0002",
    "/1\u0007\u0005\u0002\u00020/\u0003\u0002\u0002\u000214\u0003\u0002\u0002",
    "\u000220\u0003\u0002\u0002\u000223\u0003\u0002\u0002\u000235\u0003\u0002",
    "\u0002\u000242\u0003\u0002\u0002\u000256\u0007\u0006\u0002\u00026\t",
    "\u0003\u0002\u0002\u00027;\u0007\u0011\u0002\u00028;\u0007\u0012\u0002",
    "\u00029;\u0005\f\u0007\u0002:7\u0003\u0002\u0002\u0002:8\u0003\u0002",
    "\u0002\u0002:9\u0003\u0002\u0002\u0002;\u000b\u0003\u0002\u0002\u0002",
    "<=\u0007\u001a\u0002\u0002=E\u0007\u0011\u0002\u0002>?\u0007\u001b\u0002",
    "\u0002?E\u0007\u0011\u0002\u0002@A\u0007\u001a\u0002\u0002AE\u0007\u0012",
    "\u0002\u0002BC\u0007\u001b\u0002\u0002CE\u0007\u0012\u0002\u0002D<\u0003",
    "\u0002\u0002\u0002D>\u0003\u0002\u0002\u0002D@\u0003\u0002\u0002\u0002",
    "DB\u0003\u0002\u0002\u0002E\r\u0003\u0002\u0002\u0002FR\u0007\u0014",
    "\u0002\u0002GL\u0005\u0010\t\u0002HI\u0007\u0019\u0002\u0002IK\u0005",
    "\u0010\t\u0002JH\u0003\u0002\u0002\u0002KN\u0003\u0002\u0002\u0002L",
    "J\u0003\u0002\u0002\u0002LM\u0003\u0002\u0002\u0002MP\u0003\u0002\u0002",
    "\u0002NL\u0003\u0002\u0002\u0002OQ\u0007\u0019\u0002\u0002PO\u0003\u0002",
    "\u0002\u0002PQ\u0003\u0002\u0002\u0002QS\u0003\u0002\u0002\u0002RG\u0003",
    "\u0002\u0002\u0002RS\u0003\u0002\u0002\u0002ST\u0003\u0002\u0002\u0002",
    "TU\u0007\u0015\u0002\u0002U\u000f\u0003\u0002\u0002\u0002VW\u0005\u0012",
    "\n\u0002WX\u0007\u0018\u0002\u0002XY\u0005\u0004\u0003\u0002Y\u0011",
    "\u0003\u0002\u0002\u0002Z[\t\u0002\u0002\u0002[\u0013\u0003\u0002\u0002",
    "\u0002\\h\u0007\u0016\u0002\u0002]b\u0005\u0004\u0003\u0002^_\u0007",
    "\u0019\u0002\u0002_a\u0005\u0004\u0003\u0002`^\u0003\u0002\u0002\u0002",
    "ad\u0003\u0002\u0002\u0002b`\u0003\u0002\u0002\u0002bc\u0003\u0002\u0002",
    "\u0002cf\u0003\u0002\u0002\u0002db\u0003\u0002\u0002\u0002eg\u0007\u0019",
    "\u0002\u0002fe\u0003\u0002\u0002\u0002fg\u0003\u0002\u0002\u0002gi\u0003",
    "\u0002\u0002\u0002h]\u0003\u0002\u0002\u0002hi\u0003\u0002\u0002\u0002",
    "ij\u0003\u0002\u0002\u0002jk\u0007\u0017\u0002\u0002k\u0015\u0003\u0002",
    "\u0002\u0002\r#)2:DLPRbfh"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class Json5Parser extends antlr4.Parser {

    static grammarFileName = "Json5Parser.g4";
    static literalNames = [ null, null, null, null, null, null, null, null, 
                            null, null, null, null, "'true'", "'false'", 
                            "'null'", "'Infinity'", "'NaN'", null, "'{'", 
                            "'}'", "'['", "']'", "':'", "','", "'+'", "'-'" ];
    static symbolicNames = [ null, "TRIPLE_S_BODY", "TRIPLE_S_CLOSE", "TRIPLE_D_BODY", 
                             "TRIPLE_D_CLOSE", "WS", "LINE_COMMENT", "BLOCK_COMMENT", 
                             "TRIPLE_S_OPEN", "TRIPLE_D_OPEN", "STRING", 
                             "NUMBER", "TRUE", "FALSE", "NULL", "INFINITY", 
                             "NAN", "IdentifierName", "LBRACE", "RBRACE", 
                             "LBRACK", "RBRACK", "COLON", "COMMA", "PLUS", 
                             "MINUS", "UNKNOWN", "TRIPLE_S_FIRST_LINE_COMMENT", 
                             "TRIPLE_S_FIRST_BLOCK_COMMENT", "TRIPLE_S_FIRST_WS", 
                             "TRIPLE_S_FIRST_EOL", "TRIPLE_D_FIRST_LINE_COMMENT", 
                             "TRIPLE_D_FIRST_BLOCK_COMMENT", "TRIPLE_D_FIRST_WS", 
                             "TRIPLE_D_FIRST_EOL" ];
    static ruleNames = [ "json5", "value", "tripleSingleString", "tripleDoubleString", 
                         "literal", "signedLiteral", "object", "member", 
                         "key", "array" ];

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
	        this.state = 20;
	        this.value();
	        this.state = 21;
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
	        this.state = 33;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case Json5Parser.LBRACE:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 23;
	            this.object();
	            break;
	        case Json5Parser.LBRACK:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 24;
	            this.array();
	            break;
	        case Json5Parser.STRING:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 25;
	            this.match(Json5Parser.STRING);
	            break;
	        case Json5Parser.TRIPLE_S_OPEN:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 26;
	            this.tripleSingleString();
	            break;
	        case Json5Parser.TRIPLE_D_OPEN:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 27;
	            this.tripleDoubleString();
	            break;
	        case Json5Parser.NUMBER:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 28;
	            this.match(Json5Parser.NUMBER);
	            break;
	        case Json5Parser.TRUE:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 29;
	            this.match(Json5Parser.TRUE);
	            break;
	        case Json5Parser.FALSE:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 30;
	            this.match(Json5Parser.FALSE);
	            break;
	        case Json5Parser.NULL:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 31;
	            this.match(Json5Parser.NULL);
	            break;
	        case Json5Parser.INFINITY:
	        case Json5Parser.NAN:
	        case Json5Parser.PLUS:
	        case Json5Parser.MINUS:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 32;
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



	tripleSingleString() {
	    let localctx = new TripleSingleStringContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, Json5Parser.RULE_tripleSingleString);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 35;
	        this.match(Json5Parser.TRIPLE_S_OPEN);
	        this.state = 39;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===Json5Parser.TRIPLE_S_BODY) {
	            this.state = 36;
	            this.match(Json5Parser.TRIPLE_S_BODY);
	            this.state = 41;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 42;
	        this.match(Json5Parser.TRIPLE_S_CLOSE);
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



	tripleDoubleString() {
	    let localctx = new TripleDoubleStringContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, Json5Parser.RULE_tripleDoubleString);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 44;
	        this.match(Json5Parser.TRIPLE_D_OPEN);
	        this.state = 48;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===Json5Parser.TRIPLE_D_BODY) {
	            this.state = 45;
	            this.match(Json5Parser.TRIPLE_D_BODY);
	            this.state = 50;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 51;
	        this.match(Json5Parser.TRIPLE_D_CLOSE);
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
	    this.enterRule(localctx, 8, Json5Parser.RULE_literal);
	    try {
	        this.state = 56;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case Json5Parser.INFINITY:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 53;
	            this.match(Json5Parser.INFINITY);
	            break;
	        case Json5Parser.NAN:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 54;
	            this.match(Json5Parser.NAN);
	            break;
	        case Json5Parser.PLUS:
	        case Json5Parser.MINUS:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 55;
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
	    this.enterRule(localctx, 10, Json5Parser.RULE_signedLiteral);
	    try {
	        this.state = 66;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 58;
	            this.match(Json5Parser.PLUS);
	            this.state = 59;
	            this.match(Json5Parser.INFINITY);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 60;
	            this.match(Json5Parser.MINUS);
	            this.state = 61;
	            this.match(Json5Parser.INFINITY);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 62;
	            this.match(Json5Parser.PLUS);
	            this.state = 63;
	            this.match(Json5Parser.NAN);
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 64;
	            this.match(Json5Parser.MINUS);
	            this.state = 65;
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
	    this.enterRule(localctx, 12, Json5Parser.RULE_object);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 68;
	        this.match(Json5Parser.LBRACE);
	        this.state = 80;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << Json5Parser.STRING) | (1 << Json5Parser.NUMBER) | (1 << Json5Parser.TRUE) | (1 << Json5Parser.FALSE) | (1 << Json5Parser.NULL) | (1 << Json5Parser.INFINITY) | (1 << Json5Parser.NAN) | (1 << Json5Parser.IdentifierName))) !== 0)) {
	            this.state = 69;
	            this.member();
	            this.state = 74;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,5,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 70;
	                    this.match(Json5Parser.COMMA);
	                    this.state = 71;
	                    this.member(); 
	                }
	                this.state = 76;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,5,this._ctx);
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
	    this.enterRule(localctx, 14, Json5Parser.RULE_member);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 84;
	        this.key();
	        this.state = 85;
	        this.match(Json5Parser.COLON);
	        this.state = 86;
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
	    this.enterRule(localctx, 16, Json5Parser.RULE_key);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 88;
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
	    this.enterRule(localctx, 18, Json5Parser.RULE_array);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 90;
	        this.match(Json5Parser.LBRACK);
	        this.state = 102;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << Json5Parser.TRIPLE_S_OPEN) | (1 << Json5Parser.TRIPLE_D_OPEN) | (1 << Json5Parser.STRING) | (1 << Json5Parser.NUMBER) | (1 << Json5Parser.TRUE) | (1 << Json5Parser.FALSE) | (1 << Json5Parser.NULL) | (1 << Json5Parser.INFINITY) | (1 << Json5Parser.NAN) | (1 << Json5Parser.LBRACE) | (1 << Json5Parser.LBRACK) | (1 << Json5Parser.PLUS) | (1 << Json5Parser.MINUS))) !== 0)) {
	            this.state = 91;
	            this.value();
	            this.state = 96;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,8,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 92;
	                    this.match(Json5Parser.COMMA);
	                    this.state = 93;
	                    this.value(); 
	                }
	                this.state = 98;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,8,this._ctx);
	            }

	            this.state = 100;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===Json5Parser.COMMA) {
	                this.state = 99;
	                this.match(Json5Parser.COMMA);
	            }

	        }

	        this.state = 104;
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
Json5Parser.TRIPLE_S_BODY = 1;
Json5Parser.TRIPLE_S_CLOSE = 2;
Json5Parser.TRIPLE_D_BODY = 3;
Json5Parser.TRIPLE_D_CLOSE = 4;
Json5Parser.WS = 5;
Json5Parser.LINE_COMMENT = 6;
Json5Parser.BLOCK_COMMENT = 7;
Json5Parser.TRIPLE_S_OPEN = 8;
Json5Parser.TRIPLE_D_OPEN = 9;
Json5Parser.STRING = 10;
Json5Parser.NUMBER = 11;
Json5Parser.TRUE = 12;
Json5Parser.FALSE = 13;
Json5Parser.NULL = 14;
Json5Parser.INFINITY = 15;
Json5Parser.NAN = 16;
Json5Parser.IdentifierName = 17;
Json5Parser.LBRACE = 18;
Json5Parser.RBRACE = 19;
Json5Parser.LBRACK = 20;
Json5Parser.RBRACK = 21;
Json5Parser.COLON = 22;
Json5Parser.COMMA = 23;
Json5Parser.PLUS = 24;
Json5Parser.MINUS = 25;
Json5Parser.UNKNOWN = 26;
Json5Parser.TRIPLE_S_FIRST_LINE_COMMENT = 27;
Json5Parser.TRIPLE_S_FIRST_BLOCK_COMMENT = 28;
Json5Parser.TRIPLE_S_FIRST_WS = 29;
Json5Parser.TRIPLE_S_FIRST_EOL = 30;
Json5Parser.TRIPLE_D_FIRST_LINE_COMMENT = 31;
Json5Parser.TRIPLE_D_FIRST_BLOCK_COMMENT = 32;
Json5Parser.TRIPLE_D_FIRST_WS = 33;
Json5Parser.TRIPLE_D_FIRST_EOL = 34;

Json5Parser.RULE_json5 = 0;
Json5Parser.RULE_value = 1;
Json5Parser.RULE_tripleSingleString = 2;
Json5Parser.RULE_tripleDoubleString = 3;
Json5Parser.RULE_literal = 4;
Json5Parser.RULE_signedLiteral = 5;
Json5Parser.RULE_object = 6;
Json5Parser.RULE_member = 7;
Json5Parser.RULE_key = 8;
Json5Parser.RULE_array = 9;

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

	tripleSingleString() {
	    return this.getTypedRuleContext(TripleSingleStringContext,0);
	};

	tripleDoubleString() {
	    return this.getTypedRuleContext(TripleDoubleStringContext,0);
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



class TripleSingleStringContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_tripleSingleString;
    }

	TRIPLE_S_OPEN() {
	    return this.getToken(Json5Parser.TRIPLE_S_OPEN, 0);
	};

	TRIPLE_S_CLOSE() {
	    return this.getToken(Json5Parser.TRIPLE_S_CLOSE, 0);
	};

	TRIPLE_S_BODY = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(Json5Parser.TRIPLE_S_BODY);
	    } else {
	        return this.getToken(Json5Parser.TRIPLE_S_BODY, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterTripleSingleString(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitTripleSingleString(this);
		}
	}


}



class TripleDoubleStringContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = Json5Parser.RULE_tripleDoubleString;
    }

	TRIPLE_D_OPEN() {
	    return this.getToken(Json5Parser.TRIPLE_D_OPEN, 0);
	};

	TRIPLE_D_CLOSE() {
	    return this.getToken(Json5Parser.TRIPLE_D_CLOSE, 0);
	};

	TRIPLE_D_BODY = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(Json5Parser.TRIPLE_D_BODY);
	    } else {
	        return this.getToken(Json5Parser.TRIPLE_D_BODY, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.enterTripleDoubleString(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof Json5ParserListener ) {
	        listener.exitTripleDoubleString(this);
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
Json5Parser.TripleSingleStringContext = TripleSingleStringContext; 
Json5Parser.TripleDoubleStringContext = TripleDoubleStringContext; 
Json5Parser.LiteralContext = LiteralContext; 
Json5Parser.SignedLiteralContext = SignedLiteralContext; 
Json5Parser.ObjectContext = ObjectContext; 
Json5Parser.MemberContext = MemberContext; 
Json5Parser.KeyContext = KeyContext; 
Json5Parser.ArrayContext = ArrayContext; 
