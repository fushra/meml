import { TokenType } from '../scanner/TokenTypes'
import { Token } from '../scanner/Token'
import {
  BinaryExpr,
  GroupingExpr,
  IExpr,
  LiteralExpr,
  PageExpr,
  TagExpr,
  UnaryExpr,
} from './Expr'
import { MemlC } from '../core'

export class Parser {
  private tokens: Token[]
  private current: number = 0
  private lastOnError: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): PageExpr {
    let expressions = []

    while (!this.isAtEnd()) {
      expressions.push(this.expression())
    }

    return new PageExpr(expressions)
  }

  private expression(): IExpr {
    return this.equality()
  }

  private equality(): IExpr {
    let expr = this.comparison()

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  private comparison(): IExpr {
    let expr = this.term()

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous()
      const right = this.term()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  private term(): IExpr {
    let expr = this.factor()

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.factor()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  private factor(): IExpr {
    let expr = this.unary()

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  private unary(): IExpr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new UnaryExpr(operator, right)
    }

    return this.primary()
  }

  private primary(): IExpr {
    if (this.match(TokenType.FALSE)) return new LiteralExpr(false)
    if (this.match(TokenType.TRUE)) return new LiteralExpr(true)
    if (this.match(TokenType.NULL)) return new LiteralExpr(null)
    if (this.match(TokenType.TAG)) return this.tag()

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpr(this.previous().literal)
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression()
      this.consume(TokenType.RIGHT_PAREN, `Expect ')' after expression.`)
      return new GroupingExpr(expr)
    }

    if (this.lastOnError && this.lastOnError == this.current) {
      MemlC.errorAtToken(
        this.advance(),
        'Recursion has occurred, skipping token.'
      )
    } else {
      this.lastOnError = this.current
    }

    this.error(this.peek(), 'Expected expression.')
  }

  private tag(): IExpr {
    const tag = this.previous()
    let right = []

    while (this.peek().type !== TokenType.RIGHT_PAREN && !this.isAtEnd()) {
      right.push(this.term())
    }

    return new TagExpr(tag, right)
  }

  // ----------------------------------------------------------------
  // Utilities
  private match(...types: TokenType[]): boolean {
    for (let i = 0; i < types.length; i++) {
      const type = types[i]

      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  private consume(token: TokenType, message: string): Token {
    if (this.check(token)) return this.advance()

    this.error(this.peek(), message)
  }

  private synchronize() {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.RIGHT_PAREN) return

      switch (this.peek().type) {
        case TokenType.TAG:
          return
      }

      this.advance()
    }
  }

  private error(token: Token, message: string) {
    MemlC.errorAtToken(token, message)
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }
}
