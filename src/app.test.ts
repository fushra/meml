import { expect, TestSuite, Test } from 'testyts'

@TestSuite()
export class TestTheTests {
  @Test()
  true() {
    expect.toBeEqual(true, true)
  }
}
