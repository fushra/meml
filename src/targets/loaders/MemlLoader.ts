import { MemlCore } from '../../core'
import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { Web } from '../Web'
import { ILoader } from './ILoader'

export class MemlLoader implements ILoader {
  supportsWebImport = false
  supportsLocalImport = true

  supportsDestructureImport = true
  supportContentImport = false

  fileMatch = new RegExp('.+\\.meml')
  name = 'meml-meml-loader'

  webDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[]
  ): Promise<Map<string, string | ComponentDefinition>> {
    throw new Error('Method not implemented.')
  }
  webContentImport(pathContents: string, path: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async localDestructureImport(
    pathContents: string,
    path: string,
    toImport: Token[]
  ): Promise<Map<string, string | ComponentDefinition>> {
    const coreInstance = new MemlCore()

    const fileContents = coreInstance.tokenizeAndParse(pathContents, path)
    const context = new Web(path)
    await context.convert(fileContents)

    return context.exports
  }

  localContentImport(pathContents: string, path: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
