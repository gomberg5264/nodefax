var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FaxArchive = new Schema({
    faxpath: {
        type: String,
        required: true
    },
    pages: Number,

    faxnumid: Number,
    companyid: Number,
    faxcatid: String,
    didr_id: String,
    user_id: String,
    
    description: String,
    lastmoduser: String,
    modemdev: String,
    origfaxnum: String,
    faxcontent: String,
    inbox: {
        type: Boolean,
        default: true
    },
    date: {
        lastoperation: Date,
        lastmoddate: Date,
        archstamp: Date
    }

});

module.exports = mongoose.model('faxarchive', FaxArchive);