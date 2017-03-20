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
        }
    };

})();