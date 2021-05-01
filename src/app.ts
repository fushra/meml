import { command, run, string, array, positional, multioption } from 'cmd-ts'
import { readFileSync, writeFileSync } from 'fs'
import { MemlC } from './core'

const cmd = command({
  name: 'memlc',
  description: 'The fushra meml transpiler core',
  version: '1.0.0',
  args: {
    file: multioption({
      type: array(string),
      long: 'file',
      description: 'The path to your meml file',
    }),
  },
  handler: (args) => {
    console.time('Compile time')

    args.file.forEach((file) => {
      const out = file.replace('.meml', '.html')
      const meml = readFileSync(file).toString()
      const c = new MemlC()
      writeFileSync(out, c.translate(meml, file))
    })

    if (args.file.length == 0) {
      console.log('--help for list of commands')
    }

    console.timeEnd('Compile time')
  },
})

run(cmd, process.argv.slice(2))
