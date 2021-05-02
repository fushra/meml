"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cmd_ts_1 = require("cmd-ts");
const fs_1 = require("fs");
const core_1 = require("./core");
const cmd = cmd_ts_1.command({
    name: 'memlc',
    description: 'The fushra meml transpiler core',
    version: '1.0.0',
    args: {
        file: cmd_ts_1.multioption({
            type: cmd_ts_1.array(cmd_ts_1.string),
            long: 'file',
            description: 'The path to your meml file',
        }),
    },
    handler: (args) => {
        console.time('Compile time');
        args.file.forEach((file) => {
            const out = file.replace('.meml', '.html');
            const meml = fs_1.readFileSync(file).toString();
            const c = new core_1.MemlC();
            fs_1.writeFileSync(out, c.translate(meml, file));
        });
        if (args.file.length == 0) {
            console.log('--help for list of commands');
        }
        console.timeEnd('Compile time');
    },
});
cmd_ts_1.run(cmd, process.argv.slice(2));
//# sourceMappingURL=app.js.map