import { TokenType } from '../scanner/TokenTypes'
import { Token } from '../scanner/Token'
import {
  ArrayExpr,
  BinaryExpr,
  DestructureExpr,
  GroupingExpr,
  IdentifierExpr,
  IExpr,
  LiteralExpr,
  MemlPropertiesExpr,
  UnaryExpr,
} from './Expr'
import { MemlCore } from '../core'
import {
  ComponentStmt,
  ExportStmt,
  ExpressionStmt,
  ForStmt,
  IfStmt,
  ImportStmt,
  IStmt,
  MemlStmt,
  PageStmt,
} from './Stmt'
import { errorAtToken } from '../utils/Logging'

export class Parser {
  private tokens: Token[]
  private file: string
  private current = 0

  constructor(tokens: Token[], file = '') {
    this.tokens = tokens
    this.file = file
  }

  /**
   * page        = ('(' declaration ')')* EOF;
   */
  parse(): PageStmt {
    let stmts = []

    while (!this.isAtEnd()) {
      try {
        const declaration = this.declaration()
        if (typeof declaration !== 'undefined') stmts.push(declaration)
      } catch (e) {
        this.synchronize()
      }
    }

    return new PageStmt(stmts)
  }

  // ===========================================================================
  // This is the parsers logic tree.

  /**
   * declaration = compDecl
   *             | statement;
   */
  private declaration(): IStmt {
    try {
      if (this.doubleCheck(TokenType.COMPONENT)) return this.componentStmt()
      if (this.doubleCheck(TokenType.EXPORT)) return this.exportDecl()

      return this.statement()
    } catch (err) {
      this.synchronize()
      return null
    }
  }

  /**
   * statement   = memlStmt
   *             | expression;
   */
  private statement(): IStmt {
    // Check if the next token is an identifier or a tag
    if (
      this.doubleCheck(TokenType.IDENTIFIER) &&
      this.check(TokenType.LEFT_PAREN)
    ) {
      // Then this is a meml tag and should be passed through
      return this.memlStmt()
    }

    if (this.doubleCheck(TokenType.IF)) return this.ifStmt()
    if (this.doubleCheck(TokenType.FOR)) return this.forStmt()
    if (this.doubleCheck(TokenType.IMPORT)) return this.importStmt()

    // Otherwise it is an expression
    return new ExpressionStmt(this.expression())
  }

  // --------------------------
  // MEML Statements

  private componentStmt(): IStmt {
    this.consume(
      TokenType.LEFT_PAREN,
      'Expected opening bracket before component'
    )
    this.advance()

    // This will be the name of the component
    const identifier = this.advance()
    let props = new DestructureExpr([])

    // Consume the brackets before the props
    this.consume(TokenType.LEFT_PAREN, 'Expected opening bracket before props')
    if (this.check(TokenType.IDENTIFIER)) {
      // Collect the props as a destructure
      props = this.destructure()
    }
    // Consume the parenthesize after the destructure
    this.consume(TokenType.RIGHT_PAREN, 'Expected closing bracket after props')

    // Collect the meml statement
    const memlStmt = this.statement()

    // Consume the ending parenthesis
    this.consume(
      TokenType.RIGHT_PAREN,
      'Expected closing bracket after component'
    )

    return new ComponentStmt(identifier, props, memlStmt)
  }

  /**
   * exportDecl  = '(' 'export' '(' destructure ')' ')';
   */
  private exportDecl(): IStmt {
    // Consume a bunch of the initial structure that we don't care about
    this.consume(TokenType.LEFT_PAREN, 'Expected opening bracket before export')
    const token = this.advance()

    // Consume the surrounding brackets of the export identifiers
    this.consume(
      TokenType.LEFT_PAREN,
      'Expected opening bracket before the identifiers to be exported'
    )

    // Grab all of the exports, layed out in a destructure
    const exports = this.destructure()

    // Consume the closing brackets
    this.consume(
      TokenType.RIGHT_PAREN,
      'Expected closing bracket after the identifiers to be exported'
    )
    this.consume(TokenType.RIGHT_PAREN, 'Expected closing bracket after export')

    return new ExportStmt(exports, token)
  }

