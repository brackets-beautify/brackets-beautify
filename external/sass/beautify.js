define(function (require, exports, module) {
    'use strict';

    var PREFIX = 'bb.beautify';
    var PATH_PREF = 'external.sass';

    /* beautify preserve:start */
    var DocumentManager    = brackets.getModule('document/DocumentManager');
    var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
    var ExtensionUtils     = brackets.getModule('utils/ExtensionUtils');
    var NodeDomain         = brackets.getModule('utils/NodeDomain');
    /* beautify preserve:end */

    var Strings = require('strings');

    var simpleDomain = new NodeDomain('sassformat', ExtensionUtils.getModulePath(module, 'domain'));
    var prefs = PreferencesManager.getExtensionPrefs(PREFIX);
    prefs.definePreference(PATH_PREF, 'string', '', {
        name: Strings.SASS_PREF_NAME,
        description: Strings.SASS_PREF_DESC
    });

    function beautify(unformattedText, options, callback) {
        var indentSize = options.indent_with_tabs ? 't' : options.indent_size;

        var path = prefs.get(PATH_PREF);

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
