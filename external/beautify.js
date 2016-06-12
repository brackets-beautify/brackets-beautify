define(function (require, exports, module) {
    'use strict';

    /* beautify preserve:start *//* eslint-disable no-multi-spaces */
    var DocumentManager    = brackets.getModule('document/DocumentManager');
    var ExtensionUtils     = brackets.getModule('utils/ExtensionUtils');
    var NodeDomain         = brackets.getModule('utils/NodeDomain');
    /* eslint-enable no-multi-spaces *//* beautify preserve:end */

    var domain = new NodeDomain('externalBeautify', ExtensionUtils.getModulePath(module, 'domain'));

    function beautify(options, unformattedText, callback) {
        var fullPath = DocumentManager.getCurrentDocument().file.fullPath;
        domain.exec('beautify', options, fullPath).done(function (formattedText) {
            callback(null, formattedText);
        }).fail(function (err) {
            callback(err, unformattedText);
        });
    }

    module.exports = {
        beautify: beautify
    };
});
