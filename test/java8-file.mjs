#!/usr/bin/env node
/**
 * 读取指定路径的 .java 文件，对 JAVA8.* API 做手工/探索性测试。
 *
 * @example
 * node test/java8-file.mjs path/to/Foo.java
 * node test/java8-file.mjs Parent.java Child.java --api --root-class Child
 * node test/java8-file.mjs path/to/Foo.java --json
 */

import {readFileSync, existsSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {JAVA8, API, ParseError} from '../src/index.js';

/** @typedef {{ paths: string[], rootClass?: string, api: boolean, json: boolean, help: boolean }} CliOptions */

/** @param {string[]} argv */
function parseArgs(argv) {
    /** @type {CliOptions} */
    const options = {paths: [], api: false, json: false, help: false};

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            options.help = true;
            continue;
        }
        if (arg === '--api') {
            options.api = true;
            continue;
        }
        if (arg === '--json') {
            options.json = true;
            continue;
        }
        if (arg === '--root-class') {
            const value = argv[++i];
            if (!value) throw new Error('--root-class requires a class name');
            options.rootClass = value;
            continue;
        }
        if (arg.startsWith('-')) {
            throw new Error(`unknown option: ${arg}`);
        }
        options.paths.push(resolve(arg));
    }

    return options;
}

function printHelp() {
    console.log(`Usage: node test/java8-file.mjs <file.java> [file.java ...] [options]

Read Java source file(s) and run JAVA8.* parsers for manual exploration.

Options:
  --root-class <name>   Root class for API.java8ToApiSchema (default: first top-level type)
  --api                 Also run API.java8ToApiSchema
  --json                Print full JSON results
  -h, --help            Show this help

Examples:
  node test/java8-file.mjs ./test/resources/test.java.text
  node test/java8-file.mjs Parent.java Child.java --api --root-class Child
  node test/java8-file.mjs /abs/path/Foo.java --json
`);
}

/** @param {string} path */
function readJavaFile(path) {
    if (!existsSync(path)) {
        throw new Error(`file not found: ${path}`);
    }
    const stat = statSync(path);
    if (!stat.isFile()) {
        throw new Error(`not a file: ${path}`);
    }
    return readFileSync(path, 'utf8');
}

/** @param {string} label @param {() => unknown} fn */
function runStep(label, fn) {
    try {
        const result = fn();
        console.log(`✓ ${label}`);
        return {ok: true, result};
    } catch (error) {
        const message =
            error instanceof ParseError
                ? `${error.message} (${error.language}:${error.line}:${error.column})`
                : error instanceof Error
                    ? error.message
                    : String(error);
        console.error(`✗ ${label}: ${message}`);
        return {ok: false, error};
    }
}

/** @param {unknown} value */
function printJson(label, value) {
    console.log(`\n--- ${label} ---`);
    console.log(JSON.stringify(value, null, 2));
}

/** @param {import('../src/parser/java8/models.js').FileModel} fileModel */
function summarizeFileModel(fileModel) {
    for (const type of fileModel.types) {
        const fields = type.ownMembers.filter((m) => m.kind === 'field');
        const methods = type.ownMembers.filter((m) => m.kind === 'method' || m.kind === 'constructor');
        const extendsName = type.extendsType?.kind === 'class' ? type.extendsType.name : undefined;
        const annotationNames = Object.keys(type.annotations ?? {});

        console.log(`  type: ${type.name} (${type.kind})`);
        if (type.modifiers.length) console.log(`  modifiers: ${type.modifiers.join(', ')}`);
        if (extendsName) console.log(`  extends: ${extendsName}`);
        if (annotationNames.length) console.log(`  annotations: ${annotationNames.join(', ')}`);
        console.log(`  ownMembers: ${fields.length} field(s), ${methods.length} method(s)`);
        if (fields.length) {
            console.log('  fields:');
            for (const field of fields) {
                const typeName = formatType(field.type);
                const desc = field.annotations?.ApiModelProperty?.value;
                const hidden = field.annotations?.ApiModelProperty?.hidden === true ? ', hidden' : '';
                const descPart = typeof desc === 'string' ? ` — ${desc}${hidden}` : '';
                console.log(`    - ${field.name}: ${typeName}${descPart}`);
            }
        }
        if (methods.length) {
            console.log('  methods:');
            for (const method of methods) {
                const params = method.parameters
                    .map((p) => `${formatType(p.type)} ${p.name}`)
                    .join(', ');
                const returnType = method.kind === 'method' ? formatType(method.returnType) : 'constructor';
                console.log(`    - ${returnType} ${method.name}(${params})`);
            }
        }
    }
}

