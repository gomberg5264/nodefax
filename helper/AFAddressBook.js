var AddressBook = require('./../models/addressbook');
var AddressBookEmail = require('./../models/addressbookemail');
var AddressBookFAX = require('./../models/addressbookfax');

module.exports = ( () => {
    var abook_id, company, email_array=[], fax_array=[], error=null;

    return {
        create: (companyname) => {
            if (!companyname) {
                error = 'You must enter a company name';
                return false;
            }

            company = companyname;
            var lookup = {'company': company};

            // check if entry already exists
            if (AddressBook.find(lookup))
        }
    };
})();