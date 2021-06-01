import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'

export interface ILoader {
  supportsWebImport: boolean
  supportsLocalImport: boolean
  supportsDestructureImport: boolean
  supportContentImport: boolean

  fileMatch: RegExp
  name: string

  webDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>>
  webContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string>

  localDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>>
  localContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string>
}

export class CLoader implements ILoader {
  supportsWebImport: boolean
  supportsLocalImport: boolean
  supportsDestructureImport: boolean
  supportContentImport: boolean
  fileMatch: RegExp
  name: string
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
  localContentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
