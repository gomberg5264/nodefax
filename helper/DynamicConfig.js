var DynConf = require('./../models/dynconf');

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
                    if (err) {
                        reject(err);
                        return;
                    }

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

        },

        remove: (id) => {

        },

        load_rule: (id) => {

        },

        save_rule: (pDevice, pCallid) => {

        }
    };
})();

// DynamicConfig.prototype.lookup = (device, callid, cb) => {
//     DynConf.find({callid: callid}, (err, docs) => {
//         if (err) throw err;

//         if (!docs) {
//             cb('No Data~!', false);
//             return;
//         }

//         docs.forEach((row, index) => {
//             if (!row['device']) {
//                 cb(null, true);
//                 return;
//             }
            
//             if (row['device'] === device) {
//                 cb(null, true);
//                 return;
//             }
//         });
//     });
// }

// DynamicConfig.prototype.create = (device, callid) => {
//     this.device = device;
//     this.callid = callid;
//     var rule = {
//         device: device,
//         callid: callid
//     };

//     DynConf.find(rule, (err, docs) => {
//         if (err) throw err;

//         if (!docs) {
//             var dynconf = new DynConf(rule);
//             dynconf.save((err) => {
//                 if (err) throw err;
//             });

//         }
//     });
// }

// DynamicConfig.prototype.remove = (id) => {
//     DynConf.remove({dynconf_id: id}, (err) => {
//         if(err) throw err;
//     });
// }
