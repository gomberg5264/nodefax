var mongoose = require('mongoose');
var child_process = require('child_process');
var Modems = require('./../models/modem');
var func = require('./../globalFunc');
var conf = require('./../hylafaxLib/config');

function FaxModem() {
    this.devid = null;
    this.error = null;
    this.alias = null;
    this.device = null;
    this.printer = null;
    this.faxcatid = null;
    this.contact = null;
    this.all_data = null;
    
    this.status = {};
    this.didr_id = null;

    this.queried = false;
    this.results = null;
}

FaxModem.prototype.create = function(pDevice, pAlias, pContact, pPrinter, pFaxcatid) {
    this.alias = pAlias;
    this.device = pDevice;
    this.contact = pContact || null;
    this.printer = pPrinter || null;
    this.faxcatid = pFaxcatid || null;

    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.alias || !self.device) {
            self.error = 'Modem device was not created';
            return reject(self.error);
        }

        Modems.find({'device': self.device})
            .exec( (err, modem) => {
                if (modem) {
                    self.error = 'Modem device already exists';
                    return reject(self.error);
                }

                var newmodem = new Modems({
                    'device': self.device,
                    'alias': self.alias,
                    'contact': self.contact,
                    'printer': self.printer,
                    'faxcatid': self.faxcatid
                });

                newmodem.save( (err, doc2) => {
                    if (err) {
                        self.error = 'Modem device was not created';
                        return reject(self.error);
                    }

                    self.didr_id = doc2._id;
                    return resolve(true);
                });

            });
    });
};

FaxModem.prototype.delete_device = function(pDevice) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!mongoose.Types.ObjectId.isValid(pDevice)) {
            return reject(false);
        }

        Modems.remove({'_id': pDevice}, (err) => {
            if (err) return reject(err);
            return resolve(true);
        });
    });
};

FaxModem.prototype.get_modems = function() {
    var ret = [];
    var self = this;

    return new Promise( (resolve, reject) => {
        Modems.find({}, {'_id': -1, device: 1}, {sort: {alias: 1}})
            .exec( (err, modems) => {
                if (err) {
                    self.error = 'No modems configured';
                    return reject(err);
                }

                if (modems.length > 1) {
                    modems.forEach( (modem) => {
                        ret.push(modem.device);
                    });
                    return resolve(ret);
                } else {
                    self.error = 'No modems configured';
                    return reject(self.error);
                }
            });
    });
};

FaxModem.prototype.list_modems = function() {
    var data;
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.queried) {
            self.queried = true;
            Modems.find({}, null, {sort: {device: 1}})
                .exec( (err, modem) => {
                    self.results = modem;

                    if (self.results instanceof Array) {
                        data = self.results.shift();
                        if (data) {
                            return resolve({
                                    'device': data.device,
                                    'devid': data._id,
                                    'alias': data.alias
                                });
                        }
                    } else {
                        self.queried = false;
                        self.error = 'No modem configured';
                        return reject(self.error);
                    }
                });
        } else {
            if (self.results instanceof Array) {
                data = self.results.shift();
                if (data) {
                    return resolve({
                            'device': data.device,
                            'devid': data._id,
                            'alias': data.alias
                        });
                }
            } else {
                self.queried = false;
                self.error = 'No modem configured';
                return reject(self.error);
            }
        }
    });
};

FaxModem.prototype.load_device = function(pDevice) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!pDevice) {
            self.error = 'Modem not selected';
            return reject(self.error);
        }

        Modems.find({'device' : pDevice})
            .exec( (err, modem) => {
                if (err) {
                    self.error = 'Modem ' + pDevice + ' does not exist';
                    return reject(self.error);
                }

                if (modem) {
                    self.device = modem.device;
                    self.alias = modem.alias;
                    self.devid = modem._id;
                    self.contact = modem.contact;
                    self.printer = modem.printer;
                    self.faxcatid = modem.faxcatid;
                    self.all_data = modem;
                    return resolve(true);
                }
            });
    });
};

FaxModem.prototype.get_status = function() {
    if (func.empty(this.status)) {
        var Status = '';

        var array = child_process.execSync(conf.FAXSTAT + ' 2>/dev/null');
        console.log(array);
        var self = this;

        array.forEach( (buffer) => {
            var match = buffer.match(/ ([a-zA-Z0-9]*) /);
            if (!func.empty(match[1])) {
                Status = buffer.substring(buffer.indexOf(': ')+2);
                Status = Status.trim();

                var code = {},
                    z = '',
                    company = '';

                switch ( Status.substring(0, 2) ) {
                    case 'Ru':  // Running (free)
                        code = {'class': 'modem-free', 'status': 'Idle'};
                        break;

                    case 'Se':  // Sending fax
                        z = Status.replace('Sending job ', '');
                        code = {'class': 'modem-send', 'status': 'Sending a fax'};
                        break;

                    case 'Re':  // Receiving facsimile
                        code = {'class': 'modem-recv', 'status': 'Receiving a fax'};
                        z = Status.replace('Receiving from ', '');
                        z = z.replace('Receiving facsimile', '');
                        z = z.replace(/Receiving \[(\d+)\] from /, '');

                        company = z;
                        func.phone_lookup(z).then( (data) => {
                            if (data) {
                                company = data;
                            }

                            if (company) {
                                code = {'class': 'modem-recv-from', 'status': 'Receiving a fax from'};
                            }
                        });

                        break;

                    default:
                        code = {'class': null, 'status': 'Please wait'};
                        break;
                }
                self.status[match[1]] = code;
            }
        });
    }

    if (func.isset(status[device])) {
        return status[device];
    } else {
        return {
            'class': 'modem-wait',
            'status': 'Please wait'
        };
    }
};

FaxModem.prototype.get_alias = function() {
    return this.alias;
};

FaxModem.prototype.get_contact = function() {
    return this.contact;
};

FaxModem.prototype.get_printer = function() {
    return this.printer;
};

FaxModem.prototype.get_faxcatid = function() {
    return this.faxcatid;
};

FaxModem.prototype.get_devid = function() {
    return this.devid;
};

FaxModem.prototype.get_device = function() {
    return this.device;
};

FaxModem.prototype.get_error = function() {
    return this.error;
};

FaxModem.prototype.set_alias = function(pAlias) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.devid) {
            self.error = 'No modem loaded';
            return reject(false);
        }

        self.alias = pAlias;
        Modems.findByIdAndUpdate(
            self.devid,
            {$set: {'alias': self.alias}},
            (err, modem) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

FaxModem.prototype.set_contact = function(pContact) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.devid) {
            self.error = 'No modem loaded';
            return reject(false);
        }

        self.contact = pContact;
        Modems.findByIdAndUpdate(
            self.devid,
            {$set: {'contact': self.contact}},
            (err, modem) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

FaxModem.prototype.set_printer = function(pPrinter) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.devid) {
            self.error = 'No modem loaded';
            return reject(false);
        }

        self.printer = pPrinter;
        Modems.findByIdAndUpdate(
            self.devid,
            {$set: {'printer': self.printer}},
            (err, modem) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

FaxModem.prototype.set_faxcatid = function(pFaxcatid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.devid) {
            self.error = 'No modem loaded';
            return reject(false);
        }

        self.faxcatid = pFaxcatid;
        Modems.findByIdAndUpdate(
            self.devid,
            {$set: {'faxcatid': self.faxcatid}},
            (err, modem) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
}

module.exports = FaxModem;
