import {
  BinaryExpr,
  GroupingExpr,
  IExpr,
  LiteralExpr,
  PageExpr,
  TagExpr,
  UnaryExpr,
  Visitor,
} from './Expr'

export class AstPrinter implements Visitor<string> {
  print(expr: IExpr): string {
    return expr.accept(this)
  }

  private parenthesize(name: string, ...exprs: IExpr[]): string {
    let final = `(${name}`

    exprs.forEach((expr) => {
      final += ` ${expr.accept(this)}`
    })
    final += ')'

    return final
  }

  visitBinaryExpr(expr: BinaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  visitGroupingExpr(expr: GroupingExpr): string {
    return this.parenthesize('group', expr.expression)
  }

  visitLiteralExpr(expr: LiteralExpr): string {
    if (typeof expr.value == 'undefined') return 'null'
    return expr.value.toString()
  }

  visitUnaryExpr(expr: UnaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }

  visitTagExpr(expr: TagExpr): string {
    return this.parenthesize(expr.name.literal, ...expr.right)
  }

  visitPageExpr(expr: PageExpr): string {
    return this.parenthesize('Page', ...expr.children)
  }
}
