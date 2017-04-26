#!/usr/bin/env node

var fs = require('fs');

var db = require('./../models');
var AFAddressBook = require('./../helper/AFAddressBook');
var conf = require('./config');

var handle = fs.openSync(conf.PHONEBOOK, 'w');
fs.writeSync(handle, "PBOOK1.1");

var addressbook = new AFAddressBook();

var company_list = addressbook.get_companies();
console.log(company_list);
if (company_list) {
    company_list.forEach( (entry) => {
        fs.writeSync(handle, `${entry.company}|`);

        AddressBook.loadbycid(entry._id);
        var faxnums = AddressBook.get_faxnums();

        var cnt = 0;

        if(faxnums !== null) {
            faxnums.forEach( (fax) => {
                if (cnt > 0) fs.writeSync(handle, ";");
                if (fax['faxnumber'].length) {
                    cnt++;
                    fs.writeSync(handle, fax['faxnumber']);
                }
            });
        }
        
        fs.writeSync(handle, "|||||||");
    });
}

fs.closeSync(handle);
