import { MemlCore } from '../../core'
import { Token } from '../../scanner/Token'
import { ComponentDefinition } from './ComponentDefinition'

export class Environment {
  enclosing: Environment
  private values: Map<string, string | number | boolean | ComponentDefinition> =
    new Map()

  constructor(enclosing: Environment = null) {
    this.enclosing = enclosing
  }

  define(name: string, value: string | number | boolean | ComponentDefinition) {
    this.values.set(name, value)
  }

  assign(
    name: Token,
    value: string | number | boolean | ComponentDefinition
  ): void {
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

  get(name: Token): string | number | boolean | ComponentDefinition | void {
    if (this.values.has(name.literal)) {
      return this.values.get(name.literal)
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name)
    }

    MemlCore.errorAtToken(name, `Undefined variable '${name.literal}'.`)
  }
}
