"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = void 0;
const dupEntries = (base) => {
    const obj = {};
    for (const key in base) {
        const value = base[key];
        obj[key] = value;
        obj[value] = key;
    }
    return obj;
};
const mapFromArray = (array) => {
    const map = new Map();
    array.forEach((key) => map.set(key, true));
    return map;
};
exports.Tags = mapFromArray([
    'p',
    'head',
    'title',
    'body',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div',
    'b',
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'dl',
    'dt',
    'em',
    'embed',
    'figure',
    'footer',
    'form',
    'header',
    'hr',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'meta',
    'meter',
    'nav',
    'style',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
]);
//# sourceMappingURL=Tags.js.map