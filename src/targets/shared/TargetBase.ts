import { BinaryExpr } from 'src/parser/Expr'
import { TokenType } from 'src/scanner/TokenTypes'
import { Environment, EnvStore, EnvValidTypes } from './Environment'

export class TargetBase {
  environment = new Environment()
  exports = new Map<string, EnvStore>()

  path: string

  constructor(path: string) {
    this.path = path
  }

  // ===========================================================================
  // Utility functions
  //

  async evaluate(expr: any): Promise<EnvValidTypes> {
    return await expr.accept(this)
  }

  protected isTruthy(obj: EnvValidTypes): boolean {
    if (obj === null || obj === 'null') return false
    if (typeof obj == 'boolean') return obj

    return true
  }

  protected isEqual(left: EnvValidTypes, right: EnvValidTypes): boolean {
    if (left === null && right === null) return false
    if (left === null) return false

    return left == right
  }

  protected async evaluateBinaryExpr(
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
          return left + right
        }

        if (typeof left == 'string' && typeof right == 'string') {
          return left + right
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
}
