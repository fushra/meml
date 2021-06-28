import fetch from 'node-fetch'

import { fs, path } from '../fs'
const { readFileSync } = fs
const { dirname, join, extname } = path

import { TokenType } from '../scanner/TokenTypes'
import {
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
  ImportStmt,
  IStmt,
  MemlStmt,
  PageStmt,
  StmtVisitor,
} from '../parser/Stmt'
import { Environment } from './shared/Environment'
import { ComponentDefinition } from './shared/ComponentDefinition'
import { Tags } from '../scanner/Tags'
import { MemlC, MemlCore } from '../core'

export class Web
  implements
    ExprVisitor<Promise<string | number | boolean | null>>,
    StmtVisitor<Promise<string>>
{
  // Memory storage for SS execution
  environment = new Environment()
  exports = new Map<string, string | number | boolean | ComponentDefinition>()

  // The path to the file we are currently executing
  path: string

  constructor(path: string) {
    this.path = path
  }

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
      MemlCore.linterAtToken(
        stmt.exportToken,
        'There should only be one export statement per meml file'
      )

      console.log('It is recommended to combine multiple exports into one')
      console.log(MemlCore.formatContext(`(export (foo, bar, baz))`))
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
      rawPath.replace('http://', '').replace('https://', '') != rawPath

    if (stmt.imports !== null) {
      // This implements a custom loader for destructure loaders

      let importedSomething = false

      // Loop through all of the loaders
      for (const loader of MemlCore.globalLoaders) {
        // Check if this loader fits
        if (loader.fileMatch.test(filePath)) {
          // Check if this is a web resource
          if (isUrl) {
            // Check if the current loader allows for web imports
            if (loader.supportsDestructureImport && loader.supportsWebImport) {
              // Download the resources
              const contents = await (await fetch(rawPath)).text()
              // Pass it into the loader
              const fileExports = await loader.webDestructureImport(
                contents,
                rawPath,
                stmt.imports == 'everything' ? [] : stmt.imports.items,
                MemlCore.isProduction
              )

              if (stmt.imports == 'everything') {
                // Dump everything into the current environment
                fileExports.forEach((value, key) =>
                  this.environment.define(key, value)
                )
              } else {
                // Import only what we want
                stmt.imports.items.forEach((key) => {
                  if (fileExports.has(key.literal)) {
                    this.environment.define(
                      key.literal,
                      fileExports.get(key.literal)
                    )
                  } else {
                    MemlC.errorAtToken(
                      key,
                      `The export from ${rawPath} doesn't contain the export ${key}`,
                      this.path
                    )
                  }
                })
              }

              importedSomething = true
              break
            }
          } else {
            // Check if the current loader allows for web imports
            if (
              loader.supportsDestructureImport &&
              loader.supportsLocalImport
            ) {
              // Load all of the contents of the files
              const contents = readFileSync(filePath).toString()
              // Pass it into the loader
              const fileExports = await loader.localDestructureImport(
                contents,
                filePath,
                stmt.imports == 'everything' ? [] : stmt.imports.items,
                MemlCore.isProduction
              )

              if (stmt.imports == 'everything') {
                // Dump everything into the current environment
                fileExports.forEach((value, key) =>
                  this.environment.define(key, value)
                )
              } else {
                // Import only what we want
                stmt.imports.items.forEach((key) => {
                  if (fileExports.has(key.literal)) {
                    this.environment.define(
                      key.literal,
                      fileExports.get(key.literal)
                    )
                  } else {
                    MemlC.errorAtToken(
                      key,
                      `The export from ${rawPath} doesn't contain the export ${key}`,
                      this.path
                    )
                  }
                })
              }

              importedSomething = true
              break
            }
          }
        }
      }

      if (!importedSomething) {
        MemlCore.errorAtToken(
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

      for (const loader of MemlCore.globalLoaders) {
        if (loader.fileMatch.test(filePath)) {
          if (isUrl) {
            if (loader.supportsWebImport && loader.supportContentImport) {
              // Download the resources
              const contents = await (await fetch(rawPath)).text()

              return await loader.webContentImport(
                contents,
                rawPath,
                MemlCore.isProduction
              )
            }
          } else {
            if (loader.supportsLocalImport && loader.supportContentImport) {
              // Read the file from disk
              const contents = readFileSync(filePath).toString()

              return await loader.localContentImport(
                contents,
                filePath,
                MemlCore.isProduction,
                MemlCore.shouldLink,
                MemlCore.distPath,
                MemlCore.rootPath
              )
            }
          }
        }
      }

      MemlCore.errorAtToken(
        stmt.fileToken,
        'There is no loader for this file. Try install one'
      )
    }

    return ''
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

      return `<${stmt.tagName.literal}${
        stmt.props.length !== 0 ? ` ${evaluatedProps.join(' ')} ` : ''
      }>${children.join('')}</${stmt.tagName.literal}>`
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
          MemlCore.errorAtToken(
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
      MemlC.linterAtToken(
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
      return `[undefined variable ${expr.token.literal}]`
    }

    return variable as string | number | boolean
  }

  async visitMemlPropertiesExpr(expr: MemlPropertiesExpr): Promise<string> {
    return `${expr.name.literal}="${await this.evaluate(expr.value)}"`
  }

  async visitLiteralExpr(
    expr: LiteralExpr
  ): Promise<string | number | boolean | null> {
    if (expr.value === null) return 'null'
    return expr.value
  }

  visitGroupingExpr(
    expr: GroupingExpr
  ): Promise<string | number | boolean | null> {
    return this.evaluate(expr.expression)
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
    const left = await this.evaluate(expr.left)
    const right = await this.evaluate(expr.right)

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
        return (left as number) <= (right as number)
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right)
    }
  }

  // ===========================================================================
  // Utils

  private async evaluate(expr: any): Promise<string | number | boolean> {
    return await expr.accept(this)
  }

  private isTruthy(obj: boolean | string | number | null): boolean {
    if (obj === null || obj === 'null') return false
    if (typeof obj == 'boolean') return obj as boolean

    return true
  }

  private isEqual(
    left: boolean | string | number | null,
    right: boolean | string | number | null
  ): boolean {
    if (left === null && right === null) return false
    if (left === null) return false

    return left == right
  }
}
