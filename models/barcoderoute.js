var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BarcodeRoute = new Schema({
    barcode: String,
    alias: String,
    contact: String,
    printer: String,
    faxcatid: String
});

module.exports = mongoose.model('barcoderoute', BarcodeRoute);