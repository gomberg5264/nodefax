var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var DistroList = new Schema({
    listname: {
        type: String,
        required: true
    },
    listdata: String,
    lastmod_date: {
        type: Date,
        default: Date.now
    },
    lastmod_user: ObjectId
});

module.exports = mongoose.model('distrolist', DistroList);