  /**
   * importStmt  = '(' 'import' ((('(' destructure ')') | 'everything') 'from')? STRING ')'
   */
  private importStmt(): IStmt {
    // Consume a bunch of the initial structure that we don't care about
    this.consume(TokenType.LEFT_PAREN, 'Expected opening bracket before import')
    this.advance()

    let imports: DestructureExpr | null | 'everything' = null
    let file: string
    let fileToken: Token

    // If there is a string here, we are just importing a file, so we only have a path
    if (this.check(TokenType.STRING)) {
      fileToken = this.advance()
    } else {
      // Otherwise this is a full import statement, so we are going to have to parse it properly
      // We need to check if we are importing everything. If we are, there will be an identifier
      // that has the contents of 'everything'
      if (this.check(TokenType.IDENTIFIER)) {
        if (this.peek().literal === 'everything') {
          imports = 'everything'
          this.advance()
        } else {
          const token = this.advance()
          errorAtToken(
            token,
            `Unexpected token '${token.literal}'. Try importing using a destructure ( '(import1, import2)' ) or adding the key 'everything'`,
            this.file
          )
        }
      } else {
        // Otherwise, we have a destructure as an import
        this.consume(TokenType.LEFT_PAREN, 'Expected ( before destructure')

        imports = this.destructure()

        this.consume(TokenType.RIGHT_PAREN, 'Expected ( after destructure)')
      }

      this.consume(TokenType.FROM, `Expected 'from' after destructure`)
      fileToken = this.advance()
    }

    this.consume(TokenType.RIGHT_PAREN, 'Expected opening bracket after import')

    file = fileToken.literal

    return new ImportStmt(file, fileToken, imports)
  }

  private ifStmt(): IStmt {
    // Consume the opening parenthesis
    this.consume(TokenType.LEFT_PAREN, 'Expected opening bracket before if')
    this.advance()

    // Consume the condition
    this.consume(
      TokenType.LEFT_PAREN,
      'Expected opening bracket before condition'
    )
    const primaryCondition = this.expression()
    this.consume(
      TokenType.RIGHT_PAREN,
      'Expected closing bracket after condition'
    )

    const primaryStmt = this.statement()

    let elif = []

    while (this.check(TokenType.ELSE) && this.doubleCheck(TokenType.IF)) {
      // Consume the else and if
      this.advance()
      this.advance()

      // Consume the condition
      this.consume(
        TokenType.LEFT_PAREN,
        'Expected opening bracket before condition'
      )
      const condition = this.expression()
      this.consume(
        TokenType.RIGHT_PAREN,
        'Expected closing bracket after condition'
      )

      const stmt = this.statement()

      elif.push({ expr: condition, meml: stmt })
    }

    let elseStmt = null

    if (this.match(TokenType.ELSE)) {
      this.peek()
      elseStmt = this.statement()
    }

    this.consume(
      TokenType.RIGHT_PAREN,
      'Expected closing bracket after if block'
    )

    return new IfStmt(primaryCondition, primaryStmt, elif, elseStmt)
  }

  private forStmt(): IStmt {
    // Consume the opening parenthesis
    this.consume(TokenType.LEFT_PAREN, 'Expected opening bracket before for')
    // Consume for token
    this.advance()

    // Consume the output variable name
    const output = this.consume(
      TokenType.IDENTIFIER,
      'Expected output variable name'
    )

    // Consume in token
    this.consume(TokenType.IN, 'Expected "in"')

    // Consume the input variable name
    let input = this.expression()

    const template = this.statement()

    // Consume the closing parenthesis
    this.consume(TokenType.RIGHT_PAREN, 'Expected closing bracket after for')

    return new ForStmt(input, output, template)
  }

  /**
   * memlStmt    = IDENTIFIER memlProp* statement*;
   */
  private memlStmt(): IStmt {
    this.consume(
      TokenType.LEFT_PAREN,
      'Expected opening bracket meml statement'
    )

    const identifier = this.advance()
    const props = []
    const children = []

    while (this.match(TokenType.IDENTIFIER)) {
      props.push(this.memlProps())
    }

    while (!this.match(TokenType.RIGHT_PAREN)) {
      children.push(this.statement())
    }

    return new MemlStmt(identifier, props, children)
  }

