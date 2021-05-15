import { readFileSync } from 'fs'
import { dirname, join, extname } from 'path'

import { TokenType } from '../scanner/TokenTypes'
import {
  BinaryExpr,
  DestructureExpr,
  ExprVisitor,
  GroupingExpr,
  IdentifierExpr,
  IExpr,
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
import { MemlC } from '../core'

export class Web
  implements
    ExprVisitor<string | number | boolean | null>,
    StmtVisitor<string> {
  // Memory storage for SS execution
  environment = new Environment()
  exports = new Map<string, any>()

  // The path to the file we are currently executing
  path: string

  constructor(path: string) {
    this.path = path
  }

  // TODO: Implement these
  visitDestructureExpr: (expr: DestructureExpr) => string | number | boolean

  // Start converting the file
  convert(token: PageStmt): string {
    return this.visitPageStmt(token)
  }

  // ===========================================================================
  // Import and export statements
  visitExportStmt(stmt: ExportStmt): string {
    if (exports.size !== 0 && typeof exports.size !== 'undefined')
      MemlC.linterAtToken(
        stmt.exportToken,
        'There should only be one export statement per meml file'
      )

    stmt.exports.items.forEach((exportedItem) => {
      this.exports.set(exportedItem.literal, this.environment.get(exportedItem))
    })

    return ''
  }

  visitImportStmt(stmt: ImportStmt): string {
    const rawPath = stmt.file
    const filePath = join(dirname(this.path), stmt.file)
    const isUrl =
      rawPath.replace('http://', '').replace('https://', '') != rawPath

    if (stmt.imports !== null) {
      // Check if it is a url. If it is, it cannot be imported in this way
      if (isUrl) {
        MemlC.errorAtToken(
          stmt.fileToken,
          `You cannot perform this type of import on a url. Try using (import "[url]") for html and css resources instead`
        )
      }

      // Import a meml file
      const c = new MemlC()
      const fileParsed = c.parseFile(filePath)

      // Execute it to get it's exports
      const context = new Web(filePath)
      context.convert(fileParsed)

      if (stmt.imports === 'everything') {
        context.exports.forEach((value, key) =>
          this.environment.define(value, key)
        )
      } else {
        stmt.imports.items.forEach((identifier) => {
          if (!context.exports.has(identifier.literal))
            MemlC.errorAtToken(
              identifier,
              `The file '${stmt.file}' doesn't export '${identifier.literal}'`
            )

          this.environment.define(
            identifier.literal,
            context.exports.get(identifier.literal)
          )
        })
      }
    } else {
      // This is an import tag without specified content, for example:
      // (import "./example.css")
      // The following should be handled in this section
      // [ ] Check its file type and appropriately handle it
      // [ ] Check if its a url and appropriately handle it

      // Get the extension name for niceness
      const fileExtension = extname(rawPath)

      if (isUrl) {
        // Handle urls here
        switch (fileExtension) {
          case '.html':
            // Error out. Getting html files from the web is a massive security hazard
            MemlC.errorAtToken(
              stmt.fileToken,
              `You cannot import page from the internet`
            )
            break

          case '.meml':
            // Error out. Getting meml files from the web is a massive security hazard
            MemlC.errorAtToken(
              stmt.fileToken,
              `You cannot import meml file from the internet`
            )
            break

          case '.css':
            // Link to this resource
            return `<link rel="stylesheet" href="${rawPath}">`

          case '.js':
            // Return a script with a src pointing to this resource
            return `<script src="${rawPath}"></script>`

          default:
            MemlC.errorAtToken(
              stmt.fileToken,
              `Unknown file extension '${fileExtension}'`
            )
        }
      } else {
        // Must be a local file
        switch (fileExtension) {
          case '.html':
            // Dump its contents into a meml file
            return readFileSync(filePath).toString()

          case '.meml':
            // Parse the meml file and dump it into the web page
            const c = new MemlC()
            const fileParsed = c.parseFile(filePath)

            const context = new Web(filePath)
            return context.convert(fileParsed)

          case '.css':
            // Link to this resource
            return `<style>${readFileSync(filePath)}</style>`

          case '.js':
            // Return a script with a src pointing to this resource
            return `<script>${readFileSync(filePath)}</script>`

          default:
            MemlC.errorAtToken(
              stmt.fileToken,
              `Unknown file extension '${fileExtension}'`
            )
        }
      }

      return `<style>${readFileSync(filePath)}</style>`
    }

    return ''
  }

  // ===========================================================================
  // Stmt visitor pattern implementations

  visitMemlStmt(stmt: MemlStmt): string {
    // Check if this is a default tag. If it is, then we should pass it through to
    // html
    if (Tags.has(stmt.tagName.literal)) {
      return `<${stmt.tagName.literal}${
        stmt.props.length !== 0
          ? ` ${stmt.props.map((prop) => this.evaluate(prop)).join(' ')} `
          : ''
      }>${stmt.exprOrMeml.map((el) => this.evaluate(el)).join('')}</${
        stmt.tagName.literal
      }>`
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
      tag.propsList().forEach((token) => {
        const identifier = token.literal

        let value

        // Search for the identifier in the props
        stmt.props.forEach((prop) => {
          if (prop.name.literal === identifier) {
            value = this.evaluate(prop.value)
          }
        })

        if (!value) {
          // If we can't find the value error
          MemlC.errorAtToken(stmt.tagName, `Missing tag prop '${identifier}'`)
          return
        }

        // Since it does exist, we can define it in the environment
        newEnv.define(identifier, value)
      })

      // Set the new environment to be the one we just generated
      this.environment = newEnv

      // Construct the tag
      const constructed = tag.construct(this)

      // Restore the previous environment
      this.environment = previousEnv

      // Return the constructed tag with all of the props
      return constructed
    }
  }

  visitExpressionStmt(stmt: ExpressionStmt): string {
    return this.evaluate(stmt.expression).toString()
  }

  visitPageStmt(stmt: PageStmt): string {
    return `<!DOCTYPE html><html>${stmt.children
      .map((el) => this.evaluate(el))
      .join('')}</html>`
  }

  visitComponentStmt(stmt: ComponentStmt): string {
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
  visitIdentifierExpr(expr: IdentifierExpr): string | number | boolean {
    const variable = this.environment.get(expr.token)

    // If the variable doesn't exist return null and continue, an error has
    // already been logged to the console
    if (typeof variable == 'undefined') {
      return `[undefined variable ${expr.token.literal}]`
    }

    return variable
  }

  visitMemlPropertiesExpr(expr: MemlPropertiesExpr): string {
    return `${expr.name.literal}="${this.evaluate(expr.value)}"`
  }

  visitLiteralExpr(expr: LiteralExpr): string | number | boolean | null {
    return expr.value
  }

  visitGroupingExpr(expr: GroupingExpr): string | number | boolean | null {
    return this.evaluate(expr.expression)
  }

  visitUnaryExpr(expr: UnaryExpr): number | boolean | null {
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -right
      case TokenType.BANG:
        return !this.isTruthy(right)
    }

    return null
  }

  visitBinaryExpr(expr: BinaryExpr): number | boolean | string | null {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)

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
        ;(left as number) <= (right as number)

      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right)
    }
  }

  // ===========================================================================
  // Utils

  private evaluate(expr: any): string | number | boolean {
    return expr.accept(this)
  }

  private isTruthy(obj: any): boolean {
    if (obj == null) return false
    if (typeof obj == 'boolean') return obj as boolean

    return true
  }

  private isEqual(left: any, right: any): boolean {
    if (left == null && right == null) return false
    if (left == null) return false

    return left.equal(right)
  }
}
