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
import { PageStmt } from './parser/Stmt'
import { CSSLoader, ILoader, MemlLoader } from './targets/loaders'

export class MemlCore {
  static hadError = false
  static errors = ''
  static globalLoaders: ILoader[] = [new MemlLoader(), new CSSLoader()]
  static isProduction = false

  // ------------------------------------------------------------
  // Interpreter stepping function

  tokenize(source: string, file = ''): Token[] {
    const scanner = new Scanner(source, file)
    return scanner.scanTokens()
  }

  parse(tokens: Token[], file = ''): PageStmt {
    const parser = new Parser(tokens, file)
    return parser.parse()
  }

  targetWeb(page: PageStmt, path: string = 'memory.meml'): Promise<string> {
    const target = new Web(path)
    return target.convert(page)
  }

  tokenizeAndParse(source: string, file = ''): PageStmt {
    return this.parse(this.tokenize(source, file), file)
  }

  // ------------------------------------------------------------
  // Interpreter full functions

  sourceToWeb(source: string, path: string = 'memory.meml'): Promise<string> {
    const tokens = this.tokenize(source, path)
    const parsed = this.parse(tokens, path)
    return this.targetWeb(parsed, path)
  }

  fileToWeb(path: string): Promise<string> {
    return this.sourceToWeb(readFileSync(path).toString(), path)
  }

  // ------------------------------------------------------------
  // Error functions

  static resetErrors() {
    this.hadError = false
    this.errors = ''
  }

  static errorAtToken(token: Token, message: string, file = ''): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, ' at end', message, '', file)
    } else {
      this.report(
        token.line,
        ` at '${token.lexeme}'`,
        message,
        token.context,
        file
      )
    }
  }

  static error(line: number, message: string, file = '') {
    this.report(line, '', message, file)
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

  static generalWarning(line: number, message: string) {
    this.warn(line, 'General', '', message)
  }

  private static report(
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
        }] Error${where}: ${message}\n${grey(this.formatContext(context))}`
      )
    )
    this.hadError = true
    this.errors += `[line ${line}${
      file != '' ? ` in file ${file}` : ''
    }] Error${where}: ${message}\n${this.formatContext(context)}\n`
  }

  private static warn(
    line: number,
    type: 'Linter' | 'General',
    where: string,
    message: string,
    context = ''
  ): void {
    console.warn(
      yellow(
        `[line ${line}] ${type} warning${where}: ${message} \n${grey(
          this.formatContext(context)
        )}`
      )
    )

    this.errors += `[line ${line}] ${type} warning${where}: ${message} \n${this.formatContext(
      context
    )}\n`
  }

  private static formatContext(context: string): string {
    return `    ┃${context.replace(/\n/g, '\n    ┃')}`
  }
}

export class MemlC extends MemlCore {
  constructor() {
    super()
    console.error('Using MemlC is depreciated. Use the MemlCore class')
  }
}
