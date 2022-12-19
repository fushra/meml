import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader, LoaderConfig } from './ILoader'

export class CSSLoader implements ILoader {
  config: LoaderConfig = {
    web: {
      destructure: false,
      content: true,
    },

    local: {
      destructure: false,
      content: true,
    },

    file: new RegExp('.+\\.css'),
    name: 'meml-loader-css',
  }

  linkPath(path: string, content: string): string {
    return `<link rel="stylesheet" type="type/css" rel="${path}">`
  }

  linkInline(content: string): string {
    return `<style>${content}</style>`
  }

  destructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('[CSS] Method not implemented.')
  }

  async contentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    return production
      ? pathContents.replace(/\s+/g, ' ').replace(/\n/g, '')
      : pathContents
  }
}
