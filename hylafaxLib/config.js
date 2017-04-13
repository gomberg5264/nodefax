var path = require('path');
var fs = require('fs');

module.exports = ( () => {

	// Pre Setting
	var INSTALLDIR = path.join(__dirname, '..');
	var BINARYDIR = '/usr/bin';
	var HYLAFAX_PREFIX = '/usr';
	var HYLASPOOL = '/var/spool/hylafax';
    var HTML2PS = '/usr/local/bin/html2ps';

    var PRINTCMD = '/usr/bin/lpr';
    var PRINTFAX2PS = '/usr/bin/fax2ps';
    var FAXRCVD_PRINT_PDF = false;

    var PRINTFAXCMD = (FAXRCVD_PRINT_PDF) ? PRINTCMD+' %s %s' : PRINTFAX2PS+' %s | '+PRINTCMD+' %s';
    var PRINTERNAME = '';

    var BARDECODE_BINARY = '/var/spool/hylafax/bin/bardecode';
    var OCR_BINARY = '/usr/local/bin/tesseract';

    var GS = path.join(BINARYDIR, 'gs');
    var PAPERSIZE = 'a4';

    var DPI = 92;
    var DPIS = 200;

    var NOTHUMB = 'images/nothumb.gif';

    return {
        INSTALLDIR: INSTALLDIR,
        BINARYDIR: BINARYDIR,
        COVERPAGE_FILE: 'cover.ps',
        HYLAFAX_PREFIX: HYLAFAX_PREFIX,
        HYLASPOOL: HYLASPOOL,
        HYLATIFF2PS: false,

        RESTRICTED_USER_MODE: false,
        INBOX_LIST_MODEM: false,
        FOCUS_ON_NEW_FAX: false,
        FOCUS_ON_NEW_FAX_POPUP: false,

        FROM_COMPANY: '',
        FROM_LOCATION: '',
        FROM_FAXNUMBER: '',
        FROM_VOICENUMBER: '',
        DEFAULT_TSI_ID: '',

        FAXMAILUSER: 'faxmail',

        ENABLE_DL_TIFF: false,
        SHOW_ALL_CONTACTS: true,
        NUM_PAGES_FOLLOW: 0,

        SENDFAX_USE_COVERPAGE: true,
        SENDFAX_REQUEUE_EMAIL: true,

        PAPERSIZE: PAPERSIZE,
        CPAGE_LINELEN: 80,

        ARCHIVEFAX2EMAIL: true,
        ARCHIVE_WIDE: true,

        PRINTFAXRCVD: false,
        PRINTERNAME: PRINTERNAME,

        PRINTCMD: PRINTCMD,
        PRINTFAX2PS: PRINTFAX2PS,
        PRINTFAXCMD: PRINTFAXCMD,
        PDFPRINTCMD: '/usr/bin/lpr',
        FAXRCVD_PRINT_PDF: FAXRCVD_PRINT_PDF,

        HTML2PS: HTML2PS,
        USE_HTML_COVERPAGE: fs.existsSync(HTML2PS),
        COVERPAGE_MATCH: 'XXXX-',

        // SMTP Setting
        USE_SMTPSERVER: false,
        SMTP_SERVER: 'localhost',
        SMTP_PORT: 25,
        SMTP_AUTH: false,
        SMTP_USERNAME: '',
        SMTP_PASSWORD: '',
        SMTP_LOCALHOST: 'localhost',

        NOTIFY_INCLUDE_PDF: false,
        NOTIFY_ON_SUCCESS: true,
        FAXRCVD_INCLUDE_THUMBNAIL: true,
        FAXRCVD_INCLUDE_PDF: true,
        ENABLE_DID_ROUTING: false,

        CALLIDn_CIDNumber: 1,
        CALLIDn_CIDName: 2,
        CALLIDn_DIDNum: 3,
        AUTOCONFDID: true,

        ALTERNATE_AUTH_ENABLE: false,
        ALTERNATE_AUTH_FALLBACK: true,
        ALTERNATE_AUTH_CLASS: 'PAMAuth',

        // Default Faxes view per page
        DEFAULT_FAXES_PER_PAGE_INBOX: 25,
        DEFAULT_FAXES_PER_PAGE_ARCHIVE: 30,

        // Barcode support
        ENABLE_BARDECODE_SUPPORT: false,
        BARDECODE_BINARY: BARDECODE_BINARY,
        BARDECODE_COMMAND: BARDECODE_BINARY + ' -t any -f %s',

        ENABLE_FAX_ANNOTATION: false,

        // OCR support
        ENABLE_OCR_SUPPORT: false,
        OCR_BINARY: OCR_BINARY,
        OCR_COMMAND: OCR_BINARY + ' %s %s -l %s',
        OCR_LANGUAGE: 'eng',

        // Email Coding
        EMAIL_ENCODING_TEXT: 'Base64Encoding',
        EMAIL_ENCODING_HTML: 'Base64Encoding',
        EMAIL_ENCODING_CHARSET: 'UTF-8',

        // Fax Date Format
        FAXCOVER_DATE_FORMAT: '%d.%m.%Y %H:%M',
        EMAIL_DATE_FORMAT: '%d.%m.%Y %H:%M',
        ARCHIVE_DATE_FORMAT: '%d.%m.%Y %H:%i',

        MAX_PASSWD_SIZE: 15,
        MIN_PASSWD_SIZE: 8,

        HAS_NEGATIVE_TIFF: false,

        ARCHIVE: path.join(INSTALLDIR, 'faxes', 'recvd'),
        ARCHIVE_SENT: path.join(INSTALLDIR, 'faxes', 'sent'),
        TMPDIR: path.join(INSTALLDIR, 'tmp'),
        PHONEBOOK: path.join(INSTALLDIR, 'pbook.phb'),
        FAXCOVER: path.join(INSTALLDIR, 'hylafaxLib', 'faxcover.js'),

        // tiff
        TIFFCP: path.join(BINARYDIR, 'tiffcp'),
        TIFFCPG4: path.join(BINARYDIR, 'tiffcp -c g4'),
        TIFFPS: path.join(BINARYDIR, 'tiff2ps -2ap'),
        TIFFSPLIT: path.join(BINARYDIR, 'tiffsplit'),
        TIFF_TO_G4: false,

        // imagemagick
        CONVERT: path.join(BINARYDIR, 'convert'),

        // netpbm
        PNMSCALE: path.join(BINARYDIR, 'pnmscale'),
        PNMDEPTH: path.join(BINARYDIR, 'pnmdepth'),
        PPMTOGIF: path.join(BINARYDIR, 'ppmtogif'),
        PNMQUANT: path.join(BINARYDIR, 'pnmquant'),

        // psresize
        PSRESIZE: path.join(BINARYDIR, 'psresize'),

        // ghostscript
        DPI: DPI,
        DPIS: DPIS,
        GS: GS,
        // tiff2pdf(faxrcvd)
        GSR: GS + ' -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -d Compatibility=1.4 -sPAPERSIZE=' + PAPERSIZE,
        // static preview (faxrcvd & rotate)
        GSN: GS + ' -q -dNOPAUSE -sPAPERSIZE=' + PAPERSIZE + ' -sDEVICE=pnm -r' + DPI + 'x' + DPI,
        // static preview (faxrcvd & rotate)
        GSN2: GS + ' -q -dNOPAUSE -sPAPERSIZE=' + PAPERSIZE + ' -sDEVICE=pnm',
        // convert2pdf (notify)
        GSTIFF: GS + ' -sDEVICE=tiffg4 -r' + DPIS + 'x' + DPIS + ' -dNOPAUSE -sPAPERSIZE=' + PAPERSIZE,
        // output, input
        GSCMD: GS + ' -dCompatibilityLevel=1.4 -dSAFER -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=%s -sPAPERSIZE=' + PAPERSIZE + ' -f %s >/dev/null 2>/dev/null',

        ANN_GRAVITY: 'southeast',

        // hylafax
        FAXINFO: path.join(HYLAFAX_PREFIX, 'sbin', 'faxinfo'),
        FAXSTAT: path.join(HYLAFAX_PREFIX, 'bin', 'faxstat -s'),
        FAXADDUSER: path.join(HYLAFAX_PREFIX, 'sbin', 'faxadduser'),
        FAXDELUSER: path.join(HYLAFAX_PREFIX, 'sbin', 'faxdeluser'),
        FAXGETTY: path.join(HYLAFAX_PREFIX, 'sbin', 'faxgetty'),
        SENDFAX: path.join(HYLAFAX_PREFIX, 'bin', 'sendfax'),
        FAXRM: path.join(HYLAFAX_PREFIX, 'bin', 'faxrm'),
        FAXALTER: path.join(HYLAFAX_PREFIX, 'bin', 'faxalter'),

        FAXSENDQ: path.join(HYLAFAX_PREFIX, 'bin', 'faxstat -s'),
        FAXDONEQ: path.join(HYLAFAX_PREFIX, 'bin', 'faxstat -d'),

        SUDO: path.join(BINARYDIR, 'sudo'),

        RESERVED_FAX_NUM: 'XXXXXXX',

        THUMBNAIL: 'thumb.gif',
        NOTHUMB: NOTHUMB,
        PDFNAME: 'fax.pdf',
        TIFFNAME: 'fax.tif',
        PREVIMG: 'prev',
        PREVIMGSFX: '.gif',

        CONTACTFILETYPES: 'vCard (.vcf)',
        SENDFAXFILETYPES: 'PostScript (.ps), PDF (.pdf), TIFF (.tif), Text (.txt)',

        // thumbnail
        PREV_TN: 80,

        // static preview
        PREV_SP: 750,

        NOTHUMBIMG: path.join(INSTALLDIR, NOTHUMB)
    };
})();