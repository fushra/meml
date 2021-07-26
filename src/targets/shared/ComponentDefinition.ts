import { Token } from '../../scanner/Token'
import { DestructureExpr } from '../../parser/Expr'
import { IStmt, MemlStmt } from '../../parser/Stmt'
import { Web } from '../Web'

export class ComponentDefinition {
  props: DestructureExpr
  meml: IStmt
  name: string

  constructor(props: DestructureExpr, meml: IStmt, name: string) {
    this.props = props
    this.meml = meml
    this.name = name
  }

  propsList(): Token[] {
    return this.props.items
  }

  async construct(visitor: Web): Promise<string> {
    return `<!-- Start of meml component: ${
      this.name
    } -->${await visitor.evaluate(
      this.meml as MemlStmt
    )}<!-- End of meml component: ${this.name} -->`
  }
}
