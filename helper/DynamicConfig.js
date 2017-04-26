var DynConf = require('./../models/dynconf');
var SysLog = require('./../models/syslog');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = DynamicConfig;

function DynamicConfig() {
    this.dynconf_id = null;
    this.device = null;
    this.callid = null;
    this.error = '';
}

DynamicConfig.prototype.get_dynconf_id = function() { return this.dynconf_id; }

DynamicConfig.prototype.get_device = function() { return this.device; }

DynamicConfig.prototype.get_callid = function() { return this.callid; }

DynamicConfig.prototype.get_error = function() { return this.error; }

DynamicConfig.prototype.lookup = function(pDevice, pCallid) {
    return new Promise( (resolve, reject) => {
        DynConf.find({callid: pCallid}, (err, docs) => {
            if (err) return reject(err);

            if (!docs) {
                return reject(false);
            }

            docs.forEach((row, index) => {
                if (!row['device'] || row['device'] === pDevice) {
                    return resolve(true);
                }
            });
        });
    });
}

DynamicConfig.prototype.create = function(pDevice, pCallid) {
    var self = this;

    self.device = pDevice;
    self.callid = pCallid;

    var rule = {device: pDevice, callid: pCallid};

    return new Promise( (resolve, reject) => {
        DynConf.find(rule).then(
            (dcs) => {
                self.error = "Rule exists";
                return reject(false);
            }, (err) => {
                var dc = new DynConf(rule);
                dc.save().then( () => {
                    return resolve(true);
                }, () => {
                    self.error = "Rule not created";
                    return reject(false);
                });
            }
        );
    });
}

DynamicConfig.prototype.remove = function(id) {
    return new Promise( (resolve, reject) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
            DynConf.remove({ _id: id }, (err) => {
                if (err) return reject(false);
                return resolve(true);
            });
        }
        return reject(false);
    });
}

DynamicConfig.prototype.list_rules = function() {
    return DynConf.find().sort({ callid: 1 });
}

DynamicConfig.prototype.load_rule = function(id) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!id) {
            self.error = "DynConf not selected";
            return reject(false);
        }

        if (mongoose.Types.ObjectId.isValid(id)) {
            DynConf.findById(id, (err, res) => {
                console.log(res);
                self.dynconf_id = res['_id'];
                self.device = res['device'];
                self.callid = res['callid'];
                return resolve(true);
            });
        }

        self.error = "Rule " + id + " doesn't exist";
        return reject(false);
    });
}

DynamicConfig.prototype.save_rule = function(pDevice, pCallid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.dynconf_id) {
            self.error = "DynConf not loaded";
            return reject(false);
        }

        self.device = pDevice;
        self.callid = pCallid;

        DynConf.findById(self.dynconf_id, (err, dc) => {
            if (err) return reject(err);

            dc.device = pDevice;
            dc.callid = pCallid;

            dc.save();
            return resolve(true);
        });
    });
}
