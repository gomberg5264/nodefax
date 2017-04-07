var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressBookEmail = new Schema({
    abook_id: String,
    contact_name: String,
    contact_email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('addressbookemail', AddressBookEmail);