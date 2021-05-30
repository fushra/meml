#!/usr/bin/env node

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cmd_ts_1 = require("cmd-ts");
const fs_1 = require("fs");
const path_1 = require("path");
const core_1 = require("./core");
const currentDir = process.cwd();
const cmd = cmd_ts_1.command({
    name: 'memlc',
    description: 'The fushra meml transpiler core',
    version: '1.0.0',
    args: {
        file: cmd_ts_1.multioption({
            type: cmd_ts_1.array(cmd_ts_1.string),
            long: 'file',
            short: 'f',
            description: 'The path to your meml file',
        }),
        src: cmd_ts_1.option({
            type: {
                ...cmd_ts_1.string,
                defaultValue: () => './',
                defaultValueIsSerializable: true,
            },
            long: 'src',
            short: 's',
            description: 'A root path that the compiler will use rather',
        }),
        out: cmd_ts_1.option({
            type: {
                ...cmd_ts_1.string,
                defaultValue: () => './',
                defaultValueIsSerializable: true,
            },
            long: 'out',
            short: 'o',
            description: 'Where the compiled outputs will be written. Best used with --src',
        }),
    },
    handler: async (args) => {
        console.time('Compile time');
        const src = path_1.resolve(currentDir, args.src);
        const out = path_1.resolve(currentDir, args.out);
        for (const file of args.file) {
            const realPath = path_1.join(src, file);
            const realOut = path_1.join(out, file.replace('.meml', '.html'));
            const c = new core_1.MemlCore();
            fs_1.writeFileSync(realOut, await c.fileToWeb(realPath));
        }
        if (args.file.length == 0) {
            console.log('--help for list of commands');
        }
        console.timeEnd('Compile time');
    },
});
cmd_ts_1.run(cmd, process.argv.slice(2));
//# sourceMappingURL=app.js.map