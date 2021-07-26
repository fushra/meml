import { program } from 'commander'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import kleur from 'kleur'
import fetch from 'node-fetch'
import { dirname, join, resolve } from 'path'

import { MemlCore } from './core'

fetch('https://raw.githubusercontent.com/fushra/meml/main/package.json')
  .then()
  .then(async (res) => {
    const json = await res.json()

    const packagePath = join(__dirname, '..', 'package.json')
    const packageContents = JSON.parse(readFileSync(packagePath).toString())

    if (json.version != packageContents.version) {
      console.log('A new version of meml is available, please upgrade')
    }
  })
  .catch(() => {
    // Errors here do not matter
  })

const currentDir = process.cwd()

program
  .version('1.0.0')
  .description(
    'A basic cli transpiler for meml. For larger projects it is recommended to use "mld"'
  )

program
  .option('--production', 'Optimise for production')
  .option(
    '-f, --file <files...>',
    'The path to the meml files you wish to compile'
  )
  .option(
    '-s, --src <folder>',
    'The root source path the compiler will use',
    './'
  )
  .option(
    '-o, --out <folder>',
    'The location for the compiled output. It is recommended to use this with --src',
    './'
  )
  .option(
    '--dont-link',
    'Do not link included files and insted embed them in the output files'
  )

program.parse(process.argv)

// This is the main loop for the CLI. This comment is necessary because prettier
;(async () => {
  console.time('Compile time')

  const args = program.opts()
  const src = resolve(currentDir, args.src)
  const out = resolve(currentDir, args.out)

  MemlCore.distPath = out
  MemlCore.sourcePath = src
  MemlCore.shouldLink = true

  if (args.production) {
    MemlCore.isProduction = true
  }

  if (args.dontLink) {
    MemlCore.shouldLink = false
  }

  for (const file of args.file) {
    const realPath = join(src, file)
    const realOut = join(out, file.replace('.meml', '.html'))

    const c = new MemlCore()
    mkdirSync(dirname(realOut), { recursive: true })
    writeFileSync(realOut, await c.fileToWeb(realPath))
  }

  if (args.file.length == 0) {
    console.log('--help for list of commands')
  }

  console.timeEnd('Compile time')
})().catch((reason) => {
  console.log(kleur.red(`${kleur.bold(`[APPLICATION ERROR]:`)} ${reason}`))
  process.exit(-1)
})
