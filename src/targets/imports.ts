import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import fetch from 'node-fetch'

import { MemlCore } from '../index'
import { ImportStmt } from '../parser/Stmt'
import { relativeLink } from './loaders'

export async function contentImport({
  isUrl,
  filePath,
  rawPath,
  memlPath,
  stmt,
}: {
  isUrl: boolean
  filePath: string
  rawPath: string
  memlPath: string
  stmt: ImportStmt
}): Promise<string> {
  for (const loader of MemlCore.globalLoaders) {
    if (loader.config.file.test(filePath)) {
      if (isUrl) {
        // Check if the loader allows for web content imports
        if (loader.config.web.content) {
          return loader.linkPath(
            rawPath,
            await loader.contentImport(
              await (await fetch(rawPath)).text(),
              rawPath,
              MemlCore.isProduction
            )
          )
        }
      } else {
        if (loader.config.local.content) {
          // Read the file from disk
          const contents = (await readFile(filePath)).toString()

          const parsed = await loader.contentImport(
            contents,
            rawPath,
            MemlCore.isProduction
          )

          if (MemlCore.shouldLink) {
            const memlFileOut = join(
              MemlCore.distPath,
              memlPath.replace(MemlCore.sourcePath, '')
            )
            const path = await relativeLink(
              parsed,
              join(dirname(memlPath), rawPath),
              memlFileOut
            )

            return loader.linkPath(path, parsed)
          } else {
            return loader.linkInline(parsed)
          }
        }
      }
    }
  }

  MemlCore.errorAtToken(
    stmt.fileToken,
    'There is no loader for this file. Try install one'
  )

  return ''
}
