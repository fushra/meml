import { MemlCore } from '../../core'
import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { Web } from '../Web'
import { ILoader, LoaderConfig } from './ILoader'

export class MemlLoader implements ILoader {
  config: LoaderConfig = {
    web: {
      destructure: true,
      content: true,
    },

    local: {
      destructure: true,
      content: true,
    },

    file: new RegExp('.+\\.meml'),
    name: 'meml-loader-meml',
  }

  linkPath(path: string, content: string): string {
    return content
  }

  linkInline(content: string): string {
    return content
  }

  async destructureImport(
    pathContents: string,
    path: string,
    toImport: Token[],
    production: boolean
  ): Promise<Map<string, string | ComponentDefinition>> {
    const coreInstance = new MemlCore()

    const fileContents = coreInstance.tokenizeAndParse(pathContents, path)
    const context = new Web(path)
    await context.convert(fileContents)

    return context.exports as unknown as Map<
      string,
      string | ComponentDefinition
    >
  }

  async contentImport(
    pathContents: string,
    path: string,
    production: boolean
  ): Promise<string> {
    const coreInstance = new MemlCore()

    const fileContents = coreInstance.tokenizeAndParse(pathContents, path)
    const context = new Web(path)
    return await context.convert(fileContents)
  }
}
