import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'

export interface LoaderConfig {
  web: {
    destructure: boolean
    content: boolean
  }
  local: {
    destructure: boolean
    content: boolean
  }

  file: RegExp
  name: string
}

export interface ILoader {
  config: LoaderConfig

  linkPath(path: string, content: string): string
  linkInline(content: string): string

  destructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>>
  contentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string>
}
