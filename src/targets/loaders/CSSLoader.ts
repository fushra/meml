import CleanCSS from 'clean-css'

import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader } from './ILoader'

export class CSSLoader implements ILoader {
  supportsWebImport = true
  supportsLocalImport = true

  supportsDestructureImport = false
  supportContentImport = true

  fileMatch = new RegExp('.+\\.css')
  name = 'meml-css-loader'

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
    return `<link rel="stylesheet" href="${path}">`
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
    return `<style>${
      production ? new CleanCSS().minify(pathContents) : pathContents
    }</style>`
  }
}
