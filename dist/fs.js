"use strict";
/// <reference path="./fs.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = exports.fs = void 0;
const is_browser_1 = __importDefault(require("is-browser"));
const memfs_1 = require("memfs");
const path_js_1 = __importDefault(require("path.js"));
// This needs to run in the browser and node, so this is the way we are dealing with fs
exports.fs = is_browser_1.default ? memfs_1.fs : require('fs');
exports.path = is_browser_1.default ? path_js_1.default : require('path');
//# sourceMappingURL=fs.js.map