var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Modems = new Schema({
    device: {
        type: String,
        required: true
    },
    alias: String,
    contact: String,
    printer: String,
    faxcatid: String
});

module.exports = mongoose.model('modem', Modems);