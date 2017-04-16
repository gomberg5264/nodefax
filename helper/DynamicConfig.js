var DynConf = require('./../models/dynconf');
var SysLog = require('./../models/syslog');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = (() => {
    var dynconf_id= null,
        device = null,
        callid = null,
        error = null;

    return {
        get_dynconf_id: () => { return dynconf_id; },

        get_device: () => { return device; },

        get_callid: () => { return callid; },

        get_error: () => { return error; },

        lookup: (pDevice, pCallid) => {
            return new Promise((resolve, reject) => {
                DynConf.find({callid: pCallid}, (err, docs) => {
                    if (err) throw err;

                    if (!docs) {
                        reject(false);
                        return;
                    }

                    docs.forEach((row, index) => {
                        if (!row['device'] || row['device'] === pDevice) {
                            resolve(true);
                            return;
                        }
                    });
                });
            });
        },

        create: (pDevice, pCallid) => {
            device = pDevice;
            callid = pCallid;

            var rule = {device: pDevice, callid: pCallid};

            if (DynConf.find(rule)) {
                error = "Rule exists";
                return false;
            }

            var dc = new DynConf(rule);
            if (dc.save()) {
                return true;
            }

            error = "Rule not created";
            return false;
        },

        remove: (id) => {
            if (mongoose.Types.ObjectId.isValid(id)) {
                return DynConf.remove({ _id: id }, (err) => {
                    if (err) return false;
                    return true;
                });
            }
            return false;
        },

        list_rules: () => {
            return DynConf.find().sort({ callid: 1 });
        },

        load_rule: (id) => {
            if (!id) {
                error = "DynConf not selected";
                return false;
            }

            if (mongoose.Types.ObjectId.isValid(id)) {
                return DynConf.findById(id, (err, res) => {
                    console.log(res);
                    dynconf_id = res['_id'];
                    device = res['device'];
                    callid = res['callid'];
                    return true;
                });
            }

            error = "Rule " + id + " doesn't exist";
            return false;
        },

        save_rule: (pDevice, pCallid) => {
            if (!dynconf_id) {
                error = "DynConf not loaded";
                return false;
            }

            device = pDevice;
            callid = pCallid;

            DynConf.findById(dynconf_id, (err, dc) => {
                if (err) throw err;

                dc.device = pDevice;
                dc.callid = pCallid;

                dc.save();
                return true;
            });
        }
    };
})();
