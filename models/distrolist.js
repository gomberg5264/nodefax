var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    lastmod_user: String
});

module.exports = mongoose.model('distrolist', DistroList);