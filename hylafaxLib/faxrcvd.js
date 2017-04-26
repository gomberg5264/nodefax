#!/usr/bin/env node

// console.log('Argv Length', process.argv.length);
// console.log(process.argv);
var fs = require('fs');
var path = require('path');

var db = require('./../models');
var FaxModem = require('./../helper/FaxModem');
var AFAddressBook = require('./../helper/AFAddressBook');
var func = require('./../globalFunc');
var conf = require('./config');

var argc = process.argv.length;

if (argc < 4) {
    console.error('Usage: ' + process.argv[1] + ' file devID commID error-msg [CIDNumber] [CIDName] [DIDnum]');
    process.exit(1);
}

var debug = false;
var tiff_file = process.argv[2];
var modemdev = process.argv[3];

var commID = (argc >= 5) ? process.argv[4] : '';
var errormsg = (argc >= 6) ? process.argv[5] : '';

var CIDNumber = null;
var CIDName = null;
var DIDNum = null;

if (FaxModem.load_device(modemdev)) {
    func.faxlog(`faxrcvd> Found unconfigured modem: ${modemdev}. Configureing...`, true);
    FaxModem.create(modemdev, modemdev, null);
}

// process tiff file
//
// get the sender and pages
if (fs.existsSync(tiff_file)) {
    var faxinfo = func.faxinfo(tiff_file);
    if (!faxinfo) {
        func.faxlog(`faxrcvd> failed: ${tiff_file} ${modemdev} corrupted`, true);
        process.exit(1);
    }

    var sender = faxinfo['Sender'];
    var pages = faxinfo['Pages'];
    var date = faxinfo['Received'];

    if ((typeof faxinfo['CallID' + conf.CALLIDn_CIDNumber]) !== 'undefined') {
        if (faxinfo['CallID' + conf.CALLIDn_CIDNumber] !== '<NONE>') {
            CIDNumber = faxinfo['CallID' + conf.CALLIDn_CIDNumber];
        }
    }

    if ((typeof faxinfo['CallID' + conf.CALLIDn_CIDName]) !== 'undefined') {
        if (faxinfo['CallID' + conf.CALLIDn_CIDName] !== '<NONE>') {
            CIDName = faxinfo['CallID' + conf.CALLIDn_CIDName];
        }
    }

    if ((typeof faxinfo['CallID' + conf.CALLIDn_DIDNum]) !== 'undefined') {
        if (faxinfo['CallID' + conf.CALLIDn_DIDNum] !== '<NONE>') {
            DIDNum = faxinfo['CallID' + conf.CALLIDn_DIDNum];
        }
    }
} else {
    func.faxlog(`faxrcvd> failed: ${tiff_file} not found`, true);
    process.exit(1);
}

var company_name = (CIDName) ? CIDName : sender;
var company_fax = (CIDNumber) ? CIDNumber : sender;

func.faxlog(`faxrcvd> executing: ${tiff_file} ${modemdev} '${commID}' '${errormsg}' CIDNum: '${CIDNumber}' CIDName: '${CIDName}' DID: '${DIDNum}'`, true);
func.faxlog(`faxrcvd> PROCESSING FAX from '${company_fax}' (${pages} pages) received '${date}'`, true);

// create thumbnail and pdf
//
// prepare directory by year, month, day, faxnumber, hourminsec
var array = date.split(' ');
var day = array[0], hour = array[1];

day = day.replace(/:/, path.sep);

var chour = hour;

var hylafaxid = tiff_file.replace('recvq/fax', '');
hylafaxid = hylafaxid.replace('.tif', '');

var cpfax = func.clean_faxnum(company_fax).replace(/\+/, '');
var faxpath = path.join(conf.ARCHIVE, day, cpfax, hylafaxid);

// create the directories
fs.mkdirSync(faxpath);

var faxfile = path.join(faxpath, conf.TIFFNAME);
var pdffile = path.join(faxpath, conf.PDFNAME);
var thumbnail = path.join(faxpath, conf.THUMBNAIL);

// copy tiff file to new location
var tiff_prog = (conf.TIFF_TO_G4) ? conf.TIFFCPG4 : conf.TIFFCP;

// if fax failed to copy
if (func.system_v(`${tiff_prog} ${tiff_file} ${faxfile}`)) {
    func.faxlog(`faxrcvd> Failed to copy ${tiff_file} to ${faxfile}`, true);
    process.exit(1);
}

console.log('Create PDF');

func.tiff2pdf(faxfile, pdffile);

console.log('Create Thumbnails');

// AddressBook
var faxnumid;
var addressbook = new AFAddressBook();
var res = addressbook.loadbyfaxnum(company_fax);

if (res !== false) {
    if (res.mult) {
        faxnumid = 0;
        console.log('WARNING: multiple results for faxnumber');
    } else {
        faxnumid = AddressBook.get_faxnumid();
        AddressBook.inc_faxfrom();
    }
}

