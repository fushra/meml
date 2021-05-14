import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { MemlC } from './core'
import { Parser } from './parser/Parser'
import { AstPrinter } from './parser/Printer'
import { Scanner } from './scanner/Scanner'
import { Web } from './targets/Web'

@TestSuite('Core tests')
export class MemlCTests {
  @Test('Construct')
  construct() {
    new MemlC()
  }

  @Test('Run from file')
  runFile() {
    const memlC = new MemlC()
    memlC.runFile('./examples/helloWorld.meml')
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

  @Test('Full pass')
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
  full(source: string, out: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    const expression = parser.parse()
    const web = new Web(__dirname + '/void.meml')
    const html = web.convert(expression)

    expect.toBeEqual(html, out)
  }
}
