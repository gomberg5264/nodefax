var func = require('./../globalFunc');
var conf = require('./../hylafaxLib/config');
var AddressBook = require('./../models/addressbook');
var AddressBookEmail = require('./../models/addressbookemail');
var AddressBookFAX = require('./../models/addressbookfax');

module.exports = ( () => {
    var abook_id, company, email_array={}, fax_array={}, error=null, multiple=false, queried=false, results=null;

    function save_settings(data) {
        if ((typeof fax_array['abook_id']) === 'undefined') {
            error = 'No abookfax_id loaded';
            return false;
        }

        if ((typeof data['faxnumber']) !== 'undefined') {
            if (!data['faxnumber']) {
                return delete_faxnumid(fax_array['abookfax_id']);
            }

            fax_array = func.array_merge(fax_array, data);

            return AddressBookFAX
        }
    }

    function delete_faxnumid(abookfax_id) {
        if (!abookfax_id) {
            error = 'No abookfax_id sent';
            return false;
        }
        return AddressBookFAX.findByIdAndRemove(abookfax_id, (err, bookfax) => {
            if (err) return false;
            return true;
        });
    }

    function load_faxvals(data) {
        fax_array = data;
        abook_id = data['abook_id'];
        company = null;
        return true;
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
            with_reserved = (with_reserved) ? true : false;

            var sql = (!with_reserved) ? {'company': {$ne: conf.RESERVED_FAX_NUM} } : {};
            return AddressBook.find(
                sql,
                null,
                {sort: {company: 1}},
                (err, books) => {
                    if (err) return false;

                    return books;
                }
            );
        },

        search_companies: (query) => {
            var keywords = query.trim();
            keywords = keywords.replace(/ /, '%');

            console.log(keywords);

            var lc_kw = keywords.toLowerCase();
            //var uc_kw = keywords.toUpperCase();

            var sql = {$or: [{'company': new RegExp(keywords, 'i')}, {'company': new RegExp(lc_kw, 'i')}]};
            return AddressBook.find(sql, null, {sort: {company: 1}}, (err, books) => {
                if (err) return false;

                return books;
            })
        },

        totalfaxes: () => {
            if ((typeof fax_array['abookfax_id']) !== 'undefined') {
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
            return AddressBook.update(
                {'_id': abook_id},
                {$set: {'company': company}},
                (err) => {
                    if (!err) {
                        return false;
                    }
                    return true;
            });
        },

        delete_cid: (cid) => {
            if (!cid) {
                error = 'No abook_id loaded';
                return false;
            }
            return AddressBook.findByIdAndRemove(cid, (err, res) => {
                if (err) return false;
                return true;
            });
        },

        has_fax2email: () => {
            return AddressBookFAX.find(
                {$and: [{'abook_id': abook_id}, {'email': {$nin: ['', null]}}]},
                {email: 1},
                (err, bookfax) => {
                    if (err) return false;
                    return true;
                }
            );
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
            if (!abook_id) {
                error = 'No abook_id loaded';
                return false;
            }
            fax_array = {};
            fax_array['faxnumber'] = func.clean_faxnum(faxnumber);

            if (!fax_array['faxnumber']) {
                error = 'fax number missing';
                return false;
            }

            var lookup = {$and: [{'abook_id': abook_id}, {'faxnumber': fax_array['faxnumber']}]};

            if (!AddressBookFAX.find(lookup, (err) => {
                if (err) return false;
                return true;
            })) {
                error = 'Company already has this fax number';
                return false;
            }

            var abookfax = new AddressBookFAX({
                'abook_id': abook_id,
                'faxnumber': fax_array['faxnumber']
            });
            if (abookfax.save( (err, bookfax) => {
                if (err) return false;
                if (bookfax) {
                    fax_array['abookfax_id'] = bookfax._id;
                    return true;
                }
            })) {
                return true;
            }

            error = 'Could not create faxnumid';
            fax_array['abookfax_id'] = null;
            return false;
        },

        delete_companyfaxids: (cid) => {
            if (!cid ) {
                error = 'No abook_id sent';
                return false;
            }
            return AddressBookFAX.remove({'abook_id': cid}, (err) => {
                if (err) return false;
                return true;
            });
        },

        delete_faxnumid: delete_faxnumid,

        loadbyfaxnumid: (abookfax_id) => {
            if (!abookfax_id) {
                error = 'No faxnumid sent';
                return false;
            }

            fax_array = {};

            return AddressBookFAX.findById(abookfax_id, (err, bookfax) => {
                if (err) {
                    error = 'No company for this fax number';
                    return false;
                }

                return load_faxvals(bookfax);
            });
        },

        loadbyfaxnum: (faxnumber, mult) => {
            if (!faxnumber) {
                error = 'No faxnumber sent';
                return false;
            }

            mult = false;
            multiple = false;

            faxnumber = func.clean_faxnum(faxnumber);

            if (AddressBookFAX.find({'faxnumber': faxnumber}, (err, bookfaxes) => {
                if (err) return false;

                if (bookfaxes instanceof Array) {
                    var num = bookfaxes.length;

                    if (num === 1) {
                        load_faxvals(bookfaxes[0]);
                    }
                    else if (num > 1) {
                        mult = true;
                        multiple = true;
                    }
                    return true;
                }
            })) {
                return {'result': true, 'mult': mult};
            }

            error = "No company for this fax number '" + faxnumber + "'";
            return false;
        },

        reassign: (newcid) => {
            if (!newcid || !abook_id) {
                error = 'No abook_id loaded';
                return false;
            }

            return AddressBookFAX.find({'abook_id': newcid}, (err, bookfax) => {
                if (err) {
                    error = 'Invalid cid';
                    return false;
                }

                if (bookfax) {
                    return AddressBookFAX.update(
                        {'abook_id': abook_id},
                        {$set: {'abook_id': newcid}},
                        (err, upd_bookfax) => {
                            if (err) {
                                error = 'Error updating AddressBookFAX';
                                return false;
                            }
                            return module.exports.delete_cid(abook_id);
                        }
                    );
                }
            });
        },

        save_settings: save_settings,

        get_multinfo: () => {
            if (!multiple) {
                error = 'No nultiple results';
                return false;
            }

            if (!queried) {
                var faxnumber = ((typeof fax_array['faxnumber']) !== 'undefined') ?
                    fax_array['faxnumber'] : null;
                
                AddressBookFAX.find({'faxnumber': faxnumber}, {'_id': 1})
                            .populate('abook_id','company')
                            .exec( (err, bookfaxes) => {
                                queried = true;
                                results = bookfaxes;
                            });
            }

            if (results instanceof Array) {
                var data = results.shift();
                if (data) {
                    return {
                        'result': true,
                        'abookfax_id': data._id,
                        'company': data.abook_id.company
                    }
                }
            }

            multiple = false;
            fax_array['faxnumber'] = null;
            queried = false;
            results = null;
            return false;
        },

        get_faxnums: () => {
            if (!abook_id) {
                error = 'No abook_id loaded';
                return null;
            }

            return AddressBookFax.find({'abook_id': abook_id}, (err, bookfaxes) => {
                if (err) return null;
                return bookfaxes;
            });
        },

        get_faxnumber: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['faxnumber']) !== 'undefined') ? fax_array['faxnumber'] : null;
        },

        get_description: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['description']) !== 'undefined') ? fax_array['description'] : null;
        },

        get_category: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['faxcatid']) !== 'undefined') ? fax_array['faxcatid'] : null;
        },

        get_printer: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['printer']) !== 'undefined') ? fax_array['printer'] : null;
        },

        get_faxnumid: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return fax_array['abookfax_id'];
        },

        get_email: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['email']) !== 'undefined') ? fax_array['email'] : null;
        },

        get_faxfrom: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['faxfrom']) !== 'undefined') ? fax_array['faxfrom'] : null;
        },

        get_faxto: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['faxto']) !== 'undefined') ? fax_array['faxto'] : null;
        },

        get_to_person: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['to_person']) !== 'undefined') ? fax_array['to_person'] : null;
        },

        get_to_location: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['to_location']) !== 'undefined') ? fax_array['to_location'] : null;
        },

        get_to_voicenumber: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }
            return ((typeof fax_array['to_voicenumber']) !== 'undefined') ? fax_array['to_voicenumber'] : null;
        },

        inc_faxfrom: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }

            var faxfrom = ((typeof fax_array['faxfrom']) !== 'undefined') ? fax_array['faxfrom']+1 : 1;
            return save_settings({'faxfrom': faxfrom});
        },

        inc_faxto: () => {
            if ((typeof fax_array['abookfax_id']) === 'undefined') {
                error = 'No abookfax_id loaded';
                return false;
            }

            var faxto = ((typeof fax_array['faxto']) !== 'undefined') ? fax_array['faxto']+1 : 1;
            return save_settings({'faxto': faxto});
        },

        load_faxvals: load_faxvals,

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