/** @param {import('../src/parser/java8/models.js').TypeSignature | undefined} sig */
function formatType(sig) {
    if (!sig) return 'unknown';
    if (sig.kind === 'void') return 'void';
    if (sig.kind === 'primitive') return sig.name;
    if (sig.kind === 'class') {
        if (!sig.typeArguments?.length) return sig.name;
        return `${sig.name}<${sig.typeArguments.map(formatType).join(', ')}>`;
    }
    if (sig.kind === 'array') return `${formatType(sig.elementType)}[]`;
    if (sig.kind === 'typeVariable') return sig.name;
    if (sig.kind === 'wildcard') return '?';
    return 'unknown';
}

/** @param {unknown[]} nodes @param {number} [indent] */
function summarizeApiSchema(nodes, indent = 2) {
    const pad = ' '.repeat(indent);
    for (const node of nodes) {
        const n = /** @type {{ key?: string, type?: string, desc?: string, children?: unknown[] }} */ (node);
        const keyPart = n.key ? `${n.key}: ` : '';
        const descPart = n.desc ? ` — ${n.desc}` : '';
        console.log(`${pad}- ${keyPart}${n.type ?? 'unknown'}${descPart}`);
        if (n.children?.length) summarizeApiSchema(n.children, indent + 2);
    }
}

/** @param {CliOptions} options */
function main(options) {

    /** @type {{ path: string, source: string }[]} */
    const files = options.paths.map((path) => ({
        path,
        source: readJavaFile(path),
    }));

    let failed = 0;

    for (const file of files) {
        console.log(`[${file.path}]`);

        const peek = runStep('JAVA8.peekFirstClassName', () => JAVA8.peekFirstClassName(file.source));
        if (!peek.ok) failed += 1;
        else if (!options.json) console.log(`  peekFirstClassName: ${JSON.stringify(peek.result)}`);

        const strict = runStep('JAVA8.firstClassName', () => JAVA8.firstClassName(file.source));
        if (!strict.ok) failed += 1;
        else if (!options.json) console.log(`  firstClassName: ${JSON.stringify(strict.result)}`);

        const sig = runStep('JAVA8.signatures', () => JAVA8.signatures(file.source));
        if (!sig.ok) {
            failed += 1;
        } else if (options.json) {
            printJson(`signatures: ${file.path}`, sig.result);
        } else {
            summarizeFileModel(/** @type {import('../src/parser/java8/models.js').FileModel} */ (sig.result));
        }

        console.log('');
    }

    if (options.api) {
        const sources = files.map((f) => f.source);
        let rootClass = options.rootClass;
        if (!rootClass) {
            const firstModel = JAVA8.signatures(files[0].source);
            rootClass = firstModel.types[0]?.name;
        }

        if (!rootClass) {
            console.error('✗ API.java8ToApiSchema: cannot determine root class');
            failed += 1;
        } else {
            console.log(`[API.java8ToApiSchema rootClass=${rootClass}]`);
            const api = runStep('API.java8ToApiSchema', () =>
                API.java8ToApiSchema(sources.length === 1 ? sources[0] : sources, {rootClass}),
            );
            if (!api.ok) {
                failed += 1;
            } else if (options.json) {
                printJson('java8ToApiSchema', api.result);
            } else {
                console.log('  effective fields:');
                summarizeApiSchema(/** @type {unknown[]} */ (api.result));
            }
            console.log('');
        }
    }

    if (failed > 0) {
        console.error(`${failed} step(s) failed`);
        return 1;
    }

    console.log('all steps passed');
    return 0;
}


main({
    paths: [
        '/Users/zfs/work/worker_space/zingbiz/zing-lowcode-api/src/main/java/com/zingbiz/lowcode/vo/LowCodeFormPublishVo.java',
        '/Users/zfs/work/worker_space/zingbiz/zing-lowcode-api/src/main/java/com/zingbiz/lowcode/vo/FormPublishScopeVo.java',
    ],
    api: true,
    json: true,
})
