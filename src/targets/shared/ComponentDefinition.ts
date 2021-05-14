import { Token } from '../../scanner/Token'
import {
  DestructureExpr,
  ExprVisitor,
  MemlPropertiesExpr,
} from '../../parser/Expr'
import { IStmt, MemlStmt, StmtVisitor } from '../../parser/Stmt'

export class ComponentDefinition {
  private props: DestructureExpr
  private meml: IStmt
  private name: string

  constructor(props: DestructureExpr, meml: IStmt, name: string) {
    this.props = props
    this.meml = meml
    this.name = name
  }

  propsList(): Token[] {
    return this.props.items
  }

  construct(visitor: ExprVisitor<any> & StmtVisitor<any>): string {
    return `<!-- Start of meml component: ${
      this.name
    } -->${visitor.visitMemlStmt(
      this.meml as MemlStmt
    )}<!-- End of meml component: ${this.name} -->`
  }
}
