import { MemlCore } from '../../core'
import { Token } from '../../scanner/Token'

export class Environment {
  enclosing: Environment
  private values: Map<string, any> = new Map()

  constructor(enclosing: Environment = null) {
    this.enclosing = enclosing
  }

  define(name: string, value: any) {
    this.values.set(name, value)
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.literal)) {
      this.values.set(name.literal, value)
      return
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value)
      return
    }

    MemlCore.errorAtToken(name, `Undefined variable`)
  }

  get(name: Token): unknown | void {
    if (this.values.has(name.literal)) {
      return this.values.get(name.literal)
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name)
    }

    MemlCore.errorAtToken(name, `Undefined variable '${name.literal}'.`)
  }
}
