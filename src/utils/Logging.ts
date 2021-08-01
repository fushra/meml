import { grey, red, yellow } from 'kleur'

import { TokenType } from '../scanner/TokenTypes'
import { Token } from '../scanner/Token'
import { MemlCore } from '../'

/**
 * Resets `MemlCore.hadError` and `MemlCore.errors`
 */
export function resetErrors(): void {
  MemlCore.hadError = false
  MemlCore.errors = ''
}

/**
 * Internal error reporting function for reporting an error at a specific
 * token
 */
export function errorAtToken(token: Token, message: string, file = ''): void {
  if (token.type === TokenType.EOF) {
    report(token.line, ' at end', message, '', file)
  } else {
    report(token.line, ` at '${token.lexeme}'`, message, token.context, file)
  }
}

/**
 * Internal error reporting function
 */
export function error(line: number, message: string, file = ''): void {
  report(line, '', message, file)
}

/**
 * Internal error reporting function for reporting an linter warning at a specific
 * token
 */
export function linterAtToken(token: Token, message: string): void {
  warn(token.line, 'Linter', ` at '${token.lexeme}'`, message, token.context)
}

/**
 * Internal warning function
 */
export function generalWarning(line: number, message: string): void {
  warn(line, 'General', '', message)
}

/**
 * Private error reporting function
 */
function report(
  line: number,
  where: string,
  message: string,
  context = '',
  file = ''
): void {
  console.error(
    red(
      `[line ${line}${
        file != '' ? ` in file ${file}` : ''
      }] Error${where}: ${message}\n${grey(formatContext(context))}`
    )
  )
  MemlCore.hadError = true
  MemlCore.errors += `[line ${line}${
    file != '' ? ` in file ${file}` : ''
  }] Error${where}: ${message}\n${formatContext(context)}\n`
}

/**
 * Private warning function
 */
function warn(
  line: number,
  type: 'Linter' | 'General',
  where: string,
  message: string,
  context = ''
): void {
  console.warn(
    yellow(
      `[line ${line}] ${type} warning${where}: ${message} \n${grey(
        formatContext(context)
      )}`
    )
  )

  MemlCore.errors += `[line ${line}] ${type} warning${where}: ${message} \n${formatContext(
    context
  )}\n`
}

/**
 * Internal error formatting function
 */
export function formatContext(context: string): string {
  return `    ┃${context.replace(/\n/g, '\n    ┃')}`
}
