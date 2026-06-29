// Generated from /Users/zfs/work/cursor_space/antlr4_help/src/grammars/json5/Json5Parser.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link Json5Parser}.
 */
public interface Json5ParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link Json5Parser#json5}.
	 * @param ctx the parse tree
	 */
	void enterJson5(Json5Parser.Json5Context ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#json5}.
	 * @param ctx the parse tree
	 */
	void exitJson5(Json5Parser.Json5Context ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#value}.
	 * @param ctx the parse tree
	 */
	void enterValue(Json5Parser.ValueContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#value}.
	 * @param ctx the parse tree
	 */
	void exitValue(Json5Parser.ValueContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#tripleSingleString}.
	 * @param ctx the parse tree
	 */
	void enterTripleSingleString(Json5Parser.TripleSingleStringContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#tripleSingleString}.
	 * @param ctx the parse tree
	 */
	void exitTripleSingleString(Json5Parser.TripleSingleStringContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#tripleDoubleString}.
	 * @param ctx the parse tree
	 */
	void enterTripleDoubleString(Json5Parser.TripleDoubleStringContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#tripleDoubleString}.
	 * @param ctx the parse tree
	 */
	void exitTripleDoubleString(Json5Parser.TripleDoubleStringContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#literal}.
	 * @param ctx the parse tree
	 */
	void enterLiteral(Json5Parser.LiteralContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#literal}.
	 * @param ctx the parse tree
	 */
	void exitLiteral(Json5Parser.LiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#signedLiteral}.
	 * @param ctx the parse tree
	 */
	void enterSignedLiteral(Json5Parser.SignedLiteralContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#signedLiteral}.
	 * @param ctx the parse tree
	 */
	void exitSignedLiteral(Json5Parser.SignedLiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#object}.
	 * @param ctx the parse tree
	 */
	void enterObject(Json5Parser.ObjectContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#object}.
	 * @param ctx the parse tree
	 */
	void exitObject(Json5Parser.ObjectContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#member}.
	 * @param ctx the parse tree
	 */
	void enterMember(Json5Parser.MemberContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#member}.
	 * @param ctx the parse tree
	 */
	void exitMember(Json5Parser.MemberContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#key}.
	 * @param ctx the parse tree
	 */
	void enterKey(Json5Parser.KeyContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#key}.
	 * @param ctx the parse tree
	 */
	void exitKey(Json5Parser.KeyContext ctx);
	/**
	 * Enter a parse tree produced by {@link Json5Parser#array}.
	 * @param ctx the parse tree
	 */
	void enterArray(Json5Parser.ArrayContext ctx);
	/**
	 * Exit a parse tree produced by {@link Json5Parser#array}.
	 * @param ctx the parse tree
	 */
	void exitArray(Json5Parser.ArrayContext ctx);
}