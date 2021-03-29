import { command, run, string, number, positional, option } from 'cmd-ts'
import { readFileSync, writeFileSync } from 'fs'
import { MemlC } from './core'

const cmd = command({
  name: 'memlc',
  description: 'The core meml transpiler',
  version: '1.0.0',
  args: {
    file: positional({
      type: string,
      displayName: 'file',
      description: 'The path to your meml file',
    }),
  },
  handler: (args) => {
    const { file } = args
    const out = file.replace('.meml', '.html')

    const meml = readFileSync(file).toString()

    const c = new MemlC()

    writeFileSync(out, c.translate(meml))
  },
})

run(cmd, process.argv.slice(2))
