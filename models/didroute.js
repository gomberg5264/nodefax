var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DIDRoute = new Schema({
    routecode: {
        type: String,
        required: true
    },
    alias: String,
    contact: String,
    printer: String,
    faxcatid: String
});

module.exports = mongoose.model('didroute', DIDRoute);