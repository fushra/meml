import { TestSuite, Test } from 'testyts/build/testyCore'
import { MemlC } from './core'

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
}
