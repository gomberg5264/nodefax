var SysLog = require('./models/syslog');

module.exports = (() => {

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
        }
    };

})();