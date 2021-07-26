import { mkdir, writeFile } from 'fs/promises'
import { dirname, extname, join, relative } from 'path'

import { MemlCore } from '../../core'

let linkerCache = new Map()
let fileIds = 0

export function resetLinker(): void {
  linkerCache.clear()
  fileIds = 0
}

export async function relativeLink(
  contents: string,
  filePath: string,
  hostPath: string
): Promise<string> {
  let id
  if (linkerCache.has(filePath)) {
    id = linkerCache.get(filePath)
  } else {
    id = ++fileIds
    linkerCache.set(filePath, id)
  }

  const outPath = join(MemlCore.distPath, 'assets')
  const outFile = join(outPath, `${id}${extname(filePath)}`)

  await mkdir(join(MemlCore.distPath, 'assets'), { recursive: true })
  await writeFile(outFile, contents)

  return relative(dirname(hostPath), outFile)
}
