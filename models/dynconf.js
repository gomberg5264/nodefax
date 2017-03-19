var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DynConf = new Schema({
	device: Integer,
	callid: Integer
});

module.exports = mongoose.model('dynconf', DynConf);