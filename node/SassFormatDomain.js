(function () {

    'use strict';

    // "beautify.sassConvertPath": "/Users/drewh/.rbenv/shims/sass-convert"

    var exec = require('child_process').exec;

    function cmdFormat(sassPath, filePath, indentSize, callback) {
        console.log(filePath);
        exec(sassPath + ' --indent ' + indentSize + ' -F scss -T scss ' + filePath, function (err, out, stderr) {
            return callback(err, out, stderr);
        });
    }

    function init(DomainManager) {
        if (!DomainManager.hasDomain('sassformat')) {
            DomainManager.registerDomain('sassformat', {
                major: 0,
                minor: 1
            });
        }
        DomainManager.registerCommand(
            'sassformat',
            'parse',
            cmdFormat,
            true,
            'SASS format', [{
                name: "sassPath",
                type: "string",
                description: "Path to sass-convert program"
            }, {
                name: "filePath",
                type: "string",
                description: "Path to file."
            }, {
                name: "indentSize",
                type: "string",
                description: "Indention size or tab character"
            }], {}
        );
    }

    exports.init = init;
}());