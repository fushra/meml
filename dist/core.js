"use strict";
// Note that this is loosely based on the crafting interpreters book, so it will
// have a similar code structure. We are not using java because java is pain
// Maybe one day I will rewrite this in rust or maybe even c to make it work natively
// but at the moment I don't really care
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemlC = exports.MemlCore = void 0;
const fs_1 = require("./fs");
const { readFileSync } = fs_1.fs;
const chalk_1 = require("chalk");
const Web_1 = require("./targets/Web");
const Parser_1 = require("./parser/Parser");
const Scanner_1 = require("./scanner/Scanner");
const TokenTypes_1 = require("./scanner/TokenTypes");
const MemlLoader_1 = require("./targets/loaders/MemlLoader");
class MemlCore {
    // ------------------------------------------------------------
    // Interpreter stepping function
    tokenize(source, file = '') {
        const scanner = new Scanner_1.Scanner(source, file);
        return scanner.scanTokens();
    }
    parse(tokens, file = '') {
        const parser = new Parser_1.Parser(tokens, file);
        return parser.parse();
    }
    targetWeb(page, path = 'memory.meml') {
        const target = new Web_1.Web(path);
        return target.convert(page);
    }
    tokenizeAndParse(source, file = '') {
        return this.parse(this.tokenize(source, file), file);
    }
    // ------------------------------------------------------------
    // Interpreter full functions
    sourceToWeb(source, path = 'memory.meml') {
        const tokens = this.tokenize(source, path);
        const parsed = this.parse(tokens, path);
        return this.targetWeb(parsed, path);
    }
    fileToWeb(path) {
        return this.sourceToWeb(readFileSync(path).toString(), path);
    }
    // ------------------------------------------------------------
    // Error functions
    static resetErrors() {
        this.hadError = false;
        this.errors = '';
    }
    static errorAtToken(token, message, file = '') {
        if (token.type === TokenTypes_1.TokenType.EOF) {
            this.report(token.line, ' at end', message, '', file);
        }
        else {
            this.report(token.line, ` at '${token.lexeme}'`, message, token.context, file);
        }
    }
    static error(line, message, file = '') {
        this.report(line, '', message, file);
    }
    static linterAtToken(token, message) {
        this.warn(token.line, 'Linter', ` at '${token.lexeme}'`, message, token.context);
    }
    static generalWarning(line, message) {
        this.warn(line, 'General', '', message);
    }
    static report(line, where, message, context = '', file = '') {
        console.error(chalk_1.red(`[line ${line}${file != '' ? ` in file ${file}` : ''}] Error${where}: ${message}\n${chalk_1.grey(this.formatContext(context))}`));
        this.hadError = true;
        this.errors += `[line ${line}${file != '' ? ` in file ${file}` : ''}] Error${where}: ${message}\n${this.formatContext(context)}\n`;
    }
    static warn(line, type, where, message, context = '') {
        console.warn(chalk_1.yellow(`[line ${line}] ${type} warning${where}: ${message} \n${chalk_1.grey(this.formatContext(context))}`));
        this.errors += `[line ${line}] ${type} warning${where}: ${message} \n${this.formatContext(context)}\n`;
    }
    static formatContext(context) {
        return `    ┃${context.replace(/\n/g, '\n    ┃')}`;
    }
}
exports.MemlCore = MemlCore;
MemlCore.hadError = false;
MemlCore.errors = '';
MemlCore.globalLoaders = [new MemlLoader_1.MemlLoader()];
class MemlC extends MemlCore {
    constructor() {
        super();
        console.error('Using MemlC is depreciated. Use the MemlCore class');
    }
}
exports.MemlC = MemlC;
//# sourceMappingURL=core.js.map