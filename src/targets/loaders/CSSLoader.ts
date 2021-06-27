import CleanCSS from 'clean-css'

import { Token } from '../../scanner/Token'
import { ComponentDefinition } from '../shared/ComponentDefinition'
import { ILoader } from './ILoader'
import { fs, path } from '../../fs'

export class CSSLoader implements ILoader {
  supportsWebImport = true
  supportsLocalImport = true

  supportsDestructureImport = false // TODO: CSS Modules
  supportContentImport = true

  fileMatch = new RegExp('.+\\.css')
  name = 'meml-loader-css'

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
    srcPath: string,
    production: boolean,
    shouldLink: boolean,
    linkDirectory: string,
    root: string
  ): Promise<string> {
    if (shouldLink) {
      if (!this.compiled.has(srcPath)) {
        // The filesystem path where this file should be stored
        const storagePath = path.join(
          linkDirectory,
          'css',
          `${this.lastID}.css`
        )
        // Record the path that it can be reference from within the website
        this.compiled.set(srcPath, path.join(root, 'css', `${this.lastID}.css`))

        // Create the css directory just in case
        fs.mkdirSync(path.join(linkDirectory, 'css'), { recursive: true })

        // Write th efile to disk
        fs.writeFileSync(
          storagePath,
          production ? new CleanCSS().minify(pathContents).styles : pathContents
        )

        // Increment the file counter
        this.lastID++
      }

      // Return a link to this file
      return `<link rel="stylesheet" type="text/css" rel="${this.compiled.get(
        srcPath
      )}">`
    } else {
      return `<style>${
        production ? new CleanCSS().minify(pathContents).styles : pathContents
      }</style>`
    }
  }
}
