var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var AddressBookEmail = new Schema({
    abook_id: {
        type: ObjectId,
        ref: 'addressbook'
    },
    contact_name: String,
    contact_email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('addressbookemail', AddressBookEmail);