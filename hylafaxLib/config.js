var path = require('path');

module.exports = ( () => {
    return {
        INSTALLDIR:     path.join(__dirname, '..'),
        COVERPAGE_FILE: 'cover.ps'
    };
})();