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
const core_1 = require("./core");
const Parser_1 = require("./parser/Parser");
const Printer_1 = require("./parser/Printer");
const Scanner_1 = require("./scanner/Scanner");
const Web_1 = require("./targets/Web");
let MemlCTests = class MemlCTests {
    construct() {
        new core_1.MemlC();
    }
    runFile() {
        const memlC = new core_1.MemlC();
        memlC.runFile('./examples/helloWorld.meml');
    }
    parser(source, out) {
        const scanner = new Scanner_1.Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser_1.Parser(tokens);
        const expression = parser.parse();
        const printed = new Printer_1.AstPrinter().print(expression);
        testyCore_1.expect.toBeEqual(printed, out);
    }
    full(source, out) {
        const scanner = new Scanner_1.Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser_1.Parser(tokens);
        const expression = parser.parse();
        const web = new Web_1.Web(__dirname + '/void.meml');
        const html = web.convert(expression);
        testyCore_1.expect.toBeEqual(html, out);
    }
};
__decorate([
    testyCore_1.Test('Construct')
], MemlCTests.prototype, "construct", null);
__decorate([
    testyCore_1.Test('Run from file')
], MemlCTests.prototype, "runFile", null);
__decorate([
    testyCore_1.Test('Parser'),
    testyCore_1.TestCase('Head only', '(head (title "Hello World!"))', '(page (head (title (expression Hello World!))))'),
    testyCore_1.TestCase('Basic full', '(head (title "Hello World!")) (body (h1 "Hello world!"))', '(page (head (title (expression Hello World!))) (body (h1 (expression Hello world!))))'),
    testyCore_1.TestCase('Basic multi-tag', '(head (title "Hello World!")) (body (h1 "Hello world!") (p "This page was created using trickypr\'s MEML translator!"))', "(page (head (title (expression Hello World!))) (body (h1 (expression Hello world!)) (p (expression This page was created using trickypr's MEML translator!))))"),
    testyCore_1.TestCase('Basic addition', '(head (title "Hello World!")) (body (h1 "1 + 1 = " 1 + 1))', '(page (head (title (expression Hello World!))) (body (h1 (expression 1 + 1 = ) (expression (+ 1 1)))))')
], MemlCTests.prototype, "parser", null);
__decorate([
    testyCore_1.Test('Full pass'),
    testyCore_1.TestCase('Title', '(title "Hello world!")', '<!DOCTYPE html><html><title>Hello world!</title></html>'),
    testyCore_1.TestCase('Meta: description', '(meta name="description" content="I make computer programs")', '<!DOCTYPE html><html><meta name="description" content="I make computer programs" ></meta></html>')
], MemlCTests.prototype, "full", null);
MemlCTests = __decorate([
    testyCore_1.TestSuite('Core tests')
], MemlCTests);
exports.MemlCTests = MemlCTests;
//# sourceMappingURL=core.test.js.map