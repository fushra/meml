import { expect, TestSuite, Test } from 'testyts'

import { MemlCore } from '..'
import { Token } from '../scanner/Token'
import { TokenType } from '../scanner/TokenTypes'
import { errorAtToken, resetErrors } from './Logging'

@TestSuite('Logging')
export class Logging {
  @Test('Reset Errors')
  resetErrors() {
    // Emulate having an error
    MemlCore.errors = 'This is some error text'
    MemlCore.hadError = true

    // Make sure that these values were properly stored
    expect.toBeEqual(MemlCore.errors, 'This is some error text')
    expect.toBeTrue(MemlCore.hadError)

    // Reset the errors
    resetErrors()

    // Make sure they reset
    expect.toBeEqual(MemlCore.errors, '')
    expect.toBeFalse(MemlCore.hadError)
  }

  @Test('Error at token')
  errorAtToken() {
    errorAtToken(
      new Token(TokenType.IDENTIFIER, 'a', 'b', 3, 'Example context'),
      'Test error'
    )

    expect.toBeTrue(MemlCore.hadError)
    expect.toBeEqual(
      MemlCore.errors,
      "[line 3] Error at 'a': Test error\n    ┃Example context\n"
    )
  }
}
