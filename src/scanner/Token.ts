import { TokenType } from './TokenTypes'

export class Token {
  type: TokenType
  lexeme: string
  literal: any
  line: number
  context: string

  constructor(
    type: TokenType,
    lexeme: string,
    literal: any,
    line: number,
    context: string
  ) {
    this.type = type
    this.lexeme = lexeme
    this.literal = literal
    this.line = line
    this.context = context
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`
  }
}
