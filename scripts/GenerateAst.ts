import { writeFileSync } from 'fs'

function defineType(baseName: string, className: string, fields: string[]) {
  return `
export class ${className}${baseName} implements I${baseName} {
  ${fields.map((field) => `     ${field}`).join('\n')}
  
  constructor(${fields.join(',')}) {
    ${fields
      .map((field) => {
        const name = field.split(':')[0]
        return `      this.${name} = ${name}`
      })
      .join('\n')}
  }

  // Visitor pattern
  accept<R>(visitor: ${baseName}Visitor<R>): R {
    return visitor.visit${className}${baseName}(this)
  }
}`
}

function defineAst(outDir: string, baseName: string, types: any, imports = '') {
  const path = `${outDir}/${baseName}.ts`

  const contents = `
import { Token } from '../scanner/Token'
${imports}

export interface ${baseName}Visitor<R> {
  ${Object.keys(types)
    .map((key) => {
      const className = key + baseName

      return `  visit${className}: (${baseName.toLowerCase()}: ${className}) => R`
    })
    .join('\n')}
}

export interface I${baseName} {
  accept: <R>(visitor: ${baseName}Visitor<R>) => R
}

${Object.keys(types)
  .map((key, i) => {
    const fields = types[key]
    const className = key

    return defineType(baseName, className, fields)
  })
  .join('\n')}
`

  writeFileSync(path, contents)
}

// #############################################################################
// Config for the ast creator

const outDir = './src/parser'

defineAst(outDir, 'Expr', {
  Binary: ['left: IExpr', 'operator: Token', 'right: IExpr'],
  Grouping: ['expression: unknown'],
  Literal: ['value: any'],
  Unary: ['operator: Token', 'right: IExpr'],
  MemlProperties: ['name: Token', 'value: IExpr'],
  Destructure: ['items: Token[]'],
  Identifier: ['token: Token'],
  Array: ['items: IExpr[]'],
})

defineAst(
  outDir,
  'Stmt',
  {
    Component: ['tagName: Token', 'props: DestructureExpr', 'meml: IStmt'],
    Export: ['exports: DestructureExpr', 'exportToken: Token'],
    Import: [
      'file: string',
      'fileToken: Token',
      'imports: DestructureExpr | null | "everything"',
    ],
    Meml: [
      'tagName: Token',
      'props: MemlPropertiesExpr[]',
      'exprOrMeml: IStmt[]',
    ],
    Expression: ['expression: IExpr'],
    Page: ['children: IStmt[]'],
    If: [
      'primaryExpression: IExpr',
      'primaryMeml: IStmt | IExpr',
      'elif: { expr: IExpr, meml: IStmt | IExpr }[]',
      'elseMeml: IStmt | IExpr | null',
    ],
    For: ['input: IExpr', 'output: Token', 'template: IStmt'],
  },
  'import { IExpr, MemlPropertiesExpr, DestructureExpr } from "./Expr"'
)
