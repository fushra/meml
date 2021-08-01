import fetch from 'node-fetch'

import { readFile } from 'fs/promises'
import { dirname, join } from 'path'

import { TokenType } from '../scanner/TokenTypes'
import {
  ArrayExpr,
  BinaryExpr,
  DestructureExpr,
  ExprVisitor,
  GroupingExpr,
  IdentifierExpr,
  LiteralExpr,
  MemlPropertiesExpr,
  UnaryExpr,
} from '../parser/Expr'
import {
  ComponentStmt,
  ExportStmt,
  ExpressionStmt,
  ForStmt,
  IfStmt,
  ImportStmt,
  MemlStmt,
  PageStmt,
  StmtVisitor,
} from '../parser/Stmt'
import {
  Environment,
  EnvValidTypes,
  TargetBase,
  ComponentDefinition,
} from './shared'
import { Tags } from '../scanner/Tags'
import { MemlCore } from '../core'
import { ILoader } from './loaders'
import { errorAtToken, formatContext, linterAtToken } from '../utils/Logging'

export class Web
  extends TargetBase
  implements
    ExprVisitor<Promise<EnvValidTypes | null>>,
    StmtVisitor<Promise<string>>
{
  // TODO: Implement these
  visitDestructureExpr: (
    expr: DestructureExpr
  ) => Promise<string | number | boolean>

  // Start converting the file
  async convert(token: PageStmt): Promise<string> {
    return await this.visitPageStmt(token)
  }

  // ===========================================================================
  // Import and export statements
  async visitExportStmt(stmt: ExportStmt): Promise<string> {
    if (this.exports.size !== 0 && typeof this.exports.size !== 'undefined') {
      linterAtToken(
        stmt.exportToken,
        'There should only be one export statement per meml file'
      )

      console.log('It is recommended to combine multiple exports into one')
      console.log(formatContext(`(export (foo, bar, baz))`))
    }

    stmt.exports.items.forEach((exportedItem) => {
      const environmentItem = this.environment.get(exportedItem)

      if (environmentItem)
        this.exports.set(exportedItem.literal, environmentItem)
    })

    return ''
  }

  async visitImportStmt(stmt: ImportStmt): Promise<string> {
    const rawPath = stmt.file
    const filePath = join(dirname(this.path), stmt.file)
    const isUrl =
      rawPath
        .replace('http://', '')
        .replace('https://', '')
        .replace('://', '') != rawPath

    if (stmt.imports !== null) {
      let importedSomething = false

      // Loop through all of the loaders
      for (const loader of MemlCore.globalLoaders) {
        // Check if this loader fits
        if (loader.config.file.test(filePath)) {
          // Check if this is a web resource
          if (isUrl) {
            // Check if the current loader allows for web destructure imports
            if (loader.config.web.destructure) {
              // Download the resources
              const contents = await (await fetch(rawPath)).text()

              // Pass it into the loader
              await this.destructureImport({
                loader,
                contents,
                filePath,
                stmt,
                rawPath,
              })

              importedSomething = true
              break
            }
          } else {
            // Check if the current loader allows for local destructure imports
            if (loader.config.local.destructure) {
              // Load all of the contents of the files
              const contents = (await readFile(filePath)).toString()

              // Pass it into the loader
              await this.destructureImport({
                loader,
                contents,
                filePath,
                stmt,
                rawPath,
              })

              importedSomething = true
              break
            }
          }
        }
      }

      if (!importedSomething) {
        errorAtToken(
          stmt.fileToken,
          'There is no loader that can import this file',
          this.path
        )
      }
    } else {
      // This is an import tag without specified content, for example:
      // (import "./example.css")
      // The following should be handled in this section
      // [ ] Check its file type and appropriately handle it
      // [ ] Check if its a url and appropriately handle it
    }

    return ''
  }

  private async destructureImport({
    loader,
    contents,
    filePath,
    stmt,
    rawPath,
  }: {
    loader: ILoader
    contents: string
    filePath: string
    stmt: ImportStmt
    rawPath: string
  }) {
    const fileExports = await loader.destructureImport(
      contents,
      filePath,
      stmt.imports == 'everything' ? [] : stmt.imports.items,
      MemlCore.isProduction
    )

    if (stmt.imports == 'everything') {
      // Dump everything into the current environment
      fileExports.forEach((value, key) => this.environment.define(key, value))
    } else {
      // Import only what we want
      stmt.imports.items.forEach((key) => {
        if (fileExports.has(key.literal)) {
          this.environment.define(key.literal, fileExports.get(key.literal))
        } else {
          errorAtToken(
            key,
            `The export from ${rawPath} doesn't contain the export ${key.lexeme}`,
            this.path
          )
        }
      })
    }
  }

  // ===========================================================================
  // Stmt visitor pattern implementations

  async visitMemlStmt(stmt: MemlStmt): Promise<string> {
    // Check if this is a default tag. If it is, then we should pass it through to
    // html
    if (Tags.has(stmt.tagName.literal)) {
      const evaluatedProps = []

      for (const prop of stmt.props) {
        evaluatedProps.push(await this.evaluate(prop))
      }

      const children = []

      for (const el of stmt.exprOrMeml) {
        children.push(await this.evaluate(el))
      }

      return `<${stmt.tagName.literal.toString()}${
        stmt.props.length !== 0 ? ` ${evaluatedProps.join(' ')} ` : ''
      }>${children.join('')}</${stmt.tagName.literal.toString()}>`
    } else {
      // Otherwise, the tag may be a custom component and thus we should try and
      // retrieve it from the environment
      const tag = this.environment.get(stmt.tagName) as ComponentDefinition

      // If we have an undefined tag, we will just return an empty string, to
      // let the compile finish properly
      if (typeof tag == 'undefined') {
        return ''
      }

      // Now the environment that will be used to evaluate each component needs to be created
      // First, save the old environment so it can be restored once we are done
      const previousEnv = this.environment

      // Next, lets create a new environment specific for this component
      const newEnv = new Environment(this.environment)

      // Now for prop checking time. We will loop through all of the props that
      // have been specified and try to add them. If they haven't been added
      // we throw an error
      for (const token of tag.propsList()) {
        const identifier = token.literal

        let value

        // Search for the identifier in the props
        for (const prop of stmt.props) {
          if (prop.name.literal === identifier) {
            value = await this.evaluate(prop.value)
          }
        }

        if (!value) {
          // If we can't find the value error
          errorAtToken(
            stmt.tagName,
            `Missing tag prop '${identifier}'`,
            this.path
          )
          return
        }

        // Since it does exist, we can define it in the environment
        newEnv.define(identifier, value)
      }

      // Set the new environment to be the one we just generated
      this.environment = newEnv

      // Construct the tag
      const constructed = await tag.construct(this)

      // Restore the previous environment
      this.environment = previousEnv

      // Return the constructed tag with all of the props
      return constructed
    }
  }

  async visitExpressionStmt(stmt: ExpressionStmt): Promise<string> {
    return (await this.evaluate(stmt.expression)).toString()
  }

  async visitPageStmt(stmt: PageStmt): Promise<string> {
    const children = []

    for (const el of stmt.children) {
      children.push(await this.evaluate(el))
    }

    return `<!DOCTYPE html><html>${children.join('')}</html>`
  }

  async visitComponentStmt(stmt: ComponentStmt): Promise<string> {
    if (Tags.has(stmt.tagName.literal)) {
      linterAtToken(
        stmt.tagName,
        `The component '${stmt.tagName.literal}' shares a name with a html tag. Defaulting to html tag.`
      )
    }

    // Add the component tot the environment
    this.environment.define(
      stmt.tagName.literal,
      new ComponentDefinition(stmt.props, stmt.meml, stmt.tagName.literal)
    )

    // When you visit a component, you visit the definition. Therefore
    // we do not return anything to influence the meml file
    return ''
  }

  async visitIfStmt(stmt: IfStmt): Promise<string> {
    // If the first statement matches, return its executed value
    if (this.isTruthy(await this.evaluate(stmt.primaryExpression))) {
      return (await this.evaluate(stmt.primaryMeml)).toString()
    }

    // Loop through all the else-ifs
    for (const elseif of stmt.elif) {
      if (this.isTruthy(await this.evaluate(elseif.expr))) {
        return (await this.evaluate(elseif.meml)).toString()
      }
    }

    // Otherwise return the default value if it exists
    if (stmt.elseMeml !== null) {
      return (await this.evaluate(stmt.elseMeml)).toString()
    }

    // Otherwise return nothing
    return ''
  }

  async visitForStmt(stmt: ForStmt): Promise<string> {
    let result = ''

    let input = await this.evaluate(stmt.input)

    // Ensure it is an array
    if (typeof input !== 'object' || !(input instanceof Array)) {
      errorAtToken(
        stmt.output,
        'The input to the for statement must be an array',
        this.path
      )
    }

    // Tell typescript that it now must be an array
    input = input as (string | number | boolean)[]

    // Loop through the array
    for (const item of input) {
      // Store the previous environment to retrieve it later
      const previousEnv = this.environment

      // Create a new containing environment
      this.environment = new Environment(this.environment)

      // Put the item into the environnement under the correct name
      this.environment.define(stmt.output.literal, item)

      // Evaluate the statement included
      result += await this.evaluate(stmt.template)

      // Restore the old environment
      this.environment = previousEnv
    }

    // Return the final result
    return result
  }

  // ===========================================================================
  // Expr visitor pattern implementations

  // visitIdentifierExpr: (expr: IdentifierExpr) => string | number | boolean
  async visitIdentifierExpr(
    expr: IdentifierExpr
  ): Promise<string | number | boolean> {
    const variable = this.environment.get(expr.token)

    // If the variable doesn't exist return null and continue, an error has
    // already been logged to the console
    if (typeof variable == 'undefined') {
      return `[undefined variable ${expr.token.literal.toString()}]`
    }

    return variable as string | number | boolean
  }

  async visitMemlPropertiesExpr(expr: MemlPropertiesExpr): Promise<string> {
    return `${expr.name.literal.toString()}="${(
      await this.evaluate(expr.value)
    ).toString()}"`
  }

  async visitLiteralExpr(
    expr: LiteralExpr
  ): Promise<string | number | boolean | null> {
    if (expr.value === null) return 'null'
    return expr.value
  }

  async visitGroupingExpr(expr: GroupingExpr): Promise<EnvValidTypes> {
    if (expr.expressions.length === 1) {
      return await this.evaluate(expr.expressions[0])
    }

    let out = ''

    for (const child of expr.expressions) {
      out += await this.evaluate(child)
    }

    return out
  }

  async visitUnaryExpr(expr: UnaryExpr): Promise<number | boolean | null> {
    const right = await this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -right
      case TokenType.BANG:
        return !this.isTruthy(right)
    }

    return null
  }

  async visitBinaryExpr(
    expr: BinaryExpr
  ): Promise<number | boolean | string | null> {
    return this.evaluateBinaryExpr(expr)
  }

  async visitArrayExpr(expr: ArrayExpr): Promise<EnvValidTypes[]> {
    const values = []

    for (const item of expr.items) {
      values.push(await this.evaluate(item))
    }

    return values
  }
}
