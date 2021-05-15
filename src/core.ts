// Note that this is loosely based on the crafting interpreters book, so it will
// have a similar code structure. We are not using java because java is pain
// Maybe one day I will rewrite this in rust or maybe even c to make it work natively
// but at the moment I don't really care

import { fs } from './fs'
const { readFileSync } = fs

import { grey, red, yellow } from 'chalk'

import { Web } from './targets/Web'
import { Parser } from './parser/Parser'
import { Scanner } from './scanner/Scanner'
import { Token } from './scanner/Token'
import { TokenType } from './scanner/TokenTypes'

export class MemlC {
  static hadError = false

  runFile(path: string): boolean {
    const fileContents = readFileSync(path).toString()
    this.translate(fileContents, path)

    return MemlC.hadError
  }

  run(source: string) {
    return this.translate(source, './runit.meml')
  }

  parseFile(path: string) {
    const fileContents = readFileSync(path).toString()
    return this.parse(fileContents)
  }

  parse(source: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    return parser.parse()
  }

  translate(source: string, path: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)
    const expression = parser.parse()
    const converter = new Web(path)

    // Bail if there was a syntax error
    if (MemlC.hadError) return

    return converter.convert(expression)
  }

  private sleep(time: number) {
    return new Promise((res) => setTimeout(res, time))
  }

  static errorAtToken(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, ' at end', message)
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message, token.context)
    }
  }

  static error(line: number, message: string) {
    this.report(line, '', message)
  }

  static linterAtToken(token: Token, message: string): void {
    this.warn(
      token.line,
      'Linter',
      ` at '${token.lexeme}'`,
      message,
      token.context
    )
  }

  private static report(
    line: number,
    where: string,
    message: string,
    context = ''
  ): void {
    console.error(
      red(
        `[line ${line}] Error${where}: ${message}\n${this.formatContext(
          context
        )}`
      )
    )
    this.hadError = true
  }

  private static warn(
    line: number,
    type: 'Linter',
    where: string,
    message: string,
    context = ''
  ): void {
    console.warn(
      yellow(
        `[line ${line}] ${type} warning${where}: ${message} \n${this.formatContext(
          context
        )}`
      )
    )
  }

  private static formatContext(context: string): string {
    return grey(`    ┃${context.replace(/\n/g, '\n    ┃')}`)
  }
}
