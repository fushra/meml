import { TokenType } from '../scanner/TokenTypes'
import {
  BinaryExpr,
  ExprVisitor,
  GroupingExpr,
  IExpr,
  LiteralExpr,
  MemlPropertiesExpr,
  UnaryExpr,
} from '../parser/Expr'
import {
  ExpressionStmt,
  IStmt,
  MemlStmt,
  PageStmt,
  StmtVisitor,
} from '../parser/Stmt'

export class Web
  implements
    ExprVisitor<string | number | boolean | null>,
    StmtVisitor<string> {
  convert(token: PageStmt): string {
    return this.visitPageStmt(token)
  }

  // ===========================================================================
  // Stmt visitor pattern implementations

  visitMemlStmt(stmt: MemlStmt): string {
    return `<${stmt.tagName.literal}${
      stmt.props.length !== 0
        ? `${stmt.props.map((prop) => this.evaluate(prop)).join(' ')} `
        : ''
    }>${stmt.exprOrMeml.map((el) => this.evaluate(el)).join('')}</${
      stmt.tagName.literal
    }>`
  }

  visitExpressionStmt(stmt: ExpressionStmt): string {
    return this.evaluate(stmt.expression).toString()
  }

  visitPageStmt(stmt: PageStmt): string {
    return `<!DOCTYPE html><html>${stmt.children
      .map((el) => this.evaluate(el))
      .join('')}</html>`
  }

  // ===========================================================================
  // Expr visitor pattern implementations

  visitMemlPropertiesExpr(expr: MemlPropertiesExpr): string {
    return `${expr.name}=${this.evaluate(expr.value)}`
  }

  visitLiteralExpr(expr: LiteralExpr): string | number | boolean | null {
    return expr.value
  }

  visitGroupingExpr(expr: GroupingExpr): string | number | boolean | null {
    return this.evaluate(expr.expression)
  }

  visitUnaryExpr(expr: UnaryExpr): number | boolean | null {
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -right
      case TokenType.BANG:
        return !this.isTruthy(right)
    }

    return null
  }

  visitBinaryExpr(expr: BinaryExpr): number | boolean | string | null {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return (left as number) - (right as number)
      case TokenType.SLASH:
        return (left as number) / (right as number)
      case TokenType.STAR:
        return (left as number) * (right as number)
      case TokenType.PLUS:
        if (typeof left == 'number' && typeof right == 'number') {
          return (left as number) + (right as number)
        }

        if (typeof left == 'string' && typeof right == 'string') {
          return (left as string) + (right as string)
        }

      case TokenType.GREATER:
        return (left as number) > (right as number)
      case TokenType.GREATER_EQUAL:
        return (left as number) >= (right as number)
      case TokenType.LESS:
        return (left as number) < (right as number)
      case TokenType.LESS_EQUAL:
        ;(left as number) <= (right as number)

      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right)
    }
  }

  // ===========================================================================
  // Utils

  private evaluate(expr: IExpr | IStmt): string | number | boolean {
    return expr.accept(this)
  }

  private isTruthy(obj: any): boolean {
    if (obj == null) return false
    if (typeof obj == 'boolean') return obj as boolean

    return true
  }

  private isEqual(left: any, right: any): boolean {
    if (left == null && right == null) return false
    if (left == null) return false

    return left.equal(right)
  }
}
