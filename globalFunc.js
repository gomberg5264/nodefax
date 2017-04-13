var fs = require('fs');
var path = require('path');
var bcrypt = require('bcryptjs');

var conf = require('./hylafaxLib/config');
var SysLog = require('./models/syslog');

module.exports = (() => {

    function genpasswd(len) {
        var len = len || conf.MIN_PASSWD_SIZE;
        return bcrypt.hashSync(process.hrtime()[0], len);
    }

    return {
        faxlog: (log, echo) => {
            var echo = echo || false;

            var syslog = new SysLog({
                logtext: log
            });
            syslog.save();

            if (echo) console.log(log);
        },

    	isset: (_var) => { return !!_var; },

        strip_sipinfo: (callid) => {
        	var matches;
            if((matches = /^(.*)@(.*)$/.exec(callid) ) !== null) {
                callid = matches[1];
            }
            return callid;
        },

        clean_faxnum: (fnum) => {
            var res = fnum.replace(/[^\+\w]/, '');
            return res;
        },

        array_merge: (a, a2) => {
            if (a instanceof Array) {
                return a.concat(a2);
            } else {
                var p, r = {};
                for (p in a) {
                    r[p] = a[p];
                }
                for (p in a2) {
                    r[p] = a2[p];
                }
                return r;
            }
        },

        invalid_email: (email) => {
            if (email.match(/^[^@]+@([-\w]+\.)+[A-Za-z]{2,4}$/)) {
                return true; // email address is invalid
            }
            return false;
        },

        process_html_template: (template, match, values) {
            var ret = new Array();
            var lines = fs.readFileSync(template);
            var matchlen = match.length;

            // search line if it matches "XXXX-symbol". if so, swap the appropriate value
            var re = new RegExp(match);
            var sym_re = new RegExp(match + '\b');
            lines.forEach( (line) => {
                if (line.match(re)) {
                    var symbol_ar = line.split(sym_re);

                    if (symbol_ar.length) {
                        symbol_ar.forEach( (symbol) => {
                            var symbol_ar2 = symbol.split(/[\b<]/);

                            if (symbol_ar2.length) {
                                symbol_ar2.forEach( (symbol2) => {
                                    var newsymbol = null;

                                    if (values[symbol2] !== undefined) {
                                        newsymbol = values[symbol2]; // htmlentities(values[symbol2], ENT_QUOTES, "UTF-8")
                                    }

                                    line = line.replace(match + symbol2, newsymbol);
                                });
                            }
                        });
                    }
                }
                ret.push(line);
            });

            return ret;
        },

        tmpfilename: (suffix) => {
            var filename = 'nodefax-' + genpasswd() + '.' + suffix;
            return path.join(conf.TMPDIR, filename);
        },

        wordwrap: (str, intWidth, strBreak, cut) => {
            var m = ((arguments.length >= 2) ? arguments[1] : 75);
            var b = ((arguments.length >= 3) ? arguments[2] : '\n');
            var c = ((arguments.length >= 4) ? arguments[3] : false);
            var i, j, l, s, r;

            str += '';

            if (m < 1) {
                return str;
            }

            for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
                for (s=r[i], r[i]=''; s.length > m; r[i] += s.slice(0, j) + ((s=s.slice(j)).length ? b : '')) {
                    j = (c === 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1]) ?
                        m :
                        j.input.length - j[0].length || c === true && m ||
                        j.input.length + (j = s.slice(m).match(/^\S*/))[0].length;
                }
            }
            return r.join('\n');
        },

        rem_nl: (str) => {
            var str = str.replace(/\r/, '');
            return str.replace(/\n/, '');
        }
    };

})();