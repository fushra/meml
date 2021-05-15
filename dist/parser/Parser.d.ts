import { Token } from '../scanner/Token';
import { PageStmt } from './Stmt';
export declare class Parser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    /**
     * page        = ('(' declaration ')')* EOF;
     */
    parse(): PageStmt;
    /**
     * declaration = compDecl
     *             | statement;
     */
    private declaration;
    /**
     * statement   = memlStmt
     *             | expression;
     */
    private statement;
    private componentStmt;
    /**
     * exportDecl  = '(' 'export' '(' destructure ')' ')';
     */
    private exportDecl;
    /**
     * importStmt  = '(' 'import' ((('(' destructure ')') | 'everything') 'from')? STRING ')'
     */
    private importStmt;
    /**
     * memlStmt    = IDENTIFIER memlProp* statement*;
     */
    private memlStmt;
    /**
     * memlProp    → IDENTIFIER
     *             | IDENTIFIER '=' expression;
     */
    private memlProps;
    /**
     * expression  = equality;
     */
    private expression;
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with equality
     *
     * equality    = comparison (('!=' | '==') comparison)*;
     */
    private equality;
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with comparison
     *
     * comparison  = term (('>' | '>=' | '<' | '<=') term)*;
     */
    private comparison;
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with terms
     *
     * term        = factor (('-' | '+') factor)*;
     */
    private term;
    /**
     * This is part of a custom implementation of the binary operation. This function
     * is tasked with factors
     *
     * factor      = unary (('/' | '*') unary)*;
     */
    private factor;
    /**
     * unary       = ('!' | '-') unary
     *             | primary;
     */
    private unary;
    /**
     * primary     = NUMBER | STRING | 'true' | 'false' | 'null'
     *             | '(' expression ')';
     */
    private primary;
    /**
     * destructure = IDENTIFIER ( ',' IDENTIFIER )*;
     */
    private destructure;
    private match;
    private consume;
    private synchronize;
    private error;
    private check;
    private doubleCheck;
    private advance;
    private isAtEnd;
    private peek;
    private doublePeek;
    private previous;
}
