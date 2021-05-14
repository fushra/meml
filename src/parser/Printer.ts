import {
  BinaryExpr,
  GroupingExpr,
  IExpr,
  LiteralExpr,
  UnaryExpr,
  ExprVisitor,
  DestructureExpr,
  IdentifierExpr,
  MemlPropertiesExpr,
} from './Expr'
import {
  ComponentStmt,
  ExportStmt,
  ExpressionStmt,
  ImportStmt,
  IStmt,
  MemlStmt,
  PageStmt,
  StmtVisitor,
} from './Stmt'

export class AstPrinter implements ExprVisitor<string>, StmtVisitor<string> {
  print(expr: any): string {
    return expr.accept(this)
  }

  private parenthesize(name: string, ...exprs: any[]): string {
    let final = `(${name}`
    exprs.forEach((expr) => {
      final += ` ${expr.accept(this)}`
    })
    final += ')'

    return final
  }

  visitMemlPropertiesExpr(expr: MemlPropertiesExpr): string {
    return this.parenthesize('Properties ' + expr.name, expr.value)
  }

  visitDestructureExpr(expr: DestructureExpr): string {
    return `(Destructure ${expr.items.map((item) => `${item.literal},`)})`
  }

  visitIdentifierExpr(expr: IdentifierExpr): string {
    return `(Identifier ${expr.token.literal})`
  }

  visitComponentStmt(stmt: ComponentStmt): string {
    return this.parenthesize('Component ' + stmt.tagName, stmt.props, stmt.meml)
  }

  visitExportStmt(stmt: ExportStmt): string {
    return this.parenthesize('Export', stmt.exports)
  }

  visitImportStmt(stmt: ImportStmt): string {
    return this.parenthesize(
      'Import from ' + stmt.file,
      (stmt.imports as unknown) as IExpr
    )
  }

  visitMemlStmt(stmt: MemlStmt): string {
    return this.parenthesize(
      stmt.tagName.literal,
      ...((stmt.props as unknown) as IExpr[]),
      ...stmt.exprOrMeml
    )
  }

  visitExpressionStmt(stmt: ExpressionStmt): string {
    return this.parenthesize('expression', stmt.expression)
  }

  visitPageStmt(stmt: PageStmt): string {
    return this.parenthesize('page', ...stmt.children)
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
}
