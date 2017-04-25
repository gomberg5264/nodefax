var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var bcrypt = require('bcryptjs');

var conf = require('./hylafaxLib/config');
var SysLog = require('./models/syslog');
var AFAddressBook = require('./helper/AFAddressBook');
var html_entity_decode = require('./helper/html_entity_decode');

module.exports = (() => {

    function genpasswd(len) {
        var len = len || conf.MIN_PASSWD_SIZE;
        return (bcrypt.hashSync(process.hrtime()[0], 8)).substring(0, len);
    }

    function strpos (haystack, needle, offset) {
        var i = (haystack + '').indexOf(needle, (offset || 0));
        return i === -1 ? false : i;
    }

    function decode_entity(val) {
        return html_entity_decode(val, 'ENT_QUOTES');
    }

    function unaccent(text) {
        var search = new Array(    "à", "á", "â", "ä",
                            "è", "é", "ê", "ë",
                            "ì", "í",  "î", "ï",
                            "ò", "ó", "ô", "ö",
                            "ù", "ú", "û", "ü",
                            "^", "(", ")", "’", "\\",
                            "”", "¡", "™", "£",
                            "¢", "∞", "§", "¶",
                            "•", "ª", "º", "–",
                            "≠", "œ", "∑", "´",
                            "®", "†", "¥", "¨",
                            "’", "»", "Å", "Í",
                            "Î", "Ï", "˝", "Ó",
                            "Ô", "", "Ò", "Ú",
                            "Æ", "¸", "˛", "Ç",
                            "◊", "ı", "˜", "Â",
                            "¯", "˘", "¿", "ˆ",
                            "ø", "“", "‘", "å",
                            "ß", "∂", "ƒ", "©",
                            "˙", "˚", "¬", "…",
                            "æ", "≈", "ç", "√",
                            "∫", "≤", "≥", "÷",
                            "⁄", "€", "‹", "›",
                            "ﬁ", "ﬂ", "‡", "°",
                            "·", "‚", "—", "±",
                            "Œ", "„", "´", "‰",
                            "ˇ", "Á", "¨", "ˆ",
                            "Ø", "∏", "”");

        var replace = new Array(   "\210", "\207", "\211", "\212", 
                            "\217", "\216", "\220", "\221",
                            "\223", "\222", "\224", "\225",
                            "\230", "\227", "\231", "\232",
                            "\235", "\234", "\236", "\237",
                            "\136", "(", ")", "\325", "\\\\",
                            "\323", "\301", "\252", "\243",
                            "\242", "\245", "\244", "\246",
                            "\245", "\237", "\274", "\320",
                            "\271", "\317", "\345", "\253",
                            "\250", "\240", "\264", "\254",
                            "\325", "\310", "\201", "\352",
                            "\353", "\354", "\375", "\356",
                            "\357", "\360", "\361", "\362",
                            "\256", "\374", "\376", "\202",
                            "\340", "\365", "\367", "\345",
                            "\370", "\371", "\300", "\366",
                            "\277", "\322", "\324", "\214",
                            "\247", "\266", "\304", "\251",
                            "\372", "\373", "\302", "\311",
                            "\276", "\273", "\215", "\326",
                            "\362", "\243", "\263", "\270",
                            "\244", "\333", "\334", "\335",
                            "\336", "\337", "\340", "\260",
                            "\341", "\342", "\321", "\261",
                            "\316", "\343", "\253", "\344",
                            "\377", "\347", "\254", "\366",
                            "\257", "\325", "\323");
        
        if (text instanceof Array) {
            console.log("Got ");
            console.log(text);
            process.exit(1);
        }
        
        text = decode_entity(text);
        
        return text.replace(search, replace);
    }

    return {
        faxlog: (log, echo) => {
            var echo = echo || false;

            var syslog = new SysLog({
                logtext: log
            });
            syslog.save();

            if (echo) console.log(log);
        },

    	isset: () => {
            var a = arguments;
            var l = a.length;
            var i = 0;
            var undef;

            if (l === 0) {
                throw new Error('Empty isset');
            }

            while (i !== l) {
                if (a[i] === undef || a[i] === null) {
                    return false;
                }
                i++;
            }

            return true;
        },

        empty: (mixedVar) => {
            var undef;
            var key;
            var i;
            var len;
            var emptyValues = [undef, null, false, 0, '', '0'];

            for (i = 0, len = emptyValues.length; i < len; i++) {
                if (mixedVar === emptyValues[i]) {
                    return true;
                }
            }
            if (typeof mixedVar === 'object') {
                for (key in mixedVar) {
                    if (mixedVar.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },

        strip_sipinfo: (callid) => {
        	var matches = /^(.*)@(.*)$/.exec(callid);
            console.log('Strip sipinfo : ', matches);
            if(matches !== null) {
                callid = matches[1];
            }
            return callid;
        },

        clean_faxnum: (fnum) => {
            var res = fnum.replace(/[^\+\w]/, '');
            return res;
        },

        array_merge: (a, a2) => {
            if (a instanceof Array) {
                return a.concat(a2);
            } else {
                var p, r = {};
                for (p in a) {
                    r[p] = a[p];
                }
                for (p in a2) {
                    r[p] = a2[p];
                }
                return r;
            }
        },

        invalid_email: (email) => {
            if (email.match(/^[^@]+@([-\w]+\.)+[A-Za-z]{2,4}$/)) {
                return true; // email address is invalid
            }
            return false;
        },

        process_html_template: (template, match, values) => {
            var ret = new Array();
            var lines = fs.readFileSync(template);
            var matchlen = match.length;

            // search line if it matches "XXXX-symbol". if so, swap the appropriate value
            var re = new RegExp(match);
            var sym_re = new RegExp(match + '\b');
            lines.forEach( (line) => {
                if (line.match(re)) {
                    var symbol_ar = line.split(sym_re);

                    if (symbol_ar.length) {
                        symbol_ar.forEach( (symbol) => {
                            var symbol_ar2 = symbol.split(/[\b<]/);

                            if (symbol_ar2.length) {
                                symbol_ar2.forEach( (symbol2) => {
                                    var newsymbol = null;

                                    if (values[symbol2] !== undefined) {
                                        newsymbol = values[symbol2]; // htmlentities(values[symbol2], ENT_QUOTES, "UTF-8")
                                    }

                                    line = line.replace(match + symbol2, newsymbol);
                                });
                            }
                        });
                    }
                }
                ret.push(line);
            });

            return ret;
        },

        process_template: (template, match, values) => {
            var ret = new Array();
            var lines = fs.readFileSync(template);
            var matchlen = match.length;

            // search line if it matches "XXXX-symbol". if so, swap the appropriate value
            var re = new RegExp(match);
            var sym_re = new RegExp(match + '\b');
            lines.forEach( (line) => {
                if (line.match(re)) {
                    var pos_start = strpos(line, match) + matchlen;
                    var pos_end = strpos(line, ')');
                    var symbol = line.substring(pos_start, pos_end - pos_start);
                    var newsymbol = null;

                    if ((typeof values[symbol]) !== 'undefined') {
                        newsymbol = unaccent(values[symbol]);
                    }
                }
                ret.push(line);
            });

            return ret;
        },

        tmpfilename: (suffix) => {
            var filename = 'nodefax-' + genpasswd() + '.' + suffix;
            return path.join(conf.TMPDIR, filename);
        },

        wordwrap: (str, intWidth, strBreak, cut) => {
            var m = ((arguments.length >= 2) ? arguments[1] : 75);
            var b = ((arguments.length >= 3) ? arguments[2] : '\n');
            var c = ((arguments.length >= 4) ? arguments[3] : false);
            var i, j, l, s, r;

            str += '';

            if (m < 1) {
                return str;
            }

            for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
                for (s=r[i], r[i]=''; s.length > m; r[i] += s.slice(0, j) + ((s=s.slice(j)).length ? b : '')) {
                    j = (c === 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1]) ?
                        m :
                        j.input.length - j[0].length || c === true && m ||
                        j.input.length + (j = s.slice(m).match(/^\S*/))[0].length;
                }
            }
            return r.join('\n');
        },

        rem_nl: (str) => {
            var str = str.replace(/\r/, '');
            return str.replace(/\n/, '');
        },

        phone_lookup: (_var) => {
            if (_var.match(/unknown/i) || _var.match(/unspecified/i) || !_var) {
                return null;
            }

            var nvar = module.exports.clean_faxnum(_var);
            var addressbook = new AFAddressBook();
            if(!addressbook.loadbyfaxnum(nvar)) {
                return null;
            } else {
                return AddressBook.get_company();
            }
        },

        faxinfo: (str_path) => {
            var values = {};
            var datas = child_process.execSync(conf.FAXINFO + ' -n' + str_path);
            
            datas.forEach( (value) => {
                var pos = value.indexOf(':');
                var left = value.substring(0, pos);
                var right = value.substring(pos + 1);
                values[left.trim()] = right.trim();
            });

            if (values['Sender'].match(/UNKNOWN/i) ||
                values['Sender'].match(/UNSPECIFIED/i) ||
                !module.exports.isset(values['Sender']) ||
                module.exports.empty(values['Sender'])) {
                    module.exports.faxlog(`faxinfo> XDEBUG CHECK sender '${values['Sender']}' in faxfile '${str_path}'`);
                    values['Sender'] = conf.RESERVED_FAX_NUM;
            }

            values['CallID' + conf.CALLIDn_CIDNumber] = module.exports.strip_sipinfo(values['CallID' + conf.CALLIDn_CIDNumber]);

            if (values['Sender'] && values['Pages'] && values['Received']) {
                return values;
            }

            return false;
        },

        system_v: (cmd) => {
            return child_process.execSync(cmd);
        },

        tiff2pdf: (tiff_file, pdf) => {
            var time_start = new Date().getTime();

            fs.chmodSync(tiff_file, 0o666);

            var faxinfo = module.exports.faxinfo(tiff_file);
            if (!faxinfo) {
                console.log('tiff2pdf: Found corrupted fax');
                module.exports.faxlog(`tiff2pdf> failed: ${tiff_file} corrupted`);
                process.exit(1);
            }

            if (conf.HYLATIFF2PS) {
                child_process.execSync(`(cd ${conf.HYLASPOOL}; bin/tiff2pdf -o ${pdf} ${tiff_file} 2>/dev/null)`);
            } else {
                child_process.execSync(`${conf.TIFFPS} ${tiff_file} | ${conf.GSR} -sOutputFile=${pdf} - -c quit 2>/dev/null`);
            }

            var time_end = new Date().getTime();

            fs.stat(tiff_file, (err, stats) => {
                if (!stats.isFile()) {
                    module.exports.faxlog('tiff2pdf> failed to create ' + pdf);
                } else {
                    module.exports.faxlog('tiff2pdf> successfully created ' + pdf);
                    fs.chmodSync(pdf, 0o666);
                }

                return Math.round(time_end - time_start);
            });
        }
    };

})();