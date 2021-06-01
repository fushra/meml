import { program } from 'commander'
import { writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { MemlCore } from './core'

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

program.parse(process.argv)

// This is the main loop for the CLI. This comment is necessary because prettier
;(async () => {
  console.time('Compile time')

  const args = program.opts()
  const src = resolve(currentDir, args.src)
  const out = resolve(currentDir, args.out)

  if (args.production) {
    MemlCore.isProduction = true
  }

  for (const file of args.file) {
    const realPath = join(src, file)
    const realOut = join(out, file.replace('.meml', '.html'))

    const c = new MemlCore()
    writeFileSync(realOut, await c.fileToWeb(realPath))
  }

  if (args.file.length == 0) {
    console.log('--help for list of commands')
  }

  console.timeEnd('Compile time')
})()
