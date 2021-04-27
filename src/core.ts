// Note that this is loosely based on the crafting interpreters book, so it will
// have a similar code structure. We are not using java because java is pain
// Maybe one day I will rewrite this in rust or maybe even c to make it work natively
// but at the moment I don't really care

import { readFileSync, writeFileSync } from 'fs'
import { Web } from './targets/Web'
import { Parser } from './parser/Parser'
import { Scanner } from './scanner/Scanner'
import { Token } from './scanner/Token'
import { TokenType } from './scanner/TokenTypes'

export class MemlC {
  static hadError = false

  runFile(path: string): boolean {
    const fileContents = readFileSync(path).toString()
    this.translate(fileContents)

    return MemlC.hadError
  }

  run(source: string) {
    return this.translate(source)
  }

  translate(source: string) {
    console.log('Scanning...')
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    console.log('Parsing...')
    const parser = new Parser(tokens)
    const expression = parser.parse()
    console.log('Translating...')
    const converter = new Web()

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
      this.report(token.line, ` at '${token.lexeme}'`, message)
    }
  }

  static error(line: number, message: string) {
    this.report(line, '', message)
  }

  private static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`)
    this.hadError = true
  }
}
