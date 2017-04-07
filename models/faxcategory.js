var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FaxCategory = new Schema({
    name: String
});

module.exports = mongoose.model('faxcategory', FaxCategory);