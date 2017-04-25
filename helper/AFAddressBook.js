var func = require('./../globalFunc');
var conf = require('./../hylafaxLib/config');
var AddressBook = require('./../models/addressbook');
var AddressBookEmail = require('./../models/addressbookemail');
var AddressBookFAX = require('./../models/addressbookfax');

function AFAddressBook() {
    this.abook_id = null;
    this.company = null;
    this.email_array = {};
    this.fax_array = {};
    this.error = '';
    this.multiple = false;
    this.queried = false;
    this.results = null;
}

AFAddressBook.prototype.save_settings = function(data) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if ((typeof self.fax_array['abookfax_id']) === 'undefined') {
            self.error = 'No abookfax_id loaded';
            return reject(self.error);
        }

        if ((typeof data['faxnumber']) !== 'undefined') {
            if (!data['faxnumber']) {
                return self.delete_faxnumid(self.fax_array['abookfax_id']);
            }

            self.fax_array = func.array_merge(self.fax_array, data);
            console.log(self.fax_array);

            AddressBookFAX.findByIdAndUpdate(self.fax_array['abookfax_id'],
                {$set: {
                    abook_id: self.abook_id,
                    faxnumber: self.fax_array['faxnumber'],
                    email: self.fax_array['email'],
                    description: self.fax_array['description'],
                    to_person: self.fax_array['to_person'],
                    to_location: self.fax_array['to_location'],
                    to_voicenumber: self.fax_array['to_voicenumber'],
                    faxcatid: self.fax_array['faxcatid'],
                    faxfrom: self.fax_array['faxfrom'],
                    faxto: self.fax_array['faxto'],
                    printer: self.fax_array['printer']
                } },
                {new: true},
                (err, res) => {
                    if (err) return reject(err);
                    return resolve(true);
                });
        }
    });
};

AFAddressBook.prototype.delete_faxnumid = function(abookfax_id) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.abookfax_id) {
            self.error = 'No abookfax_id sent';
            return reject(self.error);
        }

        AddressBookFAX.findByIdAndRemove(abookfax_id)
            .exec( (err, bookfax) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.load_faxvals = function(data) {
    this.fax_array = data;
    this.abook_id = data['abook_id'];
    this.company = null;
    return true;
};

AFAddressBook.prototype.create = function(companyname) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!companyname) {
            self.error = 'You must enter a company name';
            return reject(self.error);
        }

        self.company = companyname;
        var lookup = {'company': self.company};

        // check if entry already exists
        AddressBook.find(lookup)
            .exec( (err, book) => {
                if (book) {
                    self.abook_id = book._id;
                    self.error = 'Company name already exists';
                    return reject(self.error);
                }
                return resolve(true);
            });

        var abook = new AddressBook(lookup);
        abook.save( (err) => {
                if (!err) {
                    self.abook_id = abook._id;
                    return resolve(true);
                }

                self.error = 'No abook_id created';
                return reject(self.error);
        });
    });
};

AFAddressBook.prototype.loadbycid = function(cid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!cid) {
            self.error = 'No abook_id loaded';
            return reject(self.error);
        }

        self.abook_id = cid;

        AddressBook.findById(self.abook_id)
            .exec( (err, book) => {
                if (err) {
                    self.abook_id = null;
                    return reject(err);
                }

                self.company = book.company;
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.get_companies = function(with_reserved) {
    with_reserved = (with_reserved) ? true : false;

    var sql = (!with_reserved) ? {'company': {$ne: conf.RESERVED_FAX_NUM} } : {};

    return new Promise( (resolve, reject) => {
        AddressBook.find(sql, null, {sort: {company: 1}})
            .exec( (err, books) => {
                if (err) return reject(err);

                return resolve(books);
            });
    });
};

AFAddressBook.prototype.search_companies = function(query) {
    var keywords = query.trim();
    keywords = keywords.replace(/ /, '%');

    console.log(keywords);

    var lc_kw = keywords.toLowerCase();
    //var uc_kw = keywords.toUpperCase();

    var sql = {$or: [{'company': new RegExp(keywords, 'i')}, {'company': new RegExp(lc_kw, 'i')}]};

    return new Promise( (resolve, reject) => {
        AddressBook.find(sql, null, {sort: {company: 1}})
            .exec( (err, books) => {
                if (err) return reject(err);

                return resolve(books);
            });
    });
};

AFAddressBook.prototype.totalfaxes = function() {
    if ((typeof this.fax_array['abookfax_id']) !== 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    var from = this.fax_array['faxfrom'];
    var to = this.fax_array['faxto'];
    return {'from': from, 'to': to};
};

AFAddressBook.prototype.get_companyid = function() {
    if (!this.abook_id) {
        this.error = 'No abook_id loaded';
        return null;
    }
    return this.abook_id;
};

AFAddressBook.prototype.set_company = function(companyname) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.abook_id) {
            self.error = 'No abook_id loaded';
            return reject(self.error);
        }

        if (!companyname) {
            self.error = 'You must enter a company name';
            return reject(self.error);
        }
        self.company = companyname;
        AddressBook.update(
            {'_id': self.abook_id},
            {$set: {'company': self.company}},
            (err) => {
                if (!err) {
                    return reject(err);
                }
                return resolve(true);
        });
    });
};

