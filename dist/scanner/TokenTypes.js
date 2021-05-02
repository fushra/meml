"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Single-character tokens.
    TokenType["LEFT_PAREN"] = "leftParen";
    TokenType["RIGHT_PAREN"] = "rightParen";
    TokenType["MINUS"] = "minus";
    TokenType["PLUS"] = "plus";
    TokenType["SLASH"] = "slash";
    TokenType["STAR"] = "star";
    TokenType["COMMA"] = "comma";
    // One or two character tokens.
    TokenType["BANG"] = "bang";
    TokenType["BANG_EQUAL"] = "bangEqual";
    TokenType["EQUAL"] = "equal";
    TokenType["EQUAL_EQUAL"] = "equalEqual";
    TokenType["GREATER"] = "greater";
    TokenType["GREATER_EQUAL"] = "greaterEqual";
    TokenType["LESS"] = "less";
    TokenType["LESS_EQUAL"] = "lessEqual";
    // Literals.
    TokenType["IDENTIFIER"] = "identifier";
    TokenType["STRING"] = "string";
    TokenType["NUMBER"] = "number";
    TokenType["TAG"] = "tag";
    TokenType["FALSE"] = "false";
    TokenType["TRUE"] = "true";
    TokenType["NULL"] = "null";
    // Keywords
    TokenType["COMPONENT"] = "component";
    TokenType["EXPORT"] = "export";
    TokenType["IMPORT"] = "import";
    TokenType["FROM"] = "from";
    TokenType["EOF"] = "eof";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//# sourceMappingURL=TokenTypes.js.map