import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { MemlCore } from './core'
import { Parser } from './parser/Parser'
import { AstPrinter } from './parser/Printer'
import { Scanner } from './scanner/Scanner'
import { Web } from './targets/Web'

@TestSuite('Core tests')
export class MemlCTests {
  @Test('Construct')
  construct() {
    new MemlCore()
  }

  @Test('Run from file')
  runFile() {
    const memlC = new MemlCore()
    memlC.fileToWeb('./examples/helloWorld.meml')
  }

  @Test('Parser')
  @TestCase(
    'Head only',
    '(head (title "Hello World!"))',
    '(page (head (title (expression Hello World!))))'
  )
  @TestCase(
    'Basic full',
    '(head (title "Hello World!")) (body (h1 "Hello world!"))',
    '(page (head (title (expression Hello World!))) (body (h1 (expression Hello world!))))'
  )
  @TestCase(
    'Basic multi-tag',
    '(head (title "Hello World!")) (body (h1 "Hello world!") (p "This page was created using trickypr\'s MEML translator!"))',
    "(page (head (title (expression Hello World!))) (body (h1 (expression Hello world!)) (p (expression This page was created using trickypr's MEML translator!))))"
  )
  @TestCase(
    'Basic addition',
    '(head (title "Hello World!")) (body (h1 "1 + 1 = " 1 + 1))',
    '(page (head (title (expression Hello World!))) (body (h1 (expression 1 + 1 = ) (expression (+ 1 1)))))'
  )
  parser(source: string, out: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    const expression = parser.parse()

    const printed = new AstPrinter().print(expression)

    expect.toBeEqual(printed, out)
  }

  @Test('End to end')
  @TestCase(
    'Title',
    '(title "Hello world!")',
    '<!DOCTYPE html><html><title>Hello world!</title></html>'
  )
  @TestCase(
    'Meta: description',
    '(meta name="description" content="I make computer programs")',
    '<!DOCTYPE html><html><meta name="description" content="I make computer programs" ></meta></html>'
  )
  @TestCase(
    'Boolean: true',
    '(p true)',
    '<!DOCTYPE html><html><p>true</p></html>'
  )
  @TestCase(
    'Boolean: false',
    '(p false)',
    '<!DOCTYPE html><html><p>false</p></html>'
  )
  @TestCase('null', '(p null)', '<!DOCTYPE html><html><p>null</p></html>')
  @TestCase(
    'export',
    '(component test () (p "test")) (export (test))',
    '<!DOCTYPE html><html></html>'
  )
  @TestCase(
    'Division',
    '(p 5/2.3)',
    '<!DOCTYPE html><html><p>2.173913043478261</p></html>'
  )
  @TestCase(
    'Logic',
    '(p 1 == 1)(p 1 == 2)(p 1 != 2)(p 1 < 2)(p 2 > 1)',
    '<!DOCTYPE html><html><p>true</p><p>false</p><p>true</p><p>true</p><p>true</p></html>'
  )
  @TestCase(
    'Component',
    '(component test () (p "Hello world"))(test)',
    '<!DOCTYPE html><html><!-- Start of meml component: test --><p>Hello world</p><!-- End of meml component: test --></html>'
  )
  async full(source: string, out: string) {
    const c = new MemlCore()
    const html = await c.sourceToWeb(source)

    expect.toBeEqual(html, out)
  }
}
