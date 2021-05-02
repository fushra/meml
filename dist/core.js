"use strict";
// Note that this is loosely based on the crafting interpreters book, so it will
// have a similar code structure. We are not using java because java is pain
// Maybe one day I will rewrite this in rust or maybe even c to make it work natively
// but at the moment I don't really care
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemlC = void 0;
const fs_1 = require("fs");
const chalk_1 = require("chalk");
const Web_1 = require("./targets/Web");
const Parser_1 = require("./parser/Parser");
const Scanner_1 = require("./scanner/Scanner");
const TokenTypes_1 = require("./scanner/TokenTypes");
class MemlC {
    runFile(path) {
        const fileContents = fs_1.readFileSync(path).toString();
        this.translate(fileContents, path);
        return MemlC.hadError;
    }
    run(source) {
        return this.translate(source, './runit.meml');
    }
    parseFile(path) {
        const fileContents = fs_1.readFileSync(path).toString();
        return this.parse(fileContents);
    }
    parse(source) {
        const scanner = new Scanner_1.Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser_1.Parser(tokens);
        return parser.parse();
    }
    translate(source, path) {
        const scanner = new Scanner_1.Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser_1.Parser(tokens);
        const expression = parser.parse();
        const converter = new Web_1.Web(path);
        // Bail if there was a syntax error
        if (MemlC.hadError)
            return;
        return converter.convert(expression);
    }
    sleep(time) {
        return new Promise((res) => setTimeout(res, time));
    }
    static errorAtToken(token, message) {
        if (token.type === TokenTypes_1.TokenType.EOF) {
            this.report(token.line, ' at end', message);
        }
        else {
            this.report(token.line, ` at '${token.lexeme}'`, message, token.context);
        }
    }
    static error(line, message) {
        this.report(line, '', message);
    }
    static linterAtToken(token, message) {
        this.warn(token.line, 'Linter', ` at '${token.lexeme}'`, message, token.context);
    }
    static report(line, where, message, context = '') {
        console.error(chalk_1.red(`[line ${line}] Error${where}: ${message}\n${this.formatContext(context)}`));
        this.hadError = true;
        throw new Error();
    }
    static warn(line, type, where, message, context = '') {
        console.warn(chalk_1.yellow(`[line ${line}] ${type} warning${where}: ${message} \n${this.formatContext(context)}`));
    }
    static formatContext(context) {
        return chalk_1.grey(`    ┃${context.replace(/\n/g, '\n    ┃')}`);
    }
}
exports.MemlC = MemlC;
MemlC.hadError = false;
//# sourceMappingURL=core.js.map