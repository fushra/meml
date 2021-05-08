"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    constructor(type, lexeme, literal, line, context) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.context = context;
    }
    toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}
exports.Token = Token;
//# sourceMappingURL=Token.js.map