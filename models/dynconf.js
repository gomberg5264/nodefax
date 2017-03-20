var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DynConf = new Schema({
	device: String,
	callid: String
});

module.exports = mongoose.model('dynconf', DynConf);