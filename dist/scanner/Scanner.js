"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const core_1 = require("../core");
const Token_1 = require("./Token");
const TokenTypes_1 = require("./TokenTypes");
class Scanner {
    constructor(source, file = '') {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        if (typeof source != 'string')
            throw new Error('Expected type string, got: ' + typeof source);
        this.source = source;
        this.file = file;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token_1.Token(TokenTypes_1.TokenType.EOF, '', null, this.line, ''));
        return this.tokens;
    }
    scanToken() {
        const c = this.advance();
        switch (c) {
            case '(':
                this.addToken(TokenTypes_1.TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenTypes_1.TokenType.RIGHT_PAREN);
                break;
            case '-':
                this.addToken(TokenTypes_1.TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenTypes_1.TokenType.PLUS);
                break;
            case '*':
                this.addToken(TokenTypes_1.TokenType.STAR);
                break;
            case ',':
                this.addToken(TokenTypes_1.TokenType.COMMA);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenTypes_1.TokenType.BANG_EQUAL : TokenTypes_1.TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenTypes_1.TokenType.EQUAL_EQUAL : TokenTypes_1.TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenTypes_1.TokenType.LESS_EQUAL : TokenTypes_1.TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenTypes_1.TokenType.GREATER_EQUAL : TokenTypes_1.TokenType.GREATER);
                break;
            // Longer lexemes
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd())
                        this.advance();
                }
                else {
                    this.addToken(TokenTypes_1.TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
            case '\n':
                this.line++;
                break;
            // Strings
            case '"':
            case "'":
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    console.log(this.file);
                    core_1.MemlCore.error(this.line, `Unexpected character ${c}`, this.file);
                }
                break;
        }
    }
    isAlpha(c) {
        return (((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_') && c != ' ');
    }
    isAlphaNumeric(c) {
        return (this.isAlpha(c) || this.isDigit(c)) && c !== ' ';
    }
    identifier() {
        let text = this.peekLast();
        while (this.isAlphaNumeric(this.peek()))
            text += this.advance();
        let type = TokenTypes_1.TokenType.IDENTIFIER;
        switch (text) {
            case 'component':
                type = TokenTypes_1.TokenType.COMPONENT;
                break;
            case 'import':
                type = TokenTypes_1.TokenType.IMPORT;
                break;
            case 'from':
                type = TokenTypes_1.TokenType.FROM;
                break;
            case 'export':
                type = TokenTypes_1.TokenType.EXPORT;
                break;
            case 'false':
                type = TokenTypes_1.TokenType.FALSE;
                break;
            case 'true':
                type = TokenTypes_1.TokenType.TRUE;
                break;
            case 'null':
                type = TokenTypes_1.TokenType.NULL;
                break;
            default:
                break;
        }
        this.addToken(type, text);
    }
    number() {
        while (this.isDigit(this.peek()))
            this.advance();
        // Look for a fractional part.
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();
            while (this.isDigit(this.peek()))
                this.advance();
        }
        this.addToken(TokenTypes_1.TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    string() {
        const stringOpening = this.peekLast();
        while (this.peek() != stringOpening && !this.isAtEnd()) {
            if (this.peek() == '\n')
                this.line++;
            if (this.peek() == '\\') {
                // This character is an escaped character (like a quote) and thus should be ignored
                this.advance(); // Consume the escape
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            core_1.MemlCore.error(this.line, 'Unterminated string.', this.file);
            return;
        }
        // The closing ".
        this.advance();
        // Trim the surrounding quotes.
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenTypes_1.TokenType.STRING, value);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length)
            return '\0';
        return this.source.charAt(this.current + 1);
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.source.charAt(this.current);
    }
    peekLast() {
        return this.source.charAt(this.current - 1);
    }
    match(char) {
        if (this.isAtEnd())
            return false;
        if (this.source.charAt(this.current) != char)
            return false;
        this.current++;
        return true;
    }
    advance() {
        return this.source.charAt(this.current++);
    }
    addToken(type, literal = null) {
        const text = this.source.substring(this.start, this.current);
        const context = this.source.substring(this.start - 40, this.current + 40);
        this.tokens.push(new Token_1.Token(type, text, literal, this.line, context));
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=Scanner.js.map