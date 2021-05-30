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
let MemlCTests = class MemlCTests {
    construct() {
        new core_1.MemlCore();
    }
    runFile() {
        const memlC = new core_1.MemlCore();
        memlC.fileToWeb('./examples/helloWorld.meml');
    }
    parser(source, out) {
        const scanner = new Scanner_1.Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser_1.Parser(tokens);
        const expression = parser.parse();
        const printed = new Printer_1.AstPrinter().print(expression);
        testyCore_1.expect.toBeEqual(printed, out);
    }
    async full(source, out) {
        const c = new core_1.MemlCore();
        const html = await c.sourceToWeb(source);
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
    testyCore_1.Test('End to end'),
    testyCore_1.TestCase('Title', '(title "Hello world!")', '<!DOCTYPE html><html><title>Hello world!</title></html>'),
    testyCore_1.TestCase('Meta: description', '(meta name="description" content="I make computer programs")', '<!DOCTYPE html><html><meta name="description" content="I make computer programs" ></meta></html>'),
    testyCore_1.TestCase('Boolean: true', '(p true)', '<!DOCTYPE html><html><p>true</p></html>'),
    testyCore_1.TestCase('Boolean: false', '(p false)', '<!DOCTYPE html><html><p>false</p></html>'),
    testyCore_1.TestCase('null', '(p null)', '<!DOCTYPE html><html><p>null</p></html>'),
    testyCore_1.TestCase('export', '(component test () (p "test")) (export (test))', '<!DOCTYPE html><html></html>'),
    testyCore_1.TestCase('Division', '(p 5/2.3)', '<!DOCTYPE html><html><p>2.173913043478261</p></html>'),
    testyCore_1.TestCase('Logic', '(p 1 == 1)(p 1 == 2)(p 1 != 2)(p 1 < 2)(p 2 > 1)', '<!DOCTYPE html><html><p>true</p><p>false</p><p>true</p><p>true</p><p>true</p></html>'),
    testyCore_1.TestCase('Component', '(component test () (p "Hello world"))(test)', '<!DOCTYPE html><html><!-- Start of meml component: test --><p>Hello world</p><!-- End of meml component: test --></html>')
], MemlCTests.prototype, "full", null);
MemlCTests = __decorate([
    testyCore_1.TestSuite('Core tests')
], MemlCTests);
exports.MemlCTests = MemlCTests;
//# sourceMappingURL=core.test.js.map