var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressBookFAX = new Schema({
    abook_id: String,
    faxnumber: {
        type: String,
        required: true
    },
    email: String,
    description: String,
    to_person: String,
    to_location: String,
    to_voicenumber: String,
    faxcatid: String,
    faxfrom: {
        type: Number,
        default: 0
    },
    faxto: {
        type: Number,
        default: 0
    },
    printer: String
});

module.exports = mongoose.model('addressbookfax', AddressBookFAX);