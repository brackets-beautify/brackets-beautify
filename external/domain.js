/* eslint-env node */
/* eslint-disable strict */

(function () {
    'use strict';

    var exec = require('child_process').exec;

    function beautify(options, filePath, callback) {
        exec(options.command + ' ' + filePath, function (error, stdout, stderr) {
            return callback(error, stdout);
        });
    }

    function init(DomainManager) {
        if (!DomainManager.hasDomain('externalBeautify')) {
            DomainManager.registerDomain('externalBeautify', {
                major: 0,
                minor: 1
            });
        }
        DomainManager.registerCommand('externalBeautify', 'beautify', beautify, true, 'beautify externally', [{
            name: 'options',
            type: 'object',
            description: 'Options object with path'
        }, {
            name: 'filePath',
            type: 'string',
            description: 'Path to file.'
        }], []);
    }

    exports.init = init;
}());
