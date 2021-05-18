"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const TokenTypes_1 = require("../scanner/TokenTypes");
const Expr_1 = require("./Expr");
const core_1 = require("../core");
const Stmt_1 = require("./Stmt");
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    /**
     * page        = ('(' declaration ')')* EOF;
     */
    parse() {
        let stmts = [];
        while (!this.isAtEnd()) {
            stmts.push(this.declaration());
        }
        return new Stmt_1.PageStmt(stmts);
    }
    // ===========================================================================
    // This is the parsers logic tree.
    /**
     * declaration = compDecl
     *             | statement;
     */
    declaration() {
        try {
            if (this.doubleCheck(TokenTypes_1.TokenType.COMPONENT))
                return this.componentStmt();
            if (this.doubleCheck(TokenTypes_1.TokenType.EXPORT))
                return this.exportDecl();
            return this.statement();
        }
        catch (err) {
            this.synchronize();
            return null;
        }
    }
    /**
     * statement   = memlStmt
     *             | expression;
     */
    statement() {
        // Check if the next token is an identifier or a tag
        if (this.doubleCheck(TokenTypes_1.TokenType.IDENTIFIER) &&
            this.check(TokenTypes_1.TokenType.LEFT_PAREN)) {
            // Then this is a meml tag and should be passed through
            return this.memlStmt();
        }
        if (this.doubleCheck(TokenTypes_1.TokenType.IMPORT))
            return this.importStmt();
        // Otherwise it is an expression
        return new Stmt_1.ExpressionStmt(this.expression());
    }
    // --------------------------
    // MEML Statements
    componentStmt() {
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket before component');
        this.advance();
        // This will be the name of the component
        const identifier = this.advance();
        let props = new Expr_1.DestructureExpr([]);
        // Consume the brackets before the props
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket before props');
        if (this.check(TokenTypes_1.TokenType.IDENTIFIER)) {
            // Collect the props as a destructure
            props = this.destructure();
        }
        // Consume the parenthesize after the destructure
        this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected closing bracket after props');
        // Collect the meml statement
        const memlStmt = this.memlStmt();
        // Consume the ending parenthesis
        this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected closing bracket after component');
        return new Stmt_1.ComponentStmt(identifier, props, memlStmt);
    }
    /**
     * exportDecl  = '(' 'export' '(' destructure ')' ')';
     */
    exportDecl() {
        // Consume a bunch of the initial structure that we don't care about
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket before export');
        const token = this.advance();
        // Consume the surrounding brackets of the export identifiers
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket before the identifiers to be exported');
        // Grab all of the exports, layed out in a destructure
        const exports = this.destructure();
        // Consume the closing brackets
        this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected closing bracket after the identifiers to be exported');
        this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected closing bracket after export');
        return new Stmt_1.ExportStmt(exports, token);
    }
    /**
     * importStmt  = '(' 'import' ((('(' destructure ')') | 'everything') 'from')? STRING ')'
     */
    importStmt() {
        // Consume a bunch of the initial structure that we don't care about
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket before import');
        this.advance();
        let imports = null;
        let file;
        let fileToken;
        // If there is a string here, we are just importing a file, so we only have a path
        if (this.check(TokenTypes_1.TokenType.STRING)) {
            fileToken = this.advance();
        }
        else {
            // Otherwise this is a full import statement, so we are going to have to parse it properly
            // We need to check if we are importing everything. If we are, there will be an identifier
            // that has the contents of 'everything'
            if (this.check(TokenTypes_1.TokenType.IDENTIFIER)) {
                if (this.peek().literal === 'everything') {
                    imports = 'everything';
                    this.advance();
                }
                else {
                    const token = this.advance();
                    core_1.MemlC.errorAtToken(token, `Unexpected token '${token.literal}'. Try importing using a destructure ( '(import1, import2)' ) or adding the key 'everything'`);
                }
            }
            else {
                // Otherwise, we have a destructure as an import
                this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected ( before destructure');
                imports = this.destructure();
                this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected ( after destructure)');
            }
            this.consume(TokenTypes_1.TokenType.FROM, `Expected 'from' after destructure`);
            fileToken = this.advance();
        }
        this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, 'Expected opening bracket after import');
        file = fileToken.literal;
        return new Stmt_1.ImportStmt(file, fileToken, imports);
    }
    /**
     * memlStmt    = IDENTIFIER memlProp* statement*;
     */
    memlStmt() {
        this.consume(TokenTypes_1.TokenType.LEFT_PAREN, 'Expected opening bracket meml statement');
        const identifier = this.advance();
        const props = [];
        const children = [];
        while (this.match(TokenTypes_1.TokenType.IDENTIFIER)) {
            props.push(this.memlProps());
        }
        while (!this.match(TokenTypes_1.TokenType.RIGHT_PAREN)) {
            children.push(this.statement());
        }
        return new Stmt_1.MemlStmt(identifier, props, children);
    }
    /**
     * memlProp    → IDENTIFIER
     *             | IDENTIFIER '=' expression;
     */
    memlProps() {
        const identifier = this.previous();
        let expression = new Expr_1.LiteralExpr('');
        if (this.match(TokenTypes_1.TokenType.EQUAL)) {
            expression = this.expression();
        }
        return new Expr_1.MemlPropertiesExpr(identifier, expression);
    }
    // --------------------------
    // Expression logic
    /**
     * expression  = equality;
     */
    expression() {
        return this.equality();
    }
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with equality
     *
     * equality    = comparison (('!=' | '==') comparison)*;
     */
    equality() {
        let expr = this.comparison();
        while (this.match(TokenTypes_1.TokenType.BANG_EQUAL, TokenTypes_1.TokenType.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with comparison
     *
     * comparison  = term (('>' | '>=' | '<' | '<=') term)*;
     */
    comparison() {
        let expr = this.term();
        while (this.match(TokenTypes_1.TokenType.GREATER, TokenTypes_1.TokenType.GREATER_EQUAL, TokenTypes_1.TokenType.LESS, TokenTypes_1.TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with terms
     *
     * term        = factor (('-' | '+') factor)*;
     */
    term() {
        let expr = this.factor();
        while (this.match(TokenTypes_1.TokenType.PLUS, TokenTypes_1.TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with factors
     *
     * factor      = unary (('/' | '*') unary)*;
     */
    factor() {
        let expr = this.unary();
        while (this.match(TokenTypes_1.TokenType.SLASH, TokenTypes_1.TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new Expr_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    /**
     * unary       = ('!' | '-') unary
     *             | primary;
     */
    unary() {
        if (this.match(TokenTypes_1.TokenType.BANG, TokenTypes_1.TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new Expr_1.UnaryExpr(operator, right);
        }
        return this.primary();
    }
    /**
     * primary     = NUMBER | STRING | 'true' | 'false' | 'null'
     *             | '(' expression ')';
     */
    primary() {
        if (this.match(TokenTypes_1.TokenType.FALSE))
            return new Expr_1.LiteralExpr(false);
        if (this.match(TokenTypes_1.TokenType.TRUE))
            return new Expr_1.LiteralExpr(true);
        if (this.match(TokenTypes_1.TokenType.NULL))
            return new Expr_1.LiteralExpr(null);
        if (this.match(TokenTypes_1.TokenType.NUMBER, TokenTypes_1.TokenType.STRING)) {
            return new Expr_1.LiteralExpr(this.previous().literal);
        }
        if (this.match(TokenTypes_1.TokenType.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TokenTypes_1.TokenType.RIGHT_PAREN, `Expect ')' after expression.`);
            return new Expr_1.GroupingExpr(expr);
        }
        if (this.match(TokenTypes_1.TokenType.IDENTIFIER))
            return new Expr_1.IdentifierExpr(this.previous());
        this.error(this.peek(), 'Expected expression.');
    }
    // --------------------------
    // Other datatypes
    /**
     * destructure = IDENTIFIER ( ',' IDENTIFIER )*;
     */
    destructure() {
        // Consume the first identifier
        const identifiers = [this.advance()];
        // If there is a comma, there will be another identifier
        while (this.peek().type === TokenTypes_1.TokenType.COMMA) {
            // Consume the comma token
            this.advance();
            // Consume the next identifier and add it to the array
            identifiers.push(this.advance());
        }
        return new Expr_1.DestructureExpr(identifiers);
    }
    // ===========================================================================
    // Utilities
    match(...types) {
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    consume(token, message) {
        if (this.check(token))
            return this.advance();
        this.error(this.peek(), message);
    }
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === TokenTypes_1.TokenType.RIGHT_PAREN)
                return;
            switch (this.peek().type) {
                case TokenTypes_1.TokenType.TAG:
                    return;
            }
            this.advance();
        }
    }
    error(token, message) {
        core_1.MemlC.errorAtToken(token, message);
        this.advance();
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    doubleCheck(type) {
        if (this.isAtEnd())
            return false;
        return this.doublePeek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === TokenTypes_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    doublePeek() {
        return this.tokens[this.current + 1];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map