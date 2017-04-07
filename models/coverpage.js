var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CoverPages = new Schema({
    title: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('coverpage', CoverPages);