AFAddressBook.prototype.delete_cid = function(cid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!cid) {
            self.error = 'No abook_id loaded';
            return reject(self.error);
        }

        AddressBook.findByIdAndRemove(cid)
            .exec( (err, res) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.has_fax2email = function() {
    var self = this;

    return new Promise( (resolve, reject) => {
        AddressBookFAX.find(
            {$and: [{'abook_id': self.abook_id}, {'email': {$nin: ['', null]}}]},
            {email: 1})
            .exec( (err, bookfax) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.get_company = function() {
    if (!this.abook_id) {
        this.error = 'No abook_id loaded';
        return false;
    }

    return this.company;
};

AFAddressBook.prototype.get_error = function() { return this.error; };

AFAddressBook.prototype.create_faxnumid = function(faxnumber) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.abook_id) {
            self.error = 'No abook_id loaded';
            return reject(self.error);
        }
        self.fax_array = {};
        self.fax_array['faxnumber'] = func.clean_faxnum(faxnumber);

        if (!self.fax_array['faxnumber']) {
            self.error = 'fax number missing';
            return reject(self.error);
        }

        var lookup = {$and: [{'abook_id': self.abook_id}, {'faxnumber': self.fax_array['faxnumber']}]};

        AddressBookFAX.find(lookup)
            .exec( (err, bookfaxes) => {
                if (err) {
                    self.error = 'Company already has this fax number';
                    return reject(self.error);
                }

                var abookfax = new AddressBookFAX({
                    'abook_id': self.abook_id,
                    'faxnumber': self.fax_array['faxnumber']
                });
                abookfax.save( (err, bookfax) => {
                    if (err) {
                        self.error = 'Could not create faxnumid';
                        self.fax_array['abookfax_id'] = null;
                        return reject(self.error);
                    }

                    self.fax_array['abookfax_id'] = bookfax._id;
                    return resolve(true);
                });
            });
    });
};

AFAddressBook.prototype.delete_companyfaxids = function(cid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!cid ) {
            self.error = 'No abook_id sent';
            return reject(self.error);
        }
        AddressBookFAX.remove({'abook_id': cid}, (err) => {
            if (err) return reject(err);
            return resolve(true);
        });
    });
};

AFAddressBook.prototype.loadbyfaxnumid = function(abookfax_id) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!abookfax_id) {
            self.error = 'No faxnumid sent';
            return reject(self.error);
        }

        self.fax_array = {};

        AddressBookFAX.findById(abookfax_id, (err, bookfax) => {
            if (err) {
                self.error = 'No company for this fax number';
                return reject(self.error);
            }

            return resolve(self.load_faxvals(bookfax));
        });
    });
};

AFAddressBook.prototype.loadbyfaxnum = function(faxnumber) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!faxnumber) {
            self.error = 'No faxnumber sent';
            return reject(self.error);
        }

        var mult = false;
        self.multiple = false;

        faxnumber = func.clean_faxnum(faxnumber);

        AddressBookFAX.find({'faxnumber': faxnumber})
                .exec( (err, bookfaxes) => {
                if (err) return reject(err);

                if (bookfaxes instanceof Array) {
                    var num = bookfaxes.length;

                    if (num === 1) {
                        self.load_faxvals(bookfaxes[0]);
                    }
                    else if (num > 1) {
                        mult = true;
                        self.multiple = true;
                    }
                    return resolve({'mult': mult});
                } else {
                    self.error = "No company for this fax number '" + faxnumber + "'";
                    return reject(self.error);
                }
        });
    });
};

