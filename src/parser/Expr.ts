import { Token } from '../scanner/Token'

export interface Visitor<R> {
  visitBinaryExpr: (expr: BinaryExpr) => R
  visitGroupingExpr: (expr: GroupingExpr) => R
  visitLiteralExpr: (expr: LiteralExpr) => R
  visitUnaryExpr: (expr: UnaryExpr) => R
  visitTagExpr: (expr: TagExpr) => R
  visitPageExpr: (expr: PageExpr) => R
}

export interface IExpr {
  accept: <R>(visitor: Visitor<R>) => R
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
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this)
  }
}

export class GroupingExpr implements IExpr {
  expression: IExpr

  constructor(expression: IExpr) {
    this.expression = expression
  }

  // Visitor pattern
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this)
  }
}

export class LiteralExpr implements IExpr {
  value: any

  constructor(value: any) {
    this.value = value
  }

  // Visitor pattern
  accept<R>(visitor: Visitor<R>): R {
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
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this)
  }
}

export class TagExpr implements IExpr {
  name: Token
  right: IExpr[]

  constructor(name: Token, right: IExpr[]) {
    this.name = name
    this.right = right
  }

  // Visitor pattern
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTagExpr(this)
  }
}

export class PageExpr implements IExpr {
  children: IExpr[]

  constructor(children: IExpr[]) {
    this.children = children
  }

  // Visitor pattern
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPageExpr(this)
  }
}
