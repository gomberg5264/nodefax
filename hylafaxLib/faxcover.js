#!/usr/bin/env node

// $options = getopt("t:c:p:l:m:z:r:v:x:C:D:L:N:V:X:s:f:n:M:");

// if (!isset($options['f']) or !isset($options['n'])) {
//     exit("Usage: faxcover [-t to] [-c comments] [-p #pages] [-l to-location] [-m maxcomments]
//           [-z maxlencomments]".
//         " [-r regarding] [-v to-voice-number] [-x to-company] [-C template-file]
//           [-D date-format] [-L from-location]".
//         " [-M from-mail-address] [-N from-fax-number] [-V from-voice-number] [-X from-company]
//           [-s pagesize] -f from -n fax-number\n");
// }

var GetOpt = require('node-getopt');
var db = require('./../models');
var func = require('./../globalFunc');
var conf = require('./config');

var getopt = new GetOpt([
    ['t', '', 'to'],
    ['c', '', 'comments'],
    ['p', '', '#pages'],
    ['l', '', 'to-location'],
    ['m', '', 'maxcomments'],
    ['z', '', 'maxlencomments'],
    ['r', '', 'regarding'],
    ['v', '', 'to-voice-number'],
    ['x', '', 'to-company'],
    ['C', '', 'template-file'],
    ['D', '', 'date-format'],
    ['L', '', 'from-location'],
    ['M', '', 'from-mail-address'],
    ['N', '', 'from-fax-number'],
    ['V', '', 'from-voice-number'],
    ['X', '', 'from-company'],
    ['s', '', 'pagesize'],
    ['f', '', 'from'],
    ['n', '', 'fax-number'],
    ['h', 'help']
]);

getopt.setHelp(
    "Usage: faxcover [-t to] [-c comments] [-p #pages] [-l to-location] [-m maxcomments]" +
    " [-z maxlencomments] [-r regarding] [-v to-voice-number] [-x to-company] [-C template-file]" +
    " [-D date-format] [-L from-location] [-M from-mail-address] [-N from-fax-number]" +
    " [-V from-voice-number] [-X from-company] [-s pagesize] -f from -n fax-number\n"
);

var options = getopt.parseSystem().options;

if (!func.isset(options['f']) || !func.isset(options['n'])) {
    getopt.showHelp();
    process.exit(1);
}

var using_html_cp = false;
var coverpage_file = conf.INSTALLDIR + '/images/' + conf.COVERPAGE_FILE;

var from_name = options['f'];
var from_email = func.isset(options['M']) ? options['M'] : null;

func.faxlog(`faxcover> from: '${from_name}' email: '${from_email}'`);
