var fs = require('fs');
var path = require('path');
var bcrypt = require('bcryptjs');

var conf = require('./hylafaxLib/config');
var SysLog = require('./models/syslog');

module.exports = (() => {

    function genpasswd(len) {
        var len = len || conf.MIN_PASSWD_SIZE;
        return bcrypt.hashSync()
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
            conf.TMPDIR
        }
    };

})();