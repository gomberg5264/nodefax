module.exports = (() => {

    return {
        strip_sipinfo: (callid) => {
            if((const matches = /^(.*)@(.*)$/.exec(callid)) !== null) {
                callid = matches[1];
            }
            return callid;
        }
    };

})();