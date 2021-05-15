"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentTests = void 0;
const testyCore_1 = require("testyts/build/testyCore");
const Environment_1 = require("./Environment");
const Token_1 = require("../../scanner/Token");
const TokenTypes_1 = require("../../scanner/TokenTypes");
let EnvironmentTests = class EnvironmentTests {
    construct() {
        new Environment_1.Environment();
    }
    //new Token(TokenType.IDENTIFIER, '', 'test', 3, '')
    define() {
        const env = new Environment_1.Environment();
        env.define('test', 'Hello world!');
    }
    get() {
        const env = new Environment_1.Environment();
        env.define('test', 'Hello world!');
        testyCore_1.expect.toBeEqual(env.get(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, '')), 'Hello world!');
    }
    assign() {
        const env = new Environment_1.Environment();
        env.define('test', 'Hello world!');
        testyCore_1.expect.toBeEqual(env.get(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, '')), 'Hello world!');
        env.assign(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, ''), 'New value');
        testyCore_1.expect.toBeEqual(env.get(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, '')), 'New value');
    }
    shadowing() {
        const env = new Environment_1.Environment();
        env.define('test', 'Hello world!');
        const subEnv = new Environment_1.Environment(env);
        testyCore_1.expect.toBeEqual(subEnv.get(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, '')), 'Hello world!');
        subEnv.assign(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, ''), 'New value');
        testyCore_1.expect.toBeEqual(subEnv.get(new Token_1.Token(TokenTypes_1.TokenType.IDENTIFIER, '', 'test', 3, '')), 'New value');
    }
};
__decorate([
    testyCore_1.Test('Construct')
], EnvironmentTests.prototype, "construct", null);
__decorate([
    testyCore_1.Test('Definition')
], EnvironmentTests.prototype, "define", null);
__decorate([
    testyCore_1.Test('Get')
], EnvironmentTests.prototype, "get", null);
__decorate([
    testyCore_1.Test('Assign')
], EnvironmentTests.prototype, "assign", null);
__decorate([
    testyCore_1.Test('Shadowing')
], EnvironmentTests.prototype, "shadowing", null);
EnvironmentTests = __decorate([
    testyCore_1.TestSuite('Shared: Environment')
], EnvironmentTests);
exports.EnvironmentTests = EnvironmentTests;
//# sourceMappingURL=Environment.test.js.map