  /**
   * memlProp    → IDENTIFIER
   *             | IDENTIFIER '=' expression;
   */
  private memlProps(): MemlPropertiesExpr {
    const identifier = this.previous()
    let expression: IExpr = new LiteralExpr('')

    if (this.match(TokenType.EQUAL)) {
      expression = this.expression()
    }

    return new MemlPropertiesExpr(identifier, expression)
  }

  // --------------------------
  // Expression logic

  /**
   * expression  = equality;
   */
  private expression(): IExpr {
    return this.equality()
  }

  /**
   * This is part of a custom implementation of the binary operation. This function
   * is tasked with equality
   *
   * equality    = comparison (('!=' | '==') comparison)*;
   */
  private equality(): IExpr {
    let expr = this.comparison()

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  /**
   * This is part of a custom implementation of the binary operation. This function
   * is tasked with comparison
   *
   * comparison  = term (('>' | '>=' | '<' | '<=') term)*;
   */
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

  /**
   * This is part of a custom implementation of the binary operation. This function
   * is tasked with terms
   *
   * term        = factor (('-' | '+') factor)*;
   */
  private term(): IExpr {
    let expr = this.factor()

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.factor()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  /**
   * This is part of a custom implementation of the binary operation. This function
   * is tasked with factors
   *
   * factor      = unary (('/' | '*') unary)*;
   */
  private factor(): IExpr {
    let expr = this.unary()

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expr = new BinaryExpr(expr, operator, right)
    }

    return expr
  }

  /**
   * unary       = ('!' | '-') unary
   *             | primary;
   */
  private unary(): IExpr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new UnaryExpr(operator, right)
    }

    return this.primary()
  }

  /**
   * primary     = NUMBER | STRING | 'true' | 'false' | 'null'
   *             | '(' expression ')';
   */
  private primary(): IExpr {
    if (this.match(TokenType.FALSE)) return new LiteralExpr(false)
    if (this.match(TokenType.TRUE)) return new LiteralExpr(true)
    if (this.match(TokenType.NULL)) return new LiteralExpr(null)

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpr(this.previous().literal)
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      let exprs = []

      do {
        exprs.push(this.statement())
      } while (!this.check(TokenType.RIGHT_PAREN))

      this.consume(TokenType.RIGHT_PAREN, `Expect ')' after expression.`)
      return new GroupingExpr(exprs)
    }

    if (this.match(TokenType.IDENTIFIER))
      return new IdentifierExpr(this.previous())

    // Handle arrays
    if (this.match(TokenType.LEFT_SQUARE)) {
      const elements = []

      // The first expression doesn't have to be prepended with a ','
      if (!this.check(TokenType.RIGHT_SQUARE)) {
        elements.push(this.expression())
      }

      do {
        // Consume comma
        this.advance()

        elements.push(this.expression())
      } while (this.check(TokenType.COMMA))

      // Consume a final (optional) ','
      if (this.peek().type === TokenType.COMMA) this.advance()

      // End the array
      this.consume(TokenType.RIGHT_SQUARE, `Expected ']' after array.`)

      return new ArrayExpr(elements)
    }

    this.error(this.peek(), 'Expected expression.')
  }

  // --------------------------
  // Other datatypes

  /**
   * destructure = IDENTIFIER ( ',' IDENTIFIER )*;
   */
  private destructure(): DestructureExpr {
    // Consume the first identifier
    const identifiers = [this.advance()]

    // If there is a comma, there will be another identifier
    while (this.peek().type === TokenType.COMMA) {
      // Consume the comma token
      this.advance()
      // Consume the next identifier and add it to the array
      identifiers.push(this.advance())
    }

    return new DestructureExpr(identifiers)
  }

  // ===========================================================================
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
        case TokenType.LEFT_PAREN:
          return

        case TokenType.TAG:
          return
      }

      this.advance()
    }
  }

  private error(token: Token, message: string) {
    errorAtToken(token, message, this.file)
    throw new Error(message)
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private doubleCheck(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.doublePeek().type === type
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

  private doublePeek(): Token {
    return this.tokens[this.current + 1]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }
}