AFAddressBook.prototype.reassign = function(newcid) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!newcid || !abook_id) {
            self.error = 'No abook_id loaded';
            return reject(self.error);
        }

        AddressBookFAX.find({'abook_id': newcid})
            .exec( (err, bookfax) => {
                if (err) {
                    self.error = 'Invalid cid';
                    return reject(self.error);
                }

                if (bookfax) {
                    AddressBookFAX.update(
                        {'abook_id': self.abook_id},
                        {$set: {'abook_id': newcid}},
                        (err, upd_bookfax) => {
                            if (err) {
                                self.error = 'Error updating AddressBookFAX';
                                return reject(self.error);
                            }
                            return resolve(self.delete_cid(self.abook_id));
                        }
                    );
                }
            });
    });
};

AFAddressBook.prototype.get_multinfo = function() {
    if (!multiple) {
        error = 'No nultiple results';
        return false;
    }

    if (!queried) {
        var faxnumber = ((typeof this.fax_array['faxnumber']) !== 'undefined') ?
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
};

AFAddressBook.prototype.get_faxnums = function() {
    if (!abook_id) {
        error = 'No abook_id loaded';
        return null;
    }

    AddressBookFAX.find({'abook_id': abook_id})
        .exec( (err, bookfaxes) => {
            if (err) return null;
            return bookfaxes;
        });
};

AFAddressBook.prototype.get_faxnumber = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['faxnumber']) !== 'undefined') ? this.fax_array['faxnumber'] : null;
};

AFAddressBook.prototype.get_description = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['description']) !== 'undefined') ? this.fax_array['description'] : null;
};

AFAddressBook.prototype.get_category = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['faxcatid']) !== 'undefined') ? this.fax_array['faxcatid'] : null;
};

AFAddressBook.prototype.get_printer = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['printer']) !== 'undefined') ? this.fax_array['printer'] : null;
};

AFAddressBook.prototype.get_faxnumid = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return this.fax_array['abookfax_id'];
};

AFAddressBook.prototype.get_email = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['email']) !== 'undefined') ? this.fax_array['email'] : null;
};

AFAddressBook.prototype.get_faxfrom = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['faxfrom']) !== 'undefined') ? this.fax_array['faxfrom'] : null;
};

AFAddressBook.prototype.get_faxto = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['faxto']) !== 'undefined') ? this.fax_array['faxto'] : null;
};

AFAddressBook.prototype.get_to_person = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['to_person']) !== 'undefined') ? this.fax_array['to_person'] : null;
};

AFAddressBook.prototype.get_to_location = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['to_location']) !== 'undefined') ? this.fax_array['to_location'] : null;
};

AFAddressBook.prototype.get_to_voicenumber = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }
    return ((typeof this.fax_array['to_voicenumber']) !== 'undefined') ? this.fax_array['to_voicenumber'] : null;
};

AFAddressBook.prototype.inc_faxfrom = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }

    var faxfrom = ((typeof this.fax_array['faxfrom']) !== 'undefined') ? this.fax_array['faxfrom']+1 : 1;
    return self.save_settings({'faxfrom': faxfrom});
};

AFAddressBook.prototype.inc_faxto = function() {
    if ((typeof this.fax_array['abookfax_id']) === 'undefined') {
        this.error = 'No abookfax_id loaded';
        return false;
    }

    var faxto = ((typeof this.fax_array['faxto']) !== 'undefined') ? this.fax_array['faxto']+1 : 1;
    return self.save_settings({'faxto': faxto});
};

AFAddressBook.prototype.create_contact = function(name, email) {
    this.email_array['contact_name'] = name;
    this.email_array['contact_email'] = email;

    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.email_array['contact_email']) {
            self.error ='please enter a valid e-mail address.';
            return reject(self.error);
        }

        if (!self.email_array['contact_name']) {
            self.error = 'You must enter a name.';
            return reject(self.error);
        }

        AddressBookEmail.find({'contact_email': email_array['contact_email']})
            .exec( (err, doc) => {
                if (doc) {
                    self.error = 'Email address is already in use.';
                    return reject(self.error);
                }

                var abemail = new AddressBookEmail({
                    contact_name: self.email_array['contact_name'],
                    contact_email: self.email_array['contact_email']
                });

                abemail.save( (err, bemail) => {
                    if (err) {
                        self.error = 'AddressBookEmail contact not created.';
                        return reject(self.error);
                    }

                    self.email_array['abookemail_id'] = bemail._id;
                    return resolve(true);
                });
            });
    });
};

