var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var FaxArchive = new Schema({
    faxpath: {
        type: String,
        required: true
    },
    pages: Number,

    faxnumid: ObjectId,
    companyid: ObjectId,
    faxcatid: ObjectId,
    didr_id: ObjectId,
    user_id: ObjectId,
    
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