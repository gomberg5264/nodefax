var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressBook = new Schema({
    company: String
});

module.exports = mongoose.model('addressbook', AddressBook);