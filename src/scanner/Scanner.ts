import { MemlC } from '../core'
import { Tags } from './Tags'
import { Token } from './Token'
import { TokenType } from './TokenTypes'

export class Scanner {
  private source: string
  private tokens: Token[] = []

  private start: number = 0
  private current: number = 0
  private line: number = 1

  constructor(source: string) {
    this.source = source
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line))
    return this.tokens
  }

  private scanToken() {
    const c = this.advance()

    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN)
        break
      case ')':
        this.addToken(TokenType.RIGHT_PAREN)
        break
      case '-':
        this.addToken(TokenType.MINUS)
        break
      case '+':
        this.addToken(TokenType.PLUS)
        break
      case '*':
        this.addToken(TokenType.STAR)
        break

      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG)
        break
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
        break
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS)
        break
      case '>':
        this.addToken(
          this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER
        )
        break

      // Longer lexemes
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance()
        } else {
          this.addToken(TokenType.SLASH)
        }
        break

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break

      case '\n':
        this.line++
        break

      // Strings
      case '"':
      case "'":
        this.string()
        break

      default:
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
          MemlC.error(this.line, `Unexpected character ${c}`)
        }

        break
    }
  }

  private isAlpha(c: string): boolean {
    return (
      ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_') && c != ' '
    )
  }

  private isAlphaNumeric(c: string): boolean {
    return (this.isAlpha(c) || this.isDigit(c)) && c !== ' '
  }

  private identifier() {
    let text = this.peekLast()

    while (this.isAlphaNumeric(this.peek())) text += this.advance()

    let type = TokenType.IDENTIFIER

    switch (text) {
      case 'false':
        type = TokenType.FALSE
        break

      case 'true':
        type = TokenType.TRUE
        break

      case 'null':
        type = TokenType.NULL
        break

      default:
        break
    }

    this.addToken(type, text)
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance()

    // Look for a fractional part.
    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance()

      while (this.isDigit(this.peek())) this.advance()
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    )
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9'
  }

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++
      this.advance()
    }

    if (this.isAtEnd()) {
      MemlC.error(this.line, 'Unterminated string.')
      return
    }

    // The closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1)
    this.addToken(TokenType.STRING, value)
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0'
    return this.source.charAt(this.current + 1)
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }

  private peekLast(): string {
    return this.source.charAt(this.current - 1)
  }

  private match(char: string): boolean {
    if (this.isAtEnd()) return false
    if (this.source.charAt(this.current) != char) return false

    this.current++
    return true
  }

  private advance(): string {
    return this.source.charAt(this.current++)
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.substr(this.start, this.current)
    this.tokens.push(new Token(type, text, literal, this.line))
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }
}
