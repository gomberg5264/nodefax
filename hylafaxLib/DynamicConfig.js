var DynConf = require('./../models/dynconf');

module.exports = DynamicConfig;

function DynamicConfig() {
    this.dynconf_id = null;
    this.device = null;
    this.callid = null;
    this.error = "";
}

DynamicConfig.prototype.get_dynconf_id = () => ( this.dynconf_id );

DynamicConfig.prototype.get_device = () => ( this.device );

DynamicConfig.prototype.get_callid = () => ( this.callid );

DynamicConfig.prototype.get_error = () => ( this.error );

DynamicConfig.prototype.lookup = (device, callid, cb) => {
    DynConf.find({callid: callid}, (err, docs) => {
        if (err) throw err;

        if (!docs) {
            cb('No Data~!', false);
            return;
        }

        docs.forEach((row, index) => {
            if (!row['device']) {
                cb(null, true);
                return;
            }
            
            if (row['device'] === device) {
                cb(null, true);
                return;
            }
        });
    });
}

DynamicConfig.prototype.create = (device, callid) => {
    this.device = device;
    this.callid = callid;
    var rule = {
        device: device,
        callid: callid
    };

    DynConf.find(rule, (err, docs) => {
        if (err) throw err;

        if (!docs) {
            var dynconf = new DynConf(rule);
            dynconf.save((err) => {
                if (err) throw err;
            });

        }
    });
}

DynamicConfig.prototype.remove = (id) => {
    DynConf.remove({dynconf_id: id}, (err) => {
        if(err) throw err;
    });
}

DynamicConfig.prototype.load_rule = (id) => {

}

DynamicConfig.prototype.save_rule = (device, callid) => {

}