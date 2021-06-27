import { fs, path } from '../../fs'
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

  compiled = new Map<string, string>()
  lastID = 0

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
    srcPath: string,
    production: boolean,
    shouldLink: boolean,
    linkDirectory: string,
    root: string
  ): Promise<string> {
    if (shouldLink) {
      if (this.compiled.has(srcPath)) {
        return `<script src="${this.compiled.get(srcPath)}"></script>`
      } else {
        const storagePath = path.join(
          linkDirectory,
          'js',
          `${this.lastID++}.js`
        )
        this.compiled.set(srcPath, storagePath)
        fs.writeFileSync(
          storagePath,
          production ? minify(pathContents) : pathContents
        )
      }
    } else {
      return `<script>${
        production ? minify(pathContents) : pathContents
      }</script>`
    }
  }
}
