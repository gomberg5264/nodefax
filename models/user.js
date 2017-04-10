var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var bcrypt = require('bcryptjs');

var User = new Schema({
	userid: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
    email_sig: String,
    user_tsi: String,
    from_company: String,
    from_location: String,
    from_voicenumber: String,
    from_faxnumber: String,

    coverpage_id: {
        type: ObjectId,
        ref: 'coverpage'
    },
    faxperpageinbox: Number,
    faxperpagearchive: Number,

    superuser: {
        type: Boolean,
        default: false
    },

    can_del: {
        type: Boolean,
        default: false
    },

    modemdevs: String,
    didrouting: String,
    faxcats: String,

	is_admin: {
		type: Boolean,
		default: false
	},
    wasreset: {
        type: Boolean,
        default: false
    },
    acc_enabled: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    any_modem: {
        type: Boolean,
        default: false
    },
    date: {
        created: {
            type: Date,
            default: Date.now
        },
        last_mod: Date,
        last_login: Date
    }
});

User.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, 8);
};

User.methods.validateHash = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('user', User);