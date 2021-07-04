import { mkdirSync, writeFileSync } from 'fs'
import { basename, extname, join, relative } from 'path'
import { MemlCore } from '../../core'

let linkerCache = new Map()
let fileIds = 0

export function resetLinker() {
  linkerCache.clear()
  fileIds = 0
}

export function relativeLink(
  contents: string,
  filePath: string,
  hostPath: string
): string {
  let id
  if (linkerCache.has(filePath)) {
    id = linkerCache.get(filePath)
  } else {
    id = ++fileIds
  }

  const outPath = join(MemlCore.distPath, 'assets')
  const outFile = join(outPath, `${id}${extname(filePath)}`)

  mkdirSync(join(MemlCore.distPath, 'assets'), { recursive: true })
  writeFileSync(outFile, contents)

  return relative(hostPath.replace(basename(hostPath), ''), outFile)
}
