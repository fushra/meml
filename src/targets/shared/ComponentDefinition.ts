import {
  DestructureExpr,
  ExprVisitor,
  MemlPropertiesExpr,
} from '../../parser/Expr'
import { IStmt, MemlStmt, StmtVisitor } from '../../parser/Stmt'

export class ComponentDefinition {
  private props: DestructureExpr
  private meml: IStmt
  private name

  constructor(props: DestructureExpr, meml: IStmt, name: string) {
    this.props = props
    this.meml = meml
    this.name = name
  }

  construct(
    props: MemlPropertiesExpr[],
    visitor: ExprVisitor<any> & StmtVisitor<any>
  ): string {
    return `<!-- Start of meml component: ${
      this.name
    } -->${visitor.visitMemlStmt(
      this.meml as MemlStmt
    )}<!-- End of meml component: ${this.name} -->`
  }
}
