import { minify } from 'terser'

import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader, LoaderConfig } from './ILoader'

export class JSLoader implements ILoader {
  config: LoaderConfig = {
    web: {
      destructure: false,
      content: true,
    },

    local: {
      destructure: false,
      content: true,
    },

    file: RegExp('.+\\.js'),
    name: 'meml-loader-javascript',
  }

  linkPath(path: string, content: string): string {
    return `<script src="${path}"></script>`
  }

  linkInline(content: string): string {
    return `<script>${content}</script>`
  }

  destructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('[JS] Method not implemented.')
  }

  async contentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    return production ? (await minify(pathContents)).code : pathContents
  }
}
