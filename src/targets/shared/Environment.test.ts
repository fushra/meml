import { TestSuite, Test, expect } from 'testyts/build/testyCore'

import { Environment } from './Environment'
import { Token } from '../../scanner/Token'
import { TokenType } from '../../scanner/TokenTypes'
import { MemlCore, resetErrors } from '../..'

@TestSuite('Shared: Environment')
export class EnvironmentTests {
  @Test('Construct')
  construct() {
    new Environment()
  }

  //new Token(TokenType.IDENTIFIER, '', 'test', 3, '')

  @Test('Definition')
  define() {
    const env = new Environment()
    env.define('test', 'Hello world!')
  }

  @Test('Get')
  get() {
    const env = new Environment()
    env.define('test', 'Hello world!')

    expect.toBeEqual(
      env.get(new Token(TokenType.IDENTIFIER, '', 'test', 3, '')),
      'Hello world!'
    )
  }

  @Test('Assign')
  assign() {
    const env = new Environment()
    env.define('test', 'Hello world!')

    expect.toBeEqual(
      env.get(new Token(TokenType.IDENTIFIER, '', 'test', 3, '')),
      'Hello world!'
    )

    env.assign(new Token(TokenType.IDENTIFIER, '', 'test', 3, ''), 'New value')
    expect.toBeEqual(
      env.get(new Token(TokenType.IDENTIFIER, '', 'test', 3, '')),
      'New value'
    )

    expect.toBeFalse(MemlCore.hadError)
    env.assign(
      new Token(TokenType.IDENTIFIER, '', 'does_notExist', 3, ''),
      'value'
    )
    expect.toBeTrue(MemlCore.hadError)
  }

  @Test('Shadowing')
  shadowing() {
    const env = new Environment()
    env.define('test', 'Hello world!')

    const subEnv = new Environment(env)

    expect.toBeEqual(
      subEnv.get(new Token(TokenType.IDENTIFIER, '', 'test', 3, '')),
      'Hello world!'
    )

    subEnv.assign(
      new Token(TokenType.IDENTIFIER, '', 'test', 3, ''),
      'New value'
    )
    expect.toBeEqual(
      subEnv.get(new Token(TokenType.IDENTIFIER, '', 'test', 3, '')),
      'New value'
    )

    resetErrors()

    expect.toBeFalse(MemlCore.hadError)
    expect.toBeFalsy(
      env.get(new Token(TokenType.IDENTIFIER, '', 'does_notExist', 3, ''))
    )
    expect.toBeTrue(MemlCore.hadError)
  }
}
