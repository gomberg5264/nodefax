var mongoose = require('mongoose');
var child_process = require('child_process');
var Modems = require('./../models/modem');
var func = require('./../globalFunc');
var conf = require('./../hylafaxLib/config');

module.exports = (() => {
    var devid = null,
        error = null,
        alias = null,
        device = null,
        printer = null,
        faxcatid = null,
        contact = null;
    
    var status = [];
    var didr_id;

    return {
        create: (pDevice, pAlias, pContact, pPrinter, pFaxcatid) => {
            alias = pAlias;
            device = pDevice;
            contact = pContact || null;
            printer = pPrinter || null;
            faxcatid = pFaxcatid || null;

            if (!alias || !device) {
                error = 'Modem device was not created';
                return false;
            }

            Modems.find({'device': device})
                .exec( (err, modem) => {
                    if (modem) {
                        error = 'Modem device already exists';
                        return false;
                    }

                    var newmodem = new Modems({
                        device,
                        alias,
                        contact,
                        printer,
                        faxcatid
                    });

                    newmodem.save( (err, doc2) => {
                        if (err) {
                            error = 'Modem device was not created';
                            return false;
                        }

                        didr_id = doc2._id;
                        return true;
                    });

                });
        },

        delete_device: (pDevice) => {
            if (!mongoose.Types.ObjectId.isValid(pDevice)) {
                return false;
            }

            Modems.remove({'_id': pDevice}, (err) => {
                if (err) return false;
                return true;
            });
        },

        get_modems: () => {
            var ret = [];
            Modems.find({}, {'_id': -1, device: 1}, {sort: {alias: 1}})
                .exec( (err, modems) => {
                    if (err) {
                        error = 'No modems configured';
                        return null;
                    }

                    if (modems.length > 1) {
                        modems.forEach( (modem) => {
                            ret.push(modem.device);
                        });
                        return ret;
                    } else {
                        error = 'No modems configured';
                        return null;
                    }
                });
        },

        list_modems: () => {

        },

        load_device: (pDevice) => {
            if (!pDevice) {
                error = 'Modem not selected';
                return false;
            }

            Modems.find({'device' : pDevice})
                .exec( (err, modem) => {
                    if (err) {
                        error = 'Modem ' + pDevice + ' does not exist';
                        return false;
                    }

                    if (modem) {
                        device = modem.device;
                        alias = modem.alias;
                        devid = modem._id;
                        contact = modem.contact;
                        printer = modem.printer;
                        faxcatid = modem.faxcatid;
                        all_data = modem;
                        return true;
                    }
                });
        },

        get_status: () => {
            if (status.length === 0) {
                var Status = null;

                var array = child_process.execSync(conf.FAXSTAT + ' 2>/dev/null');
                console.log(array);
                // array.forEach( (buffer) => {
                //     var match = buffer.
                // })
            }

            if (func.isset(status[device])) {
                return status[device];
            } else {
                return {
                    'class': 'modem-wait',
                    'status': 'Please wait'
                };
            }
        },

        get_alias: () => {
            return alias;
        },

        get_contact: () => {
            return contact;
        },

        get_printer: () => {
            return printer;
        },

        get_faxcatid: () => {
            return faxcatid;
        },

        get_devid: () => {
            return devid;
        },

        get_device: () => {
            return device;
        },

        get_error: () => {
            return error;
        },

        set_alias: (pAlias) => {
            if (!devid) {
                error = 'No modem loaded';
                return false;
            }

            alias = pAlias;
            Modems.findByIdAndUpdate(
                devid,
                {$set: {'alias': alias}},
                (err, modem) => {
                    if (err) return false;
                    return true;
                });
        },

        set_contact: (pContact) => {
            if (!devid) {
                error = 'No modem loaded';
                return false;
            }

            contact = pContact;
            Modems.findByIdAndUpdate(
                devid,
                {$set: {'contact': contact}},
                (err, modem) => {
                    if (err) return false;
                    return true;
                });
        },

        set_printer: (pPrinter) => {
            if (!devid) {
                error = 'No modem loaded';
                return false;
            }

            printer = pPrinter;
            Modems.findByIdAndUpdate(
                devid,
                {$set: {'printer': printer}},
                (err, modem) => {
                    if (err) return false;
                    return true;
                });
        },

        set_faxcatid: (pFaxcatid) => {
            if (!devid) {
                error = 'No modem loaded';
                return false;
            }

            faxcatid = pFaxcatid;
            Modems.findByIdAndUpdate(
                devid,
                {$set: {'faxcatid': faxcatid}},
                (err, modem) => {
                    if (err) return false;
                    return true;
                });
        }
    };
})();