"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentDefinition = void 0;
class ComponentDefinition {
    constructor(props, meml, name) {
        this.props = props;
        this.meml = meml;
        this.name = name;
    }
    propsList() {
        return this.props.items;
    }
    async construct(visitor) {
        return `<!-- Start of meml component: ${this.name} -->${await visitor.visitMemlStmt(this.meml)}<!-- End of meml component: ${this.name} -->`;
    }
}
exports.ComponentDefinition = ComponentDefinition;
//# sourceMappingURL=ComponentDefinition.js.map