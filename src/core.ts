// Note that this is loosely based on the crafting interpreters book, so it will
// have a similar code structure. We are not using java because java is pain
// Maybe one day I will rewrite this in rust or maybe even c to make it work natively
// but at the moment I don't really care

import { readFileSync } from 'fs'
import { Scanner } from './scanner/Scanner'

export class MemlC {
  static hadError = false

  runFile(path: string): boolean {
    const fileContents = readFileSync(path).toString()
    this.run(fileContents)

    return MemlC.hadError
  }

  run(source: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()

    // Print all of the tokens to the console
    console.log(tokens)
    // console.log(Tag)
  }

  static error(line: number, message: string) {
    this.report(line, '', message)
  }

  private static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`)
    this.hadError = true
  }
}
