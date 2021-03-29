import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { MemlC } from './core'
import { Parser } from './parser/Parser'
import { AstPrinter } from './parser/Printer'
import { Scanner } from './scanner/Scanner'

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
    '(Page (group (head (group (title Hello World!)))))'
  )
  @TestCase(
    'Basic full',
    '(head (title "Hello World!")) (body (h1 "Hello world!"))',
    '(Page (group (head (group (title Hello World!)))) (group (body (group (h1 Hello world!)))))'
  )
  @TestCase(
    'Basic multi-tag',
    '(head (title "Hello World!")) (body (h1 "Hello world!") (p "This page was created using trickypr\'s MEML translator!"))',
    "(Page (group (head (group (title Hello World!)))) (group (body (group (h1 Hello world!)) (group (p This page was created using trickypr's MEML translator!)))))"
  )
  @TestCase(
    'Basic addition',
    '(head (title "Hello World!")) (body (h1 "1 + 1 = " 1 + 1))',
    '(Page (group (head (group (title Hello World!)))) (group (body (group (h1 1 + 1 =  (+ 1)) 1 1))))))'
  )
  parser(source: string, out: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    const expression = parser.parse()

    const printed = new AstPrinter().print(expression)

    expect.toBeEqual(printed, out)
  }
}