AFAddressBook.prototype.create_contacts = function(str) {
    var self = this;
    var arr = str.split(/[;]/, -1);

    arr.forEach( (value) => {
        var data = value.split('<');
        var name = data[0];
        var email = (func.isset(data[1])) ? data[1] : null;

        if (email) {
            email = email.replace(/[<>]/, '');
            email = email.trim();
        }

        name = name.replace(/[<>]/, '');
        name = name.trim();

        if (func.invalid_email(email)) {
            if (!func.invalid_email(name)) {
                email = name;

                var j = name.split('@');
                name = j[0].replace(/[._]/, ' ');

                self.create_contact(name, email);
            }
        } else {
            self.create_contact(name, email);
        }
    });
};

AFAddressBook.prototype.get_contacts = function() {
    var self = this;

    return new Promise( (resolve, reject) => {
        AddressBookEmail.aggregate(
            [
                {$project: {
                    contact: {
                        $concat: ['"$contact_name"', '<$contact_email>']
                    }
                }}
            ])
            .exec( (err, doc) => {
                if (!(doc instanceof Array)) {
                    self.error ='No contacts found.';
                    return reject(self.error);
                }

                var contacts = {};

                doc.forEach( (data) => {
                    contacts[data['_id']] = data.contact;
                });

                return resolve(contacts);
            });
    });
};

AFAddressBook.prototype.make_contact_list = function() {
    var self = this;
    var abookemail_id, name, email;
    
    return new Promise( (resolve, reject) => {
        if (!self.queried) {
            AddressBookEmail
                .find({},
                    {'_id': 1, 'contact_name': 1, 'contact_email': 1},
                    {sort: {'contact_name': 1}})
                .exec( (err, lists) => {
                    if (err) {
                        self.queried = false;
                        self.results = null;
                        return reject(err);
                    }
                    self.results = lists;
                    self.queried = true;
                });
        }

        if (self.results.length > 1) {
            var data = self.results.shift();
            if (data) {
                abookemail_id = data._id;
                name = data.contact_name;
                email = data.contact_email;
                return resolve({
                    abookemail_id,
                    name,
                    email
                });
            }
        }

        self.queried = false;
        self.results = null;
        return reject(false);
    });
};

AFAddressBook.prototype.remove_contact = function(abookemail_id) {
    return new Promise( (resolve, reject) => {
        AddressBookEmail.remove({'_id': abookemail_id})
            .exec( (err) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.load_contact_by_id = function(abookemail_id) {
    this.email_array['abookemail_id'] = abookemail_id;
    var self = this;

    return new Promise( (resolve, reject) => {
        AddressBookEmail.findById(email_array['abookemail_id'])
            .exec( (err, doc) => {
                if (err) {
                    self.email_array['abookemail_id'] = null;
                    self.error = 'Invalid abookemail_id for this account' + self.email_array['abookemail_id'];
                    return reject(self.error);
                }

                self.email_array['contact_name'] = doc.contact_name;
                self.email_array['contact_email'] = doc.contact_email;
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.update_contact = function(name, email) {
    var self = this;

    return new Promise( (resolve, reject) => {
        if (!self.email_array['abookemail_id']) {
            self.error = 'No abookemail_id loaded';
            return reject(self.error);
        }

        self.email_array['contact_name'] = name;
        self.email_array['contact_email'] = email;

        if (!self.email_array['contact_email']) {
            self.error = 'Please enter a valid e-mail address.';
            return reject(self.error);
        }

        if (!self.email_array['contact_name']) {
            self.error = 'You must enter a name.';
            return reject(self.error);
        }

        AddressBookEmail.findByIdAndUpdate(
            self.email_array['abookemail_id'],
            {$set: {
                'contact_name': self.email_array['contact_name'],
                'contact_email': self.email_array['contact_email']
            }},
            {new: true},
            (err, doc) => {
                if (err) return reject(err);
                return resolve(true);
            });
    });
};

AFAddressBook.prototype.get_contact_name = function() {
    return this.email_array['contact_name'];
};

AFAddressBook.prototype.get_contact_email = function() {
    return this.email_array['contact_email'];
};

module.exports = AFAddressBook;
