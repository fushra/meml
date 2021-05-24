"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemlCTests = void 0;
const testyCore_1 = require("testyts/build/testyCore");
const Token_1 = require("./Token");
const TokenTypes_1 = require("./TokenTypes");
let MemlCTests = class MemlCTests {
    construct() {
        new Token_1.Token(TokenTypes_1.TokenType.LEFT_PAREN, '', '', 5, '');
    }
    toString() {
        const token = new Token_1.Token(TokenTypes_1.TokenType.LEFT_PAREN, '(test)', '(', 5, '');
        testyCore_1.expect.toBeEqual(token.toString(), 'leftParen (test) (');
    }
};
__decorate([
    testyCore_1.Test('Construct')
], MemlCTests.prototype, "construct", null);
__decorate([
    testyCore_1.Test('To string')
], MemlCTests.prototype, "toString", null);
MemlCTests = __decorate([
    testyCore_1.TestSuite('Token tests')
], MemlCTests);
exports.MemlCTests = MemlCTests;
//# sourceMappingURL=Token.test.js.map