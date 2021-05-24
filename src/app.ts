import { command, run, string, array, option, multioption } from 'cmd-ts'
import { readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { MemlCore } from './core'

const currentDir = process.cwd()

const cmd = command({
  name: 'memlc',
  description: 'The fushra meml transpiler core',
  version: '1.0.0',
  args: {
    file: multioption({
      type: array(string),
      long: 'file',
      short: 'f',
      description: 'The path to your meml file',
    }),
    src: option({
      type: {
        ...string,
        defaultValue: () => './',
        defaultValueIsSerializable: true,
      },
      long: 'src',
      short: 's',
      description: 'A root path that the compiler will use rather',
    }),
    out: option({
      type: {
        ...string,
        defaultValue: () => './',
        defaultValueIsSerializable: true,
      },
      long: 'out',
      short: 'o',
      description:
        'Where the compiled outputs will be written. Best used with --src',
    }),
  },
  handler: (args) => {
    console.time('Compile time')

    const src = resolve(currentDir, args.src)
    const out = resolve(currentDir, args.out)

    args.file.forEach((file) => {
      const realPath = join(src, file)
      const realOut = join(out, file.replace('.meml', '.html'))

      const c = new MemlCore()
      writeFileSync(realOut, c.fileToWeb(realPath))
    })

    if (args.file.length == 0) {
      console.log('--help for list of commands')
    }

    console.timeEnd('Compile time')
  },
})

run(cmd, process.argv.slice(2))
