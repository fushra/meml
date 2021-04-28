import { MemlC } from '../../core'
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

  assign(name: Token, value: any) {
    if (this.values.has(name.literal)) {
      this.values.set(name.literal, value)
      return
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name.literal, value)
      return
    }

    MemlC.error(-1, `Undefined variable '${name}'.`)
  }

  get(name: Token): any {
    if (this.values.has(name.literal)) {
      return this.values.get(name.literal)
    }

    if (this.enclosing != null) return this.enclosing.get(name)

    MemlC.errorAtToken(name, `Undefined variable '${name.literal}'.`)
  }
}
