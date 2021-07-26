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
    if (typeof obj == 'boolean') return obj as boolean

    return true
  }

  protected isEqual(left: EnvValidTypes, right: EnvValidTypes): boolean {
    if (left === null && right === null) return false
    if (left === null) return false

    return left == right
  }
}
