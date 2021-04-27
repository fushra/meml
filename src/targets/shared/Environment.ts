import { MemlC } from '../../core'
import { Token } from '../../scanner/Token'

export class Environment {
  private values: Map<string, any> = new Map()

  define(name: string, value: any) {
    this.values.set(name, value)
  }

  get(name: Token): any {
    if (this.values.has(name.literal)) {
      return this.values.get(name.literal)
    }

    MemlC.errorAtToken(name, `Undefined variable '${name.literal}'.`)
  }
}
