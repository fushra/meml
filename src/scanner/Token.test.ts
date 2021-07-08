import { TestSuite, Test, TestCase, expect } from 'testyts/build/testyCore'
import { Token } from './Token'
import { TokenType } from './TokenTypes'

@TestSuite('Token tests')
export class MemlCTests {
  @Test('Construct')
  construct() {
    new Token(TokenType.LEFT_PAREN, '', '', 5, '')
  }

  @Test('To string')
  toString() {
    const token = new Token(TokenType.LEFT_PAREN, '(test)', '(', 5, '')
    expect.toBeEqual(token.toString(), 'leftParen (test) (')
  }
}
