// Generated from /Users/zfs/work/cursor_space/antlr4_help/src/grammars/json5/Json5Parser.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue", "this-escape"})
public class Json5Parser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.2", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		TRIPLE_S_BODY=1, TRIPLE_S_CLOSE=2, TRIPLE_D_BODY=3, TRIPLE_D_CLOSE=4, 
		WS=5, LINE_COMMENT=6, BLOCK_COMMENT=7, TRIPLE_S_OPEN=8, TRIPLE_D_OPEN=9, 
		TRIPLE_S_FIRST_LINE_COMMENT=10, TRIPLE_S_FIRST_BLOCK_COMMENT=11, TRIPLE_S_FIRST_WS=12, 
		TRIPLE_S_FIRST_EOL=13, TRIPLE_D_FIRST_LINE_COMMENT=14, TRIPLE_D_FIRST_BLOCK_COMMENT=15, 
		TRIPLE_D_FIRST_WS=16, TRIPLE_D_FIRST_EOL=17, STRING=18, NUMBER=19, TRUE=20, 
		FALSE=21, NULL=22, INFINITY=23, NAN=24, IdentifierName=25, LBRACE=26, 
		RBRACE=27, LBRACK=28, RBRACK=29, COLON=30, COMMA=31, PLUS=32, MINUS=33, 
		UNKNOWN=34;
	public static final int
		RULE_json5 = 0, RULE_value = 1, RULE_tripleSingleString = 2, RULE_tripleDoubleString = 3, 
		RULE_literal = 4, RULE_signedLiteral = 5, RULE_object = 6, RULE_member = 7, 
		RULE_key = 8, RULE_array = 9;
	private static String[] makeRuleNames() {
		return new String[] {
			"json5", "value", "tripleSingleString", "tripleDoubleString", "literal", 
			"signedLiteral", "object", "member", "key", "array"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, null, null, null, null, null, null, null, null, null, null, null, 
			null, null, null, null, null, null, null, null, "'true'", "'false'", 
			"'null'", "'Infinity'", "'NaN'", null, "'{'", "'}'", "'['", "']'", "':'", 
			"','", "'+'", "'-'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "TRIPLE_S_BODY", "TRIPLE_S_CLOSE", "TRIPLE_D_BODY", "TRIPLE_D_CLOSE", 
			"WS", "LINE_COMMENT", "BLOCK_COMMENT", "TRIPLE_S_OPEN", "TRIPLE_D_OPEN", 
			"TRIPLE_S_FIRST_LINE_COMMENT", "TRIPLE_S_FIRST_BLOCK_COMMENT", "TRIPLE_S_FIRST_WS", 
			"TRIPLE_S_FIRST_EOL", "TRIPLE_D_FIRST_LINE_COMMENT", "TRIPLE_D_FIRST_BLOCK_COMMENT", 
			"TRIPLE_D_FIRST_WS", "TRIPLE_D_FIRST_EOL", "STRING", "NUMBER", "TRUE", 
			"FALSE", "NULL", "INFINITY", "NAN", "IdentifierName", "LBRACE", "RBRACE", 
			"LBRACK", "RBRACK", "COLON", "COMMA", "PLUS", "MINUS", "UNKNOWN"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "Json5Parser.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public Json5Parser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Json5Context extends ParserRuleContext {
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode EOF() { return getToken(Json5Parser.EOF, 0); }
		public Json5Context(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_json5; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterJson5(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitJson5(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitJson5(this);
			else return visitor.visitChildren(this);
		}
	}

	public final Json5Context json5() throws RecognitionException {
		Json5Context _localctx = new Json5Context(_ctx, getState());
		enterRule(_localctx, 0, RULE_json5);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(20);
			value();
			setState(21);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ValueContext extends ParserRuleContext {
		public ObjectContext object() {
			return getRuleContext(ObjectContext.class,0);
		}
		public ArrayContext array() {
			return getRuleContext(ArrayContext.class,0);
		}
		public TerminalNode STRING() { return getToken(Json5Parser.STRING, 0); }
		public TripleSingleStringContext tripleSingleString() {
			return getRuleContext(TripleSingleStringContext.class,0);
		}
		public TripleDoubleStringContext tripleDoubleString() {
			return getRuleContext(TripleDoubleStringContext.class,0);
		}
		public TerminalNode NUMBER() { return getToken(Json5Parser.NUMBER, 0); }
		public TerminalNode TRUE() { return getToken(Json5Parser.TRUE, 0); }
		public TerminalNode FALSE() { return getToken(Json5Parser.FALSE, 0); }
		public TerminalNode NULL() { return getToken(Json5Parser.NULL, 0); }
		public LiteralContext literal() {
			return getRuleContext(LiteralContext.class,0);
		}
		public ValueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_value; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterValue(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitValue(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitValue(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ValueContext value() throws RecognitionException {
		ValueContext _localctx = new ValueContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_value);
		try {
			setState(33);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LBRACE:
				enterOuterAlt(_localctx, 1);
				{
				setState(23);
				object();
				}
				break;
			case LBRACK:
				enterOuterAlt(_localctx, 2);
				{
				setState(24);
				array();
				}
				break;
			case STRING:
				enterOuterAlt(_localctx, 3);
				{
				setState(25);
				match(STRING);
				}
				break;
			case TRIPLE_S_OPEN:
				enterOuterAlt(_localctx, 4);
				{
				setState(26);
				tripleSingleString();
				}
				break;
			case TRIPLE_D_OPEN:
				enterOuterAlt(_localctx, 5);
				{
				setState(27);
				tripleDoubleString();
				}
				break;
			case NUMBER:
				enterOuterAlt(_localctx, 6);
				{
				setState(28);
				match(NUMBER);
				}
				break;
			case TRUE:
				enterOuterAlt(_localctx, 7);
				{
				setState(29);
				match(TRUE);
				}
				break;
			case FALSE:
				enterOuterAlt(_localctx, 8);
				{
				setState(30);
				match(FALSE);
				}
				break;
			case NULL:
				enterOuterAlt(_localctx, 9);
				{
				setState(31);
				match(NULL);
				}
				break;
			case INFINITY:
			case NAN:
			case PLUS:
			case MINUS:
				enterOuterAlt(_localctx, 10);
				{
				setState(32);
				literal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class TripleSingleStringContext extends ParserRuleContext {
		public TerminalNode TRIPLE_S_OPEN() { return getToken(Json5Parser.TRIPLE_S_OPEN, 0); }
		public TerminalNode TRIPLE_S_CLOSE() { return getToken(Json5Parser.TRIPLE_S_CLOSE, 0); }
		public List<TerminalNode> TRIPLE_S_BODY() { return getTokens(Json5Parser.TRIPLE_S_BODY); }
		public TerminalNode TRIPLE_S_BODY(int i) {
			return getToken(Json5Parser.TRIPLE_S_BODY, i);
		}
		public TripleSingleStringContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_tripleSingleString; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterTripleSingleString(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitTripleSingleString(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitTripleSingleString(this);
			else return visitor.visitChildren(this);
		}
	}

	public final TripleSingleStringContext tripleSingleString() throws RecognitionException {
		TripleSingleStringContext _localctx = new TripleSingleStringContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_tripleSingleString);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(35);
			match(TRIPLE_S_OPEN);
			setState(39);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==TRIPLE_S_BODY) {
				{
				{
				setState(36);
				match(TRIPLE_S_BODY);
				}
				}
				setState(41);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(42);
			match(TRIPLE_S_CLOSE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class TripleDoubleStringContext extends ParserRuleContext {
		public TerminalNode TRIPLE_D_OPEN() { return getToken(Json5Parser.TRIPLE_D_OPEN, 0); }
		public TerminalNode TRIPLE_D_CLOSE() { return getToken(Json5Parser.TRIPLE_D_CLOSE, 0); }
		public List<TerminalNode> TRIPLE_D_BODY() { return getTokens(Json5Parser.TRIPLE_D_BODY); }
		public TerminalNode TRIPLE_D_BODY(int i) {
			return getToken(Json5Parser.TRIPLE_D_BODY, i);
		}
		public TripleDoubleStringContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_tripleDoubleString; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterTripleDoubleString(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitTripleDoubleString(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitTripleDoubleString(this);
			else return visitor.visitChildren(this);
		}
	}

	public final TripleDoubleStringContext tripleDoubleString() throws RecognitionException {
		TripleDoubleStringContext _localctx = new TripleDoubleStringContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_tripleDoubleString);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(44);
			match(TRIPLE_D_OPEN);
			setState(48);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==TRIPLE_D_BODY) {
				{
				{
				setState(45);
				match(TRIPLE_D_BODY);
				}
				}
				setState(50);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(51);
			match(TRIPLE_D_CLOSE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LiteralContext extends ParserRuleContext {
		public TerminalNode INFINITY() { return getToken(Json5Parser.INFINITY, 0); }
		public TerminalNode NAN() { return getToken(Json5Parser.NAN, 0); }
		public SignedLiteralContext signedLiteral() {
			return getRuleContext(SignedLiteralContext.class,0);
		}
		public LiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterLiteral(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitLiteral(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitLiteral(this);
			else return visitor.visitChildren(this);
		}
	}

	public final LiteralContext literal() throws RecognitionException {
		LiteralContext _localctx = new LiteralContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_literal);
		try {
			setState(56);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case INFINITY:
				enterOuterAlt(_localctx, 1);
				{
				setState(53);
				match(INFINITY);
				}
				break;
			case NAN:
				enterOuterAlt(_localctx, 2);
				{
				setState(54);
				match(NAN);
				}
				break;
			case PLUS:
			case MINUS:
				enterOuterAlt(_localctx, 3);
				{
				setState(55);
				signedLiteral();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class SignedLiteralContext extends ParserRuleContext {
		public TerminalNode PLUS() { return getToken(Json5Parser.PLUS, 0); }
		public TerminalNode INFINITY() { return getToken(Json5Parser.INFINITY, 0); }
		public TerminalNode MINUS() { return getToken(Json5Parser.MINUS, 0); }
		public TerminalNode NAN() { return getToken(Json5Parser.NAN, 0); }
		public SignedLiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_signedLiteral; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterSignedLiteral(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitSignedLiteral(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitSignedLiteral(this);
			else return visitor.visitChildren(this);
		}
	}

	public final SignedLiteralContext signedLiteral() throws RecognitionException {
		SignedLiteralContext _localctx = new SignedLiteralContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_signedLiteral);
		try {
			setState(66);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(58);
				match(PLUS);
				setState(59);
				match(INFINITY);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(60);
				match(MINUS);
				setState(61);
				match(INFINITY);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(62);
				match(PLUS);
				setState(63);
				match(NAN);
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(64);
				match(MINUS);
				setState(65);
				match(NAN);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ObjectContext extends ParserRuleContext {
		public TerminalNode LBRACE() { return getToken(Json5Parser.LBRACE, 0); }
		public TerminalNode RBRACE() { return getToken(Json5Parser.RBRACE, 0); }
		public List<MemberContext> member() {
			return getRuleContexts(MemberContext.class);
		}
		public MemberContext member(int i) {
			return getRuleContext(MemberContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(Json5Parser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(Json5Parser.COMMA, i);
		}
		public ObjectContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_object; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterObject(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitObject(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitObject(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ObjectContext object() throws RecognitionException {
		ObjectContext _localctx = new ObjectContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_object);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(68);
			match(LBRACE);
			setState(80);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 66846720L) != 0)) {
				{
				setState(69);
				member();
				setState(74);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(70);
						match(COMMA);
						setState(71);
						member();
						}
						} 
					}
					setState(76);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
				}
				setState(78);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COMMA) {
					{
					setState(77);
					match(COMMA);
					}
				}

				}
			}

			setState(82);
			match(RBRACE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class MemberContext extends ParserRuleContext {
		public KeyContext key() {
			return getRuleContext(KeyContext.class,0);
		}
		public TerminalNode COLON() { return getToken(Json5Parser.COLON, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public MemberContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_member; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterMember(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitMember(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitMember(this);
			else return visitor.visitChildren(this);
		}
	}

	public final MemberContext member() throws RecognitionException {
		MemberContext _localctx = new MemberContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_member);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(84);
			key();
			setState(85);
			match(COLON);
			setState(86);
			value();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class KeyContext extends ParserRuleContext {
		public TerminalNode IdentifierName() { return getToken(Json5Parser.IdentifierName, 0); }
		public TerminalNode TRUE() { return getToken(Json5Parser.TRUE, 0); }
		public TerminalNode FALSE() { return getToken(Json5Parser.FALSE, 0); }
		public TerminalNode NULL() { return getToken(Json5Parser.NULL, 0); }
		public TerminalNode INFINITY() { return getToken(Json5Parser.INFINITY, 0); }
		public TerminalNode NAN() { return getToken(Json5Parser.NAN, 0); }
		public TerminalNode STRING() { return getToken(Json5Parser.STRING, 0); }
		public TerminalNode NUMBER() { return getToken(Json5Parser.NUMBER, 0); }
		public KeyContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_key; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterKey(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitKey(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitKey(this);
			else return visitor.visitChildren(this);
		}
	}

	public final KeyContext key() throws RecognitionException {
		KeyContext _localctx = new KeyContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_key);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(88);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 66846720L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ArrayContext extends ParserRuleContext {
		public TerminalNode LBRACK() { return getToken(Json5Parser.LBRACK, 0); }
		public TerminalNode RBRACK() { return getToken(Json5Parser.RBRACK, 0); }
		public List<ValueContext> value() {
			return getRuleContexts(ValueContext.class);
		}
		public ValueContext value(int i) {
			return getRuleContext(ValueContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(Json5Parser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(Json5Parser.COMMA, i);
		}
		public ArrayContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_array; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).enterArray(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof Json5ParserListener ) ((Json5ParserListener)listener).exitArray(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof Json5ParserVisitor ) return ((Json5ParserVisitor<? extends T>)visitor).visitArray(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ArrayContext array() throws RecognitionException {
		ArrayContext _localctx = new ArrayContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_array);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(90);
			match(LBRACK);
			setState(102);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 13253739264L) != 0)) {
				{
				setState(91);
				value();
				setState(96);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,8,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(92);
						match(COMMA);
						setState(93);
						value();
						}
						} 
					}
					setState(98);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,8,_ctx);
				}
				setState(100);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COMMA) {
					{
					setState(99);
					match(COMMA);
					}
				}

				}
			}

			setState(104);
			match(RBRACK);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static final String _serializedATN =
		"\u0004\u0001\"k\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0003\u0001\"\b\u0001\u0001\u0002"+
		"\u0001\u0002\u0005\u0002&\b\u0002\n\u0002\f\u0002)\t\u0002\u0001\u0002"+
		"\u0001\u0002\u0001\u0003\u0001\u0003\u0005\u0003/\b\u0003\n\u0003\f\u0003"+
		"2\t\u0003\u0001\u0003\u0001\u0003\u0001\u0004\u0001\u0004\u0001\u0004"+
		"\u0003\u00049\b\u0004\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005"+
		"\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005\u0003\u0005C\b\u0005"+
		"\u0001\u0006\u0001\u0006\u0001\u0006\u0001\u0006\u0005\u0006I\b\u0006"+
		"\n\u0006\f\u0006L\t\u0006\u0001\u0006\u0003\u0006O\b\u0006\u0003\u0006"+
		"Q\b\u0006\u0001\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\u0007"+
		"\u0001\u0007\u0001\b\u0001\b\u0001\t\u0001\t\u0001\t\u0001\t\u0005\t_"+
		"\b\t\n\t\f\tb\t\t\u0001\t\u0003\te\b\t\u0003\tg\b\t\u0001\t\u0001\t\u0001"+
		"\t\u0000\u0000\n\u0000\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0000"+
		"\u0001\u0001\u0000\u0012\u0019v\u0000\u0014\u0001\u0000\u0000\u0000\u0002"+
		"!\u0001\u0000\u0000\u0000\u0004#\u0001\u0000\u0000\u0000\u0006,\u0001"+
		"\u0000\u0000\u0000\b8\u0001\u0000\u0000\u0000\nB\u0001\u0000\u0000\u0000"+
		"\fD\u0001\u0000\u0000\u0000\u000eT\u0001\u0000\u0000\u0000\u0010X\u0001"+
		"\u0000\u0000\u0000\u0012Z\u0001\u0000\u0000\u0000\u0014\u0015\u0003\u0002"+
		"\u0001\u0000\u0015\u0016\u0005\u0000\u0000\u0001\u0016\u0001\u0001\u0000"+
		"\u0000\u0000\u0017\"\u0003\f\u0006\u0000\u0018\"\u0003\u0012\t\u0000\u0019"+
		"\"\u0005\u0012\u0000\u0000\u001a\"\u0003\u0004\u0002\u0000\u001b\"\u0003"+
		"\u0006\u0003\u0000\u001c\"\u0005\u0013\u0000\u0000\u001d\"\u0005\u0014"+
		"\u0000\u0000\u001e\"\u0005\u0015\u0000\u0000\u001f\"\u0005\u0016\u0000"+
		"\u0000 \"\u0003\b\u0004\u0000!\u0017\u0001\u0000\u0000\u0000!\u0018\u0001"+
		"\u0000\u0000\u0000!\u0019\u0001\u0000\u0000\u0000!\u001a\u0001\u0000\u0000"+
		"\u0000!\u001b\u0001\u0000\u0000\u0000!\u001c\u0001\u0000\u0000\u0000!"+
		"\u001d\u0001\u0000\u0000\u0000!\u001e\u0001\u0000\u0000\u0000!\u001f\u0001"+
		"\u0000\u0000\u0000! \u0001\u0000\u0000\u0000\"\u0003\u0001\u0000\u0000"+
		"\u0000#\'\u0005\b\u0000\u0000$&\u0005\u0001\u0000\u0000%$\u0001\u0000"+
		"\u0000\u0000&)\u0001\u0000\u0000\u0000\'%\u0001\u0000\u0000\u0000\'(\u0001"+
		"\u0000\u0000\u0000(*\u0001\u0000\u0000\u0000)\'\u0001\u0000\u0000\u0000"+
		"*+\u0005\u0002\u0000\u0000+\u0005\u0001\u0000\u0000\u0000,0\u0005\t\u0000"+
		"\u0000-/\u0005\u0003\u0000\u0000.-\u0001\u0000\u0000\u0000/2\u0001\u0000"+
		"\u0000\u00000.\u0001\u0000\u0000\u000001\u0001\u0000\u0000\u000013\u0001"+
		"\u0000\u0000\u000020\u0001\u0000\u0000\u000034\u0005\u0004\u0000\u0000"+
		"4\u0007\u0001\u0000\u0000\u000059\u0005\u0017\u0000\u000069\u0005\u0018"+
		"\u0000\u000079\u0003\n\u0005\u000085\u0001\u0000\u0000\u000086\u0001\u0000"+
		"\u0000\u000087\u0001\u0000\u0000\u00009\t\u0001\u0000\u0000\u0000:;\u0005"+
		" \u0000\u0000;C\u0005\u0017\u0000\u0000<=\u0005!\u0000\u0000=C\u0005\u0017"+
		"\u0000\u0000>?\u0005 \u0000\u0000?C\u0005\u0018\u0000\u0000@A\u0005!\u0000"+
		"\u0000AC\u0005\u0018\u0000\u0000B:\u0001\u0000\u0000\u0000B<\u0001\u0000"+
		"\u0000\u0000B>\u0001\u0000\u0000\u0000B@\u0001\u0000\u0000\u0000C\u000b"+
		"\u0001\u0000\u0000\u0000DP\u0005\u001a\u0000\u0000EJ\u0003\u000e\u0007"+
		"\u0000FG\u0005\u001f\u0000\u0000GI\u0003\u000e\u0007\u0000HF\u0001\u0000"+
		"\u0000\u0000IL\u0001\u0000\u0000\u0000JH\u0001\u0000\u0000\u0000JK\u0001"+
		"\u0000\u0000\u0000KN\u0001\u0000\u0000\u0000LJ\u0001\u0000\u0000\u0000"+
		"MO\u0005\u001f\u0000\u0000NM\u0001\u0000\u0000\u0000NO\u0001\u0000\u0000"+
		"\u0000OQ\u0001\u0000\u0000\u0000PE\u0001\u0000\u0000\u0000PQ\u0001\u0000"+
		"\u0000\u0000QR\u0001\u0000\u0000\u0000RS\u0005\u001b\u0000\u0000S\r\u0001"+
		"\u0000\u0000\u0000TU\u0003\u0010\b\u0000UV\u0005\u001e\u0000\u0000VW\u0003"+
		"\u0002\u0001\u0000W\u000f\u0001\u0000\u0000\u0000XY\u0007\u0000\u0000"+
		"\u0000Y\u0011\u0001\u0000\u0000\u0000Zf\u0005\u001c\u0000\u0000[`\u0003"+
		"\u0002\u0001\u0000\\]\u0005\u001f\u0000\u0000]_\u0003\u0002\u0001\u0000"+
		"^\\\u0001\u0000\u0000\u0000_b\u0001\u0000\u0000\u0000`^\u0001\u0000\u0000"+
		"\u0000`a\u0001\u0000\u0000\u0000ad\u0001\u0000\u0000\u0000b`\u0001\u0000"+
		"\u0000\u0000ce\u0005\u001f\u0000\u0000dc\u0001\u0000\u0000\u0000de\u0001"+
		"\u0000\u0000\u0000eg\u0001\u0000\u0000\u0000f[\u0001\u0000\u0000\u0000"+
		"fg\u0001\u0000\u0000\u0000gh\u0001\u0000\u0000\u0000hi\u0005\u001d\u0000"+
		"\u0000i\u0013\u0001\u0000\u0000\u0000\u000b!\'08BJNP`df";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}