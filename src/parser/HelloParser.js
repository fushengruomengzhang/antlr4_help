// Generated from /workspace/src/grammars/Hello.g4 by ANTLR 4.9.3
// jshint ignore: start
import antlr4 from 'antlr4';
import HelloListener from './HelloListener.js';

const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003\u0005\t\u0004\u0002\t\u0002\u0003\u0002\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0002\u0002\u0002\u0003\u0002\u0002\u0002\u0002",
    "\u0007\u0002\u0004\u0003\u0002\u0002\u0002\u0004\u0005\u0007\u0003\u0002",
    "\u0002\u0005\u0006\u0007\u0004\u0002\u0002\u0006\u0007\u0007\u0002\u0002",
    "\u0003\u0007\u0003\u0003\u0002\u0002\u0002\u0002"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class HelloParser extends antlr4.Parser {

    static grammarFileName = "Hello.g4";
    static literalNames = [ null, "'hello'" ];
    static symbolicNames = [ null, null, "ID", "WS" ];
    static ruleNames = [ "greeting" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = HelloParser.ruleNames;
        this.literalNames = HelloParser.literalNames;
        this.symbolicNames = HelloParser.symbolicNames;
    }

    get atn() {
        return atn;
    }



	greeting() {
	    let localctx = new GreetingContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, HelloParser.RULE_greeting);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 2;
	        this.match(HelloParser.T__0);
	        this.state = 3;
	        this.match(HelloParser.ID);
	        this.state = 4;
	        this.match(HelloParser.EOF);
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

HelloParser.EOF = antlr4.Token.EOF;
HelloParser.T__0 = 1;
HelloParser.ID = 2;
HelloParser.WS = 3;

HelloParser.RULE_greeting = 0;

class GreetingContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = HelloParser.RULE_greeting;
    }

	ID() {
	    return this.getToken(HelloParser.ID, 0);
	};

	EOF() {
	    return this.getToken(HelloParser.EOF, 0);
	};

	enterRule(listener) {
	    if(listener instanceof HelloListener ) {
	        listener.enterGreeting(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof HelloListener ) {
	        listener.exitGreeting(this);
		}
	}


}




HelloParser.GreetingContext = GreetingContext; 
