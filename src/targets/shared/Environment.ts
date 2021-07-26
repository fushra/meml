import { MemlCore } from '../../core'
import { Token } from '../../scanner/Token'
import { ComponentDefinition } from './ComponentDefinition'

export type EnvValidTypes = string | number | boolean | EnvValidTypes[]

export type EnvStore = EnvValidTypes | ComponentDefinition

export class Environment {
  enclosing: Environment
  private values: Map<string, EnvStore> = new Map()

  constructor(enclosing: Environment = null) {
    this.enclosing = enclosing
  }

  define(name: string, value: EnvStore): void {
    this.values.set(name, value)
  }

  assign(name: Token, value: EnvStore): void {
    if (this.values.has(name.literal)) {
      this.values.set(name.literal, value)
      return
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value)
      return
    }

    MemlCore.errorAtToken(name, `Undefined variable`)
  }

  get(name: Token): EnvStore | void {
    if (this.values.has(name.literal)) {
      return this.values.get(name.literal)
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name)
    }

    MemlCore.errorAtToken(name, `Undefined variable '${name.literal}'.`)
  }
}
