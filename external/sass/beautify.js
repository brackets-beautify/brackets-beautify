define(function (require, exports, module) {
    'use strict';

    /* beautify preserve:start */
    var DocumentManager = brackets.getModule('document/DocumentManager');
    var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils');
    var NodeDomain      = brackets.getModule('utils/NodeDomain');
    /* beautify preserve:end */

    var Strings = require('strings');

    var simpleDomain = new NodeDomain('sassformat', ExtensionUtils.getModulePath(module, 'domain'));

    function beautify(unformattedText, options, beautifyPrefs, callback) {
        var indentSize = options.indent_with_tabs ? 't' : options.indent_size;

        var path = beautifyPrefs.get('external.sass');

        if (!path) {
            console.error(Strings.SASS_ERROR);
            callback(Strings.SASS_ERROR, unformattedText);
        }

        var fullPath = DocumentManager.getCurrentDocument().file.fullPath;
        simpleDomain.exec('parse', path, fullPath, indentSize).done(function (formattedText) {
            callback(null, formattedText);
        }).fail(function (err) {
            callback(err, unformattedText);
        });
    }

    module.exports = {
        beautify: beautify
    };
});
