import { minify } from 'terser'

import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader } from './ILoader'

export class JSLoader implements ILoader {
  supportsWebImport = true
  supportsLocalImport = true

  supportsDestructureImport = false //TODO: Add destructure support with dynamics
  supportContentImport = true

  // Maybe in the future JSX / react support could be added
  // Although that might be better left to an external loader
  fileMatch = RegExp('.+\\.js')
  name = 'meml-loader-javascript'

  webDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('Method not implemented.')
  }

  async webContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    return `<script src="${path}"></script>`
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
    return `<script>${
      production ? minify(pathContents) : pathContents
    }</script>`
  }
}
