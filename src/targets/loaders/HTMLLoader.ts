import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader, LoaderConfig } from './ILoader'

export class HTMLLoader implements ILoader {
  config: LoaderConfig = {
    web: {
      destructure: false,
      content: false,
    },

    local: {
      destructure: false,
      content: true,
    },

    file: new RegExp('.+\\.html?'),
    name: 'meml-loader-html',
  }

  linkPath(path: string, content: string): string {
    return content
  }

  linkInline(content: string): string {
    return content
  }

  destructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('[HTML] Method not implemented.')
  }

  async contentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    return production
      ? pathContents.replace(/\s+/g, ' ').replace(/\n/, '')
      : pathContents
  }
}
