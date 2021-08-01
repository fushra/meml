import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { MemlCore } from './core'

@TestSuite('Core tests')
export class MemlCTests {
  @Test('Construct')
  construct() {
    new MemlCore()
  }

  @Test('Run from file')
  async runFile() {
    const memlC = new MemlCore()
    await memlC.fileToWeb('./examples/helloWorld.meml')
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
    '(p 1 == 1)(p 1 == 2)(p 1 != 2)(p 1 < 2)(p 2 > 1)(p null == null)(p null == 5)(p 1 <= 1)(p 0 <= 1)(p 1 >= 1)(p 2 >= 1)',
    '<!DOCTYPE html><html><p>true</p><p>false</p><p>true</p><p>true</p><p>true</p><p>true</p><p>false</p><p>true</p><p>true</p><p>true</p><p>true</p></html>'
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
  @TestCase(
    'Truthy',
    '(p !!(null))(p !!false)(p !!true)(p !!"test")(p !!5)',
    '<!DOCTYPE html><html><p>false</p><p>false</p><p>true</p><p>true</p><p>true</p></html>'
  )
  @TestCase(
    'Falsy null',
    '(p !null)',
    '<!DOCTYPE html><html><p>true</p></html>'
  )
  @TestCase(
    'String concat',
    '(p "a " "b")(p "c " + "d")',
    '<!DOCTYPE html><html><p>a b</p><p>c d</p></html>'
  )
  @TestCase('Negate', '(p -(1))', '<!DOCTYPE html><html><p>-1</p></html>')
  async full(source: string, out: string) {
    const c = new MemlCore()
    const html = await c.sourceToWeb(source)

    expect.toBeEqual(html, out)
  }
}
