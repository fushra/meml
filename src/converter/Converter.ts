import { TokenType } from '../scanner/TokenTypes'
import {
  BinaryExpr,
  GroupingExpr,
  IExpr,
  LiteralExpr,
  PageExpr,
  TagExpr,
  UnaryExpr,
  Visitor,
} from '../parser/Expr'

export class Converter implements Visitor<string | number | boolean | null> {
  // ----------------------------------------------------------------
  // Visitor pattern implementations

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

  visitTagExpr(tag: TagExpr): string {
    const children: string[] = []

    tag.right.forEach((child) => {
      const tag = this.evaluate(child).toString()
      children.push(tag)
    })

    return `<${tag.name.literal}>${children.join('')}</${tag.name.literal}>`
  }

  visitPageExpr(expr: PageExpr): string {
    const children: string[] = []

    expr.children.forEach((child) =>
      children.push(this.evaluate(child).toString())
    )

    return `
<!DOCTYPE html>

${children.join('')}`
  }

  // ----------------------------------------------------------------
  // Utils

  private evaluate(expr: IExpr): string | number | boolean {
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
