import { command, run, string, number, positional, option } from 'cmd-ts'

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
    console.log(args)
  },
})

run(cmd, process.argv.slice(2))
