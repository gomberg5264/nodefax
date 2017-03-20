var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SysLog = new Schema({
	logtext: String,
	logdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('syslog', SysLog);