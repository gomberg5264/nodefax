var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var BarcodeRoute = new Schema({
    barcode: String,
    alias: String,
    contact: String,
    printer: String,
    faxcatid: {
        type: ObjectId,
        ref: 'faxcategory'
    }
});

module.exports = mongoose.model('barcoderoute', BarcodeRoute);