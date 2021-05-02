"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const core_1 = require("../../core");
class Environment {
    constructor(enclosing = null) {
        this.values = new Map();
        this.enclosing = enclosing;
    }
    define(name, value) {
        this.values.set(name, value);
    }
    assign(name, value) {
        if (this.values.has(name.literal)) {
            this.values.set(name.literal, value);
            return;
        }
        if (this.enclosing != null) {
            this.enclosing.assign(name.literal, value);
            return;
        }
        core_1.MemlC.error(-1, `Undefined variable '${name}'.`);
    }
    get(name) {
        if (this.values.has(name.literal)) {
            return this.values.get(name.literal);
        }
        if (this.enclosing != null)
            return this.enclosing.get(name);
        core_1.MemlC.errorAtToken(name, `Undefined variable '${name.literal}'.`);
    }
}
exports.Environment = Environment;
//# sourceMappingURL=Environment.js.map