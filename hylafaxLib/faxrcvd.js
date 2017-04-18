#!/usr/bin/env node

// console.log('Argv Length', process.argv.length);
// console.log(process.argv);

var FaxModem = require('./../helper/FaxModem');

if (process.argv.length < 4) {
    console.error('Usage: ' + process.argv[1] + ' file devID commID error-msg [CIDNumber] [CIDName] [DIDnum]');
    process.exit(1);
}

var debug = false;
var tiff_file = process.argv[2];
var modemdev = process.argv[3];

var commID = (process.argv.length >= 5) ? process.argv[4] : '';
var errormsg = (process.argv.length >= 6) ? process.argv[5] : '';

var CIDNumber = null;
var CIDName = null;
var DIDNum = null;

