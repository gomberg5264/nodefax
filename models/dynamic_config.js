var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DynamicConfig = new Schema({
	device: Integer,
	callid: Integer
});

module.exports = mongoose.model('dynconf', DynamicConfig);