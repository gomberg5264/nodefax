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
var path = require('path');
var fs = require('fs');
var strftime = require('strftime');
var child_process = require('child_process');

var db = require('./../models');
var User = require('./../models/user');
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
var coverpage_file = path.join(conf.INSTALLDIR, 'images', conf.COVERPAGE_FILE);

var from_name = options['f'];
var from_email = func.isset(options['M']) ? options['M'] : null;

func.faxlog(`faxcover> from: ${from_name} email: ${from_email}`);

if (from_email) {
    User.find(
        {'email': from_email},
        {'_id': -1, 'username': 1},
        (err, user) => {
            if (user) {
                from_name = user.username;
            } else {
                if (!func.invalid_email(from_name)) {
                    User.find(
                        {'email': from_name},
                        {'_id': -1, 'username': 1},
                        (err, user) => {
                            if (user) {
                                from_email = from_name;
                                from_name = user.username;
                            }
                        }
                    );
                }
            }
        }
    );
} else {
    User.find(
        {'username': from_name},
        {'_id': -1, 'email': 1},
        (err, user) => {
            if (user) {
                from_email = user.email;
            } else {
                User.find(
                    {'userid': from_name},
                    {'_id': -1, 'username': 1, 'email': 1},
                    (err, user) => {
                        if (user) {
                            from_name = user.username;
                            from_email = user.email;
                        } else {
                            User.find(
                                {'email': from_name},
                                {'_id': -1, 'username': 1},
                                (err, user) => {
                                    from_email = from_name;
                                    from_name = user.username;
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}

// process command line cover page argument
var tmp_cpfile, cp_format;

if (func.isset(options['C'])) {
    tmp_cpfile = (fs.existsSync(options['C'])) ? options['C'] : path.join(conf.INSTALLDIR, 'images', options['C']);

    cp_format = path.parse(tmp_cpfile).ext.toLowerCase();

    if (cp_format === '.html' || cp_format === '.htm') { // specified file is html format
        if (conf.USE_HTML_COVERPAGE) {
            coverpage_file = tmp_cpfile;
            using_html_cp = true;
        }
    } else {
        if (cp_format === '.ps') {
            coverpage_file = tmp_cpfile; // use ps file
        }
    }
}

var values = {};
values['from']               = from_name;
values['from-mail-address']  = from_email;
values['to']                 = (func.isset(options['t'])) ? options['t'] : null;
values['to-company']         = (func.isset(options['x'])) ? options['x'] : null;
values['to-location']        = (func.isset(options['l'])) ? options['l'] : null;
values['to-voice-number']    = (func.isset(options['v'])) ? options['v'] : null;
values['to-fax-number']      = (func.isset(options['n'])) ? options['n'] : null;
values['regarding']          = (func.isset(options['r'])) ? options['r'] : null;
values['from-company']       = (func.isset(options['X'])) ? options['X'] : conf.FROM_COMPANY;
values['from-location']      = (func.isset(options['L'])) ? options['L'] : conf.FROM_LOCATION;
values['from-voice-number']  = (func.isset(options['V'])) ? options['V'] : conf.FROM_VOICENUMBER;
values['from-fax-number']    = (func.isset(options['N'])) ? options['N'] : conf.FROM_FAXNUMBER;
values['page-count']         = (func.isset(options['p'])) ? options['p'] : null;
values['pageSize']           = (func.isset(options['s'])) ? options['s'] : null;
values['todays-date']        = (func.isset(options['D'])) ? strftime(options['D']) : strftime(conf.FAXCOVER_DATE_FORMAT);

var tpl;

if (using_html_cp) {
    values['comments'] = (func.isset(options['c'])) ? options['c'].replace('\n', '<br />') : null;
    tpl = func.process_html_template(coverpage_file, conf.COVERPAGE_MATCH, values);

    var filedata = tpl.join('\n');

    var filename = func.tmpfilename('html');

    var fd;
    if (!(fd = fs.openSync(filename, 'w'))) {
        console.log(`Cannot open file (${filename})`);
        process.exit(1);
    }
    if (fs.writeSync(fd, filedata) === false) {
        console.log(`Cannot write to file (${filename})`);
    }
    fs.closeSync(fd);

    child_process.execSync(conf.HTML2PS + ' ' + filename);    
} else {
    var maxlen = (func.isset(options['z'])) ? options['z'] : conf.CPAGE_LINELEN;
    var comments;

    if (func.isset(options['c'])) {
        var tmpcmnt = options['c'];
        var ctemp = func.wordwrap(tmpcmnt, maxlen, '\n', true);
        comments = ctemp.split('\n');
    } else {
        comments = new Array();
    }

    if (comments instanceof Array) {
        comments.forEach( (comment, index) => {
            values['comments'+index] = (func.isset(comment)) ? func.rem_nl(comment) : null;
        });
    }

    tpl = func.process_template(coverpage_file, conf.COVERPAGE_MATCH, values);
    console.log(tpl.join(''));
}
