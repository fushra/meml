"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemlLoader = void 0;
const core_1 = require("../../core");
const Web_1 = require("../Web");
class MemlLoader {
    constructor() {
        this.supportsWebImport = false;
        this.supportsLocalImport = true;
        this.supportsDestructureImport = true;
        this.supportContentImport = false;
        this.fileMatch = new RegExp('.+.meml');
        this.name = 'meml';
    }
    webDestructureImport(pathContents, path, toImport) {
        throw new Error('Method not implemented.');
    }
    webContentImport(pathContents, path) {
        throw new Error('Method not implemented.');
    }
    async localDestructureImport(pathContents, path, toImport) {
        const coreInstance = new core_1.MemlCore();
        const fileContents = coreInstance.tokenizeAndParse(pathContents, path);
        const context = new Web_1.Web(path);
        await context.convert(fileContents);
        return context.exports;
    }
    localContentImport(pathContents, path) {
        throw new Error('Method not implemented.');
    }
}
exports.MemlLoader = MemlLoader;
//# sourceMappingURL=MemlLoader.js.map