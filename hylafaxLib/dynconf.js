#!/usr/bin/env node

var func = require('./../globalFunc');
//var db = require('./models');
var dc = require('./../helper/DynamicConfig');

if (process.argv.length === 2) {
    console.error(process.argv[1] + ' device CallID1 CallIDn ...');
    process.exit(1)
}

var device = process.argv[2];

var callid1;

if (!func.isset(process.argv[3])) {
    callid1 = "EMPTY CALLID";
} else {
    callid1 = func.strip_sipinfo(process.argv[3]);
}

func.faxlog("dynconf> checking CallID1 " + callid1 + "on device " + device);

dc.lookup(device, callid1).then((data) => {
	func.faxlog("dynconf> rejecting " + callid1 + "on device " + device);
	console.log("RejectCall: true");
});
