var func = require('./../globalFunc');
var AddressBook = require('./../models/addressbook');
var AddressBookEmail = require('./../models/addressbookemail');
var AddressBookFAX = require('./../models/addressbookfax');

module.exports = ( () => {
    var abook_id, company, email_array={}, fax_array={}, error=null;

    function save_settings(data) {

    }

    return {
        create: (companyname) => {
            if (!companyname) {
                error = 'You must enter a company name';
                return false;
            }

            company = companyname;
            var lookup = {'company': company};

            // check if entry already exists
            if (!AddressBook.find(lookup, (err, book) => {
                    if (book) {
                        abook_id = book._id;
                        error = 'Company name already exists';
                        return false;
                    }
                    return true;
            })) {
                return false;
            }

            var abook = new AddressBook(lookup);
            if (abook.save( (err) => {
                    if (!err) {
                        abook_id = abook._id;
                        return true;
                    }
                    return false;
            })) {
                return true;
            }

            error = 'No abook_id created';
            return false;
        },

        loadbycid: (cid) => {
            if (!cid) {
                error = 'No abook_id loaded';
                return false;
            }

            abook_id = cid;

            if (AddressBook.findById(abook_id, (err, book) => {
                if (book) {
                    company = book.company;
                    return true;
                }
            })) {
                return true;
            }

            abook_id = null;
            return false;
        },

        get_companies: (with_reserved) => {

        },

        search_companies: (query) => {
            var keywords = query.trim();
            keywords = keywords.replace(/ /, '%');
            var lc_kw = keywords.toLowerCase();
            var uc_kw = keywords.toUpperCase();

            AddressBook.find()
        },

        totalfaxes: () => {
            if (fax_array['abookfax_id'] !== 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            var from = fax_array['faxfrom'];
            var to = fax_array['faxto'];
            return {'from': from, 'to': to};
        },

        get_companyid: () => {
            if (!abook_id) {
                error = 'No abook_id loaded';
                return null;
            }
            return abook_id;
        },

        set_company: (companyname) => {
            if (!abook_id) {
                error = 'No abook_id loaded';
                return false;
            }

            if (!companyname) {
                error = 'You must enter a company name';
                return false;
            }
            company = companyname;
            return AddressBook.update();
        },

        delete_cid: (cid) => {
            if (!cid) {
                error = 'No abook_id loaded';
                return false;
            }
        },

        has_fax2email: () => {
            return false;
        },

        get_company: () => {
            if (!abook_id) {
                error = 'No abook_id loaded';
                return false;
            }

            return company;
        },

        get_error: () => {
            return error;
        },

        create_faxnumid: (faxnumber) => {

        },

        delete_companyfaxids: (cid) => {

        },

        delete_faxnumid: (abookfax_id) => {

        },

        loadbyfaxnumid: (faxnumber, mult) => {

        },

        reassign: (newcid) => {

        },

        save_settings: save_settings,

        get_multinfo: (abookfax_id, pCompany) => {

        },

        get_faxnums: () => {
            if (!abook_id) {
                error = 'No abook_id loaded';
                return null;
            }

            AddressBook.findById(abook_id)
        },

        get_faxnumber: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['faxnumber'] !== 'undefined') ? fax_array['faxnumber'] : null;
        },

        get_description: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['description'] !== 'undefined') ? fax_array['description'] : null;
        },

        get_category: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['faxcatid'] !== 'undefined') ? fax_array['faxcatid'] : null;
        },

        get_printer: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['printer'] !== 'undefined') ? fax_array['printer'] : null;
        },

        get_faxnumid: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return fax_array['abookfax_id'];
        },

        get_email: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['email'] !== 'undefined') ? fax_array['email'] : null;
        },

        get_faxfrom: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['faxfrom'] !== 'undefined') ? fax_array['faxfrom'] : null;
        },

        get_faxto: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['faxto'] !== 'undefined') ? fax_array['faxto'] : null;
        },

        get_to_person: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['to_person'] !== 'undefined') ? fax_array['to_person'] : null;
        },

        get_to_location: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['to_location'] !== 'undefined') ? fax_array['to_location'] : null;
        },

        get_to_voicenumber: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return (fax_array['to_voicenumber'] !== 'undefined') ? fax_array['to_voicenumber'] : null;
        },

        inc_faxfrom: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }

            var faxfrom = (fax_array['faxfrom'] !== 'undefined') ? fax_array['faxfrom']+1 : 1;
            return save_settings({'faxfrom': faxfrom});
        },

        inc_faxto: () => {
            if (fax_array['abookfax_id'] === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }

            var faxto = (fax_array['faxto'] !== 'undefined') ? fax_array['faxto']+1 : 1;
            return save_settings({'faxto': faxto});
        },

        load_faxvals: (data) => {
            fax_array = data;
            abook_id = data['abook_id'];
            company = null;
            return true;
        },

        create_contact: (name, email) => {

        },

        create_contacts: (str) => {

        },

        get_contacts: () => {

        },

        make_contact_list: (abookemail_id, name, email) => {

        },

        remove_contact: (abookemail_id) => {

        },

        load_contact_by_id: (abookemail_id) => {

        },

        update_contact: (name, email) => {

        },

        get_contact_name: () => {
            return email_array['contact_name'];
        },

        get_contact_email: () => {
            return email_array['contact_email'];
        }
    };
})();