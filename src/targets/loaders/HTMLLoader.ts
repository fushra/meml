import { minify } from 'html-minifier-terser'

import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader } from './ILoader'

export class HTMLLoader implements ILoader {
  supportsWebImport = false
  supportsLocalImport = true
  supportsDestructureImport = false
  supportContentImport = true

  fileMatch = new RegExp('.+\\.html?')
  name = 'meml-loader-html'

  webDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('Method not implemented.')
  }
  webContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  localDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('Method not implemented.')
  }
  async localContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    return production ? minify(pathContents) : pathContents
  }
}
