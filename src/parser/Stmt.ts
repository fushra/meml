import { Token } from '../scanner/Token'
import { IExpr, MemlPropertiesExpr, DestructureExpr } from './Expr'

export interface StmtVisitor<R> {
  visitComponentStmt: (stmt: ComponentStmt) => R
  visitExportStmt: (stmt: ExportStmt) => R
  visitImportStmt: (stmt: ImportStmt) => R
  visitMemlStmt: (stmt: MemlStmt) => R
  visitExpressionStmt: (stmt: ExpressionStmt) => R
  visitPageStmt: (stmt: PageStmt) => R
  visitIfStmt: (stmt: IfStmt) => R
  visitForStmt: (stmt: ForStmt) => R
}

export interface IStmt {
  accept: <R>(visitor: StmtVisitor<R>) => R
}

export class ComponentStmt implements IStmt {
  tagName: Token
  props: DestructureExpr
  meml: IStmt

  constructor(tagName: Token, props: DestructureExpr, meml: IStmt) {
    this.tagName = tagName
    this.props = props
    this.meml = meml
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitComponentStmt(this)
  }
}

export class ExportStmt implements IStmt {
  exports: DestructureExpr
  exportToken: Token

  constructor(exports: DestructureExpr, exportToken: Token) {
    this.exports = exports
    this.exportToken = exportToken
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExportStmt(this)
  }
}

export class ImportStmt implements IStmt {
  file: string
  fileToken: Token
  imports: DestructureExpr | null | 'everything'

  constructor(
    file: string,
    fileToken: Token,
    imports: DestructureExpr | null | 'everything'
  ) {
    this.file = file
    this.fileToken = fileToken
    this.imports = imports
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitImportStmt(this)
  }
}

export class MemlStmt implements IStmt {
  tagName: Token
  props: MemlPropertiesExpr[]
  exprOrMeml: IStmt[]

  constructor(
    tagName: Token,
    props: MemlPropertiesExpr[],
    exprOrMeml: IStmt[]
  ) {
    this.tagName = tagName
    this.props = props
    this.exprOrMeml = exprOrMeml
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitMemlStmt(this)
  }
}

export class ExpressionStmt implements IStmt {
  expression: IExpr

  constructor(expression: IExpr) {
    this.expression = expression
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this)
  }
}

export class PageStmt implements IStmt {
  children: IStmt[]

  constructor(children: IStmt[]) {
    this.children = children
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPageStmt(this)
  }
}

export class IfStmt implements IStmt {
  primaryExpression: IExpr
  primaryMeml: IStmt | IExpr
  elif: { expr: IExpr; meml: IStmt | IExpr }[]
  elseMeml: IStmt | IExpr | null

  constructor(
    primaryExpression: IExpr,
    primaryMeml: IStmt | IExpr,
    elif: { expr: IExpr; meml: IStmt | IExpr }[],
    elseMeml: IStmt | IExpr | null
  ) {
    this.primaryExpression = primaryExpression
    this.primaryMeml = primaryMeml
    this.elif = elif
    this.elseMeml = elseMeml
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this)
  }
}

export class ForStmt implements IStmt {
  input: IExpr
  output: Token
  template: IStmt

  constructor(input: IExpr, output: Token, template: IStmt) {
    this.input = input
    this.output = output
    this.template = template
  }

  // Visitor pattern
  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitForStmt(this)
  }
}
