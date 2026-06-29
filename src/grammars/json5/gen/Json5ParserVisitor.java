// Generated from /Users/zfs/work/cursor_space/antlr4_help/src/grammars/json5/Json5Parser.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.tree.ParseTreeVisitor;

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by {@link Json5Parser}.
 *
 * @param <T> The return type of the visit operation. Use {@link Void} for
 * operations with no return type.
 */
public interface Json5ParserVisitor<T> extends ParseTreeVisitor<T> {
	/**
	 * Visit a parse tree produced by {@link Json5Parser#json5}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitJson5(Json5Parser.Json5Context ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#value}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitValue(Json5Parser.ValueContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#tripleSingleString}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitTripleSingleString(Json5Parser.TripleSingleStringContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#tripleDoubleString}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitTripleDoubleString(Json5Parser.TripleDoubleStringContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#literal}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitLiteral(Json5Parser.LiteralContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#signedLiteral}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitSignedLiteral(Json5Parser.SignedLiteralContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#object}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitObject(Json5Parser.ObjectContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#member}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitMember(Json5Parser.MemberContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#key}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitKey(Json5Parser.KeyContext ctx);
	/**
	 * Visit a parse tree produced by {@link Json5Parser#array}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitArray(Json5Parser.ArrayContext ctx);
}