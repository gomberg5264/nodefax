#!/usr/bin/env node

const func = require('./../globalFunc');
const db = require('./models');

if (process.argv.length === 2) {
    console.error(process.argv[1] + ' device CallID1 CallIDn ...');
    process.exit(1)
}

const device = process.argv[2];

const isset = (_var) => ( !!_var );

if (!isset(process.argv[3])) {
    const callid1 = "EMPTY CALLID";
} else {
    const callid1 = func.strip_sipinfo(process.argv[3]);
}
