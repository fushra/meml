import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { MemlC, MemlCore } from './core'
import { Parser } from './parser/Parser'
import { AstPrinter } from './parser/Printer'
import { Scanner } from './scanner/Scanner'
import { Token } from './scanner/Token'
import { TokenType } from './scanner/TokenTypes'

@TestSuite('Core tests')
export class MemlCTests {
  @Test('Construct')
  construct() {
    new MemlCore()
  }

  @Test('Old constructor')
  oldConstruct() {
    new MemlC()
  }

  // -----------------------------------------------------------------------------
  //                               Error tests
  // -----------------------------------------------------------------------------

  @Test('Reset Errors')
  resetErrors() {
    // Emulate having an error
    MemlCore.errors = 'This is some error text'
    MemlCore.hadError = true

    // Make sure that these values were properly stored
    expect.toBeEqual(MemlCore.errors, 'This is some error text')
    expect.toBeTrue(MemlCore.hadError)

    // Reset the errors
    MemlCore.resetErrors()

    // Make sure they reset
    expect.toBeEqual(MemlCore.errors, '')
    expect.toBeFalse(MemlCore.hadError)
  }

  @Test('Error at token')
  errorAtToken() {
    MemlCore.errorAtToken(
      new Token(TokenType.IDENTIFIER, 'a', 'b', 3, 'Example context'),
      'Test error'
    )

    expect.toBeTrue(MemlCore.hadError)
    expect.toBeEqual(
      MemlCore.errors,
      "[line 3] Error at 'a': Test error\n    ┃Example context\n"
    )
  }

  @Test('Run from file')
  async runFile() {
    const memlC = new MemlCore()
    await memlC.fileToWeb('./examples/helloWorld.meml')
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
  @TestCase(
    'Groupings',
    '(p (1 + 6) * 5)',
    '<!DOCTYPE html><html><p>35</p></html>'
  )
  @TestCase(
    'Logical inversion',
    '(p !false)',
    '<!DOCTYPE html><html><p>true</p></html>'
  )
  @TestCase(
    'Local Import Everything',
    '(import everything from "./examples/nav.meml") (navBar)',
    '<!DOCTYPE html><html><!-- Start of meml component: navBar --><div>hello world from the nav</div><!-- End of meml component: navBar --></html>'
  )
  @TestCase(
    'Remote Import Everything',
    '(import everything from "https://raw.githubusercontent.com/fushra/meml/main/examples/nav.meml") (navBar)',
    '<!DOCTYPE html><html><!-- Start of meml component: navBar --><div>hello world from the nav</div><!-- End of meml component: navBar --></html>'
  )
  @TestCase(
    'Remote Import Specific',
    '(import (navBar) from "https://raw.githubusercontent.com/fushra/meml/main/examples/nav.meml") (navBar)',
    '<!DOCTYPE html><html><!-- Start of meml component: navBar --><div>hello world from the nav</div><!-- End of meml component: navBar --></html>'
  )
  async full(source: string, out: string) {
    const c = new MemlCore()
    const html = await c.sourceToWeb(source)

    expect.toBeEqual(html, out)
  }
}
