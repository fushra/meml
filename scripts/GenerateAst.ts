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
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visit${className}${baseName}(this)
  }
}`
}

const defineVisitor = (baseName: string, types: string[]) => `
interface
`

function defineAst(outDir: string, baseName: string, types: any) {
  const path = `${outDir}/${baseName}.ts`

  const contents = `
import { Token } from '../scanner/Token'

export interface Visitor<R> {
  ${Object.keys(types)
    .map((key) => {
      const fields = types[key]
      const className = key + baseName

      return `visit${className}: (${baseName.toLowerCase()}: ${className}) => R`
    })
    .join('\n')}
}

export interface I${baseName} {
  accept: <R>(visitor: Visitor<R>) => R
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

defineAst('./src/parser', 'Expr', {
  Binary: ['left: IExpr', 'operator: Token', 'right: IExpr'],
  Grouping: ['expression: IExpr'],
  Literal: ['value: any'],
  Unary: ['operator: Token', 'right: IExpr'],
  Tag: ['name: Token', 'right: IExpr[]'],
  Page: ['children: IExpr[]'],
})
