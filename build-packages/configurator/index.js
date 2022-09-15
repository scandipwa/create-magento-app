#!/usr/bin/env node

const astring = require('astring');
const acorn = require('acorn');
const astravel = require('astravel');
const fs = require('fs');
const path = require('path');
const pathExistsSync = require('./lib/util/path-exists-sync');

const cmaConfigPath = path.join(process.cwd(), 'cma.js');

if (!pathExistsSync(cmaConfigPath)) {
    throw new Error('cma.js config does not exist!');
}

const configFileContent = fs.readFileSync(cmaConfigPath, 'utf-8');
const comments = [];
const ast = acorn.parse(configFileContent, {
    ecmaVersion: 6,
    onComment: comments
});

astravel.attachComments(ast, comments);

const generatedCode = astring.generate(ast, {
    comments: true,
    indent: '   '
});

console.log(ast, generatedCode);
