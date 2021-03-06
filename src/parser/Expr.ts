import { Token } from '../scanner/Token'

export interface ExprVisitor<R> {
  visitBinaryExpr: (expr: BinaryExpr) => R
  visitGroupingExpr: (expr: GroupingExpr) => R
  visitLiteralExpr: (expr: LiteralExpr) => R
  visitUnaryExpr: (expr: UnaryExpr) => R
  visitMemlPropertiesExpr: (expr: MemlPropertiesExpr) => R
  visitDestructureExpr: (expr: DestructureExpr) => R
  visitIdentifierExpr: (expr: IdentifierExpr) => R
  visitArrayExpr: (expr: ArrayExpr) => R
}

export interface IExpr {
  accept: <R>(visitor: ExprVisitor<R>) => R
}

export class BinaryExpr implements IExpr {
  left: IExpr
  operator: Token
  right: IExpr

  constructor(left: IExpr, operator: Token, right: IExpr) {
    this.left = left
    this.operator = operator
    this.right = right
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this)
  }
}

export class GroupingExpr implements IExpr {
  expressions: unknown[]

  constructor(expressions: unknown[]) {
    this.expressions = expressions
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupingExpr(this)
  }
}

export class LiteralExpr implements IExpr {
  value: any

  constructor(value: any) {
    this.value = value
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLiteralExpr(this)
  }
}

export class UnaryExpr implements IExpr {
  operator: Token
  right: IExpr

  constructor(operator: Token, right: IExpr) {
    this.operator = operator
    this.right = right
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this)
  }
}

export class MemlPropertiesExpr implements IExpr {
  name: Token
  value: IExpr

  constructor(name: Token, value: IExpr) {
    this.name = name
    this.value = value
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitMemlPropertiesExpr(this)
  }
}

export class DestructureExpr implements IExpr {
  items: Token[]

  constructor(items: Token[]) {
    this.items = items
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitDestructureExpr(this)
  }
}

export class IdentifierExpr implements IExpr {
  token: Token

  constructor(token: Token) {
    this.token = token
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitIdentifierExpr(this)
  }
}

export class ArrayExpr implements IExpr {
  items: IExpr[]

  constructor(items: IExpr[]) {
    this.items = items
  }

  // Visitor pattern
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitArrayExpr(this)
  }
}
