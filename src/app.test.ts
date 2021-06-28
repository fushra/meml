import { expect, TestSuite, Test } from 'testyts'
import { fs, path } from './fs'

@TestSuite()
export class TestTheTests {
  @Test()
  true() {
    expect.toBeEqual(true, true)
  }

  @Test('Janky FS')
  fs() {
    expect.toBeDefined(fs)
  }

  @Test('Janky path')
  path() {
    expect.toBeDefined(path)
  }
}
