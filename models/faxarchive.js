var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var FaxArchive = new Schema({
    faxpath: {
        type: String,
        required: true
    },
    pages: Number,

    faxnumid: {
        type: ObjectId,
        ref: 'addressbookfax'
    },
    companyid: {
        type: ObjectId,
        ref: 'addressbook'
    },
    faxcatid: {
        type: ObjectId,
        ref: 'faxcategory'
    },
    didr_id: {
        type: ObjectId,
        ref: 'didroute'
    },
    user_id: {
        type: ObjectId,
        ref: 'user'
    },
    
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