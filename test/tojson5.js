export function buildJson5(configList = []) {
    // 标准化节点
    function processNode(node) {
        if (node.check === false) return undefined;

        switch (node.type) {
            case 'String':
                return {value: JSON.stringify(node.value || ''), desc: node.desc || ''};
            case 'Number':
                return {value: node.value || 0, desc: node.desc || ''};
            case 'Boolean':
                return {value: node.value === 'true', desc: node.desc || ''};
            case 'Object': {
                const obj = {};
                if (Array.isArray(node.children)) {
                    for (const child of node.children) {
                        const key = child.key || '';
                        const v = processNode(child);
                        if (v !== undefined) obj[key] = v;
                    }
                }
                return {value: obj, desc: node.desc || '', isObj: true};
            }
            case 'List': {
                const arr = Array.isArray(node.children)
                    ? node.children.map(child => processNode(child)).filter(v => v !== undefined)
                    : [];
                return {value: arr, desc: node.desc || '', isList: true};
            }
            default:
                return undefined;
        }
    }

    // 注释处理
    function renderComment(desc, indent) {
        const text = String(desc || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        if (!text) return {type: 'none', value: ''};
        // 多行注释
        if (text.includes('\n')) {
            const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
            return {type: 'block', value: [`${indent}/**`, ...lines.map(line => `${indent} * ${line}`), `${indent} */`].join('\n')};
        }
        // 单行注释
        return {type: 'inline', value: ` // ${text}`};
    }

    // 基础值
    function renderLeaf(node, commaTail) {
        return `${node.value}${commaTail ? ',' : ''}`;
    }

    // 统一入口
    function render(node, level, commaTail = false, inlineComment = '') {
        if (node.isObj) return renderObject(node, level, commaTail, inlineComment);
        if (node.isList) return renderArray(node, level, commaTail, inlineComment);
        return renderLeaf(node, commaTail);
    }

    // 对象
    function renderObject(node, level, commaTail, inlineComment = '') {
        const indent = '  '.repeat(level), indent2 = '  '.repeat(level + 1);
        const entries = Object.entries(node.value);
        const body = entries.map(([key, value], idx) => {
            const isLast = idx === entries.length - 1;
            const comment = renderComment(value.desc, indent2);
            const renderedValue = render(value, level + 1, !isLast);
            if (comment.type === 'inline') {
                if (value.isObj || value.isList) {
                    return `${indent2}"${key}": ${render(value, level + 1, !isLast, comment.value)}`;
                }
                return `${indent2}"${key}": ${renderedValue}${comment.value}`;
            }
            if (comment.type === 'block') {
                return `${comment.value}\n${indent2}"${key}": ${renderedValue}`;
            }
            return `${indent2}"${key}": ${renderedValue}`;
        }).join('\n');

        if (body) return `{${inlineComment}\n${body}\n${indent}}${commaTail ? ',' : ''}`;
        return `{${inlineComment}${indent}}${commaTail ? ',' : ''}`;
    }

    // 数组
    function renderArray(node, level, commaTail, inlineComment = '') {
        const indent = '  '.repeat(level), indent2 = '  '.repeat(level + 1);
        const body = node.value.map((value, idx) => {
            const isLast = idx === node.value.length - 1;
            const comment = renderComment(value.desc, indent2);
            const renderedValue = render(value, level + 1, !isLast);
            if (comment.type === 'inline') {
                if (value.isObj || value.isList) {
                    return `${indent2}${render(value, level + 1, !isLast, comment.value)}`;
                }
                return `${indent2}${renderedValue}${comment.value}`;
            }
            if (comment.type === 'block') return `${comment.value}\n${indent2}${renderedValue}`;
            return `${indent2}${renderedValue}`;
        }).join('\n');
        if (body) return `[${inlineComment}\n${body}\n${indent}]${commaTail ? ',' : ''}`;
        return `[${inlineComment}${indent}]${commaTail ? ',' : ''}`;
    }

    // 根节点为 List
    if (configList.length === 1 && configList[0].type === 'List'
        && (!configList[0].key || configList[0].key === '')
        && configList[0].check !== false) {
        const root = processNode(configList[0]);
        return render(root, 0, false);
    }

    // 根节点为 Object
    const rootObj = {};
    for (const node of configList) {
        const key = node.key || '_root';
        const v = processNode(node);
        if (v !== undefined) rootObj[key] = v;
    }
    return render({value: rootObj, desc: '', isObj: true}, 0, false);
}