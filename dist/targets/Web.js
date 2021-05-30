"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = require("../fs");
const { readFileSync } = fs_1.fs;
const { dirname, join, extname } = fs_1.path;
const TokenTypes_1 = require("../scanner/TokenTypes");
const Environment_1 = require("./shared/Environment");
const ComponentDefinition_1 = require("./shared/ComponentDefinition");
const Tags_1 = require("../scanner/Tags");
const core_1 = require("../core");
class Web {
    constructor(path) {
        // Memory storage for SS execution
        this.environment = new Environment_1.Environment();
        this.exports = new Map();
        this.path = path;
    }
    // Start converting the file
    async convert(token) {
        return await this.visitPageStmt(token);
    }
    // ===========================================================================
    // Import and export statements
    async visitExportStmt(stmt) {
        if (exports.size !== 0 && typeof exports.size !== 'undefined')
            core_1.MemlC.linterAtToken(stmt.exportToken, 'There should only be one export statement per meml file');
        stmt.exports.items.forEach((exportedItem) => {
            this.exports.set(exportedItem.literal, this.environment.get(exportedItem));
        });
        return '';
    }
    async visitImportStmt(stmt) {
        const rawPath = stmt.file;
        const filePath = join(dirname(this.path), stmt.file);
        const isUrl = rawPath.replace('http://', '').replace('https://', '') != rawPath;
        if (stmt.imports !== null) {
            // This implements a custom loader for destructure loaders
            let importedSomething = false;
            // Loop through all of the loaders
            for (const loader of core_1.MemlCore.globalLoaders) {
                // Check if this loader fits
                if (loader.fileMatch.test(filePath)) {
                    // Check if this is a web resource
                    if (isUrl) {
                        // Check if the current loader allows for web imports
                        if (loader.supportsDestructureImport && loader.supportsWebImport) {
                            // Download the resources
                            const contents = await (await node_fetch_1.default(rawPath)).text();
                            // Pass it into the loader
                            const fileExports = await loader.webDestructureImport(contents, rawPath, stmt.imports == 'everything' ? [] : stmt.imports.items);
                            if (stmt.imports == 'everything') {
                                // Dump everything into the current environment
                                fileExports.forEach((value, key) => this.environment.define(key, value));
                            }
                            else {
                                // Import only what we want
                                stmt.imports.items.forEach((key) => {
                                    if (fileExports.has(key.literal)) {
                                        this.environment.define(key.literal, fileExports.get(key.literal));
                                    }
                                    else {
                                        core_1.MemlC.errorAtToken(key, `The export from ${rawPath} doesn't contain the export ${key}`, this.path);
                                    }
                                });
                            }
                            importedSomething = true;
                            break;
                        }
                        else {
                            // Error out
                            core_1.MemlCore.errorAtToken(stmt.fileToken, `You cannot use a destructure import on '${loader.name}'. Try using a different type of import or a different loader`, this.path);
                        }
                    }
                    else {
                        // Check if the current loader allows for web imports
                        if (loader.supportsDestructureImport &&
                            loader.supportsLocalImport) {
                            // Load all of the contents of the files
                            const contents = readFileSync(filePath).toString();
                            // Pass it into the loader
                            const fileExports = await loader.localDestructureImport(contents, filePath, stmt.imports == 'everything' ? [] : stmt.imports.items);
                            if (stmt.imports == 'everything') {
                                // Dump everything into the current environment
                                fileExports.forEach((value, key) => this.environment.define(key, value));
                            }
                            else {
                                // Import only what we want
                                stmt.imports.items.forEach((key) => {
                                    if (fileExports.has(key.literal)) {
                                        this.environment.define(key.literal, fileExports.get(key.literal));
                                    }
                                    else {
                                        core_1.MemlC.errorAtToken(key, `The export from ${rawPath} doesn't contain the export ${key}`, this.path);
                                    }
                                });
                            }
                            importedSomething = true;
                            break;
                        }
                        else {
                            // Error out
                            core_1.MemlCore.errorAtToken(stmt.fileToken, `You cannot use a destructure import on '${loader.name}'. Try using a different type of import or a different loader`, this.path);
                        }
                    }
                }
            }
            if (!importedSomething) {
                core_1.MemlCore.errorAtToken(stmt.fileToken, 'There is no loader that can import this file', this.path);
            }
        }
        else {
            // This is an import tag without specified content, for example:
            // (import "./example.css")
            // The following should be handled in this section
            // [ ] Check its file type and appropriately handle it
            // [ ] Check if its a url and appropriately handle it
            // Get the extension name for niceness
            const fileExtension = extname(rawPath);
            if (isUrl) {
                // Handle urls here
                switch (fileExtension) {
                    case '.html':
                        // Error out. Getting html files from the web is a massive security hazard
                        core_1.MemlCore.errorAtToken(stmt.fileToken, `You cannot import page from the internet`, this.path);
                        break;
                    case '.meml':
                        // Error out. Getting meml files from the web is a massive security hazard
                        core_1.MemlCore.errorAtToken(stmt.fileToken, `You cannot import meml file from the internet`, this.path);
                        break;
                    case '.css':
                        // Link to this resource
                        return `<link rel="stylesheet" href="${rawPath}">`;
                    case '.js':
                        // Return a script with a src pointing to this resource
                        return `<script src="${rawPath}"></script>`;
                    default:
                        core_1.MemlCore.errorAtToken(stmt.fileToken, `Unknown file extension '${fileExtension}'`, this.path);
                }
            }
            else {
                // Must be a local file
                switch (fileExtension) {
                    case '.html':
                        // Dump its contents into a meml file
                        return readFileSync(filePath).toString();
                    case '.meml':
                        // Parse the meml file and dump it into the web page
                        const c = new core_1.MemlCore();
                        return c.fileToWeb(filePath);
                    case '.css':
                        // Link to this resource
                        return `<style>${readFileSync(filePath)}</style>`;
                    case '.js':
                        // Return a script with a src pointing to this resource
                        return `<script>${readFileSync(filePath)}</script>`;
                    default:
                        core_1.MemlCore.errorAtToken(stmt.fileToken, `Unknown file extension '${fileExtension}'`, this.path);
                }
            }
            return `<style>${readFileSync(filePath)}</style>`;
        }
        return '';
    }
    // ===========================================================================
    // Stmt visitor pattern implementations
    async visitMemlStmt(stmt) {
        // Check if this is a default tag. If it is, then we should pass it through to
        // html
        if (Tags_1.Tags.has(stmt.tagName.literal)) {
            const evaluatedProps = [];
            for (const prop of stmt.props) {
                evaluatedProps.push(await this.evaluate(prop));
            }
            const children = [];
            for (const el of stmt.exprOrMeml) {
                children.push(await this.evaluate(el));
            }
            return `<${stmt.tagName.literal}${stmt.props.length !== 0 ? ` ${evaluatedProps.join(' ')} ` : ''}>${children.join('')}</${stmt.tagName.literal}>`;
        }
        else {
            // Otherwise, the tag may be a custom component and thus we should try and
            // retrieve it from the environment
            const tag = this.environment.get(stmt.tagName);
            // If we have an undefined tag, we will just return an empty string, to
            // let the compile finish properly
            if (typeof tag == 'undefined') {
                return '';
            }
            // Now the environment that will be used to evaluate each component needs to be created
            // First, save the old environment so it can be restored once we are done
            const previousEnv = this.environment;
            // Next, lets create a new environment specific for this component
            const newEnv = new Environment_1.Environment(this.environment);
            // Now for prop checking time. We will loop through all of the props that
            // have been specified and try to add them. If they haven't been added
            // we throw an error
            for (const token of tag.propsList()) {
                const identifier = token.literal;
                let value;
                // Search for the identifier in the props
                for (const prop of stmt.props) {
                    if (prop.name.literal === identifier) {
                        value = await this.evaluate(prop.value);
                    }
                }
                if (!value) {
                    // If we can't find the value error
                    core_1.MemlCore.errorAtToken(stmt.tagName, `Missing tag prop '${identifier}'`, this.path);
                    return;
                }
                // Since it does exist, we can define it in the environment
                newEnv.define(identifier, value);
            }
            // Set the new environment to be the one we just generated
            this.environment = newEnv;
            // Construct the tag
            const constructed = await tag.construct(this);
            // Restore the previous environment
            this.environment = previousEnv;
            // Return the constructed tag with all of the props
            return constructed;
        }
    }
    async visitExpressionStmt(stmt) {
        return (await this.evaluate(stmt.expression)).toString();
    }
    async visitPageStmt(stmt) {
        const children = [];
        for (const el of stmt.children) {
            children.push(await this.evaluate(el));
        }
        return `<!DOCTYPE html><html>${children.join('')}</html>`;
    }
    async visitComponentStmt(stmt) {
        if (Tags_1.Tags.has(stmt.tagName.literal)) {
            core_1.MemlC.linterAtToken(stmt.tagName, `The component '${stmt.tagName.literal}' shares a name with a html tag. Defaulting to html tag.`);
        }
        // Add the component tot the environment
        this.environment.define(stmt.tagName.literal, new ComponentDefinition_1.ComponentDefinition(stmt.props, stmt.meml, stmt.tagName.literal));
        // When you visit a component, you visit the definition. Therefore
        // we do not return anything to influence the meml file
        return '';
    }
    // ===========================================================================
    // Expr visitor pattern implementations
    // visitIdentifierExpr: (expr: IdentifierExpr) => string | number | boolean
    async visitIdentifierExpr(expr) {
        const variable = this.environment.get(expr.token);
        // If the variable doesn't exist return null and continue, an error has
        // already been logged to the console
        if (typeof variable == 'undefined') {
            return `[undefined variable ${expr.token.literal}]`;
        }
        return variable;
    }
    async visitMemlPropertiesExpr(expr) {
        return `${expr.name.literal}="${await this.evaluate(expr.value)}"`;
    }
    async visitLiteralExpr(expr) {
        if (expr.value == null)
            return 'null';
        return expr.value;
    }
    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }
    async visitUnaryExpr(expr) {
        const right = await this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenTypes_1.TokenType.MINUS:
                return -right;
            case TokenTypes_1.TokenType.BANG:
                return !this.isTruthy(right);
        }
        return null;
    }
    async visitBinaryExpr(expr) {
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenTypes_1.TokenType.MINUS:
                return left - right;
            case TokenTypes_1.TokenType.SLASH:
                return left / right;
            case TokenTypes_1.TokenType.STAR:
                return left * right;
            case TokenTypes_1.TokenType.PLUS:
                if (typeof left == 'number' && typeof right == 'number') {
                    return left + right;
                }
                if (typeof left == 'string' && typeof right == 'string') {
                    return left + right;
                }
            case TokenTypes_1.TokenType.GREATER:
                return left > right;
            case TokenTypes_1.TokenType.GREATER_EQUAL:
                return left >= right;
            case TokenTypes_1.TokenType.LESS:
                return left < right;
            case TokenTypes_1.TokenType.LESS_EQUAL:
                ;
                left <= right;
            case TokenTypes_1.TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenTypes_1.TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
        }
    }
    // ===========================================================================
    // Utils
    async evaluate(expr) {
        return await expr.accept(this);
    }
    isTruthy(obj) {
        if (obj == null)
            return false;
        if (typeof obj == 'boolean')
            return obj;
        return true;
    }
    isEqual(left, right) {
        if (left == null && right == null)
            return false;
        if (left == null)
            return false;
        return left == right;
    }
}
exports.Web = Web;
//# sourceMappingURL=Web.js.map