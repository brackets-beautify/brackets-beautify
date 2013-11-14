/*jslint vars: true, plusplus: true, nomen: true, indent: 4, node: true */
(function () {
    'use strict';
    
    var editorconfig = require('./node_modules/editorconfig/editorconfig.js');
    
    /**
     * @private
     * Handler function for the editorconfig.parse command.
     * @param {string} filepath Path to file.
     * @param {object} options Unused for now...
     * @return {string} Path to file
     */
    function cmdParse(filepath, options) {
        return editorconfig.parse(filepath, options);
    }
    
     /**
     * Initializes the editorconfig domain.
     */
    function init(DomainManager) {
        if (!DomainManager.hasDomain('editorconfig')) {
            DomainManager.registerDomain('editorconfig', {major: 0, minor: 1});
        }
        DomainManager.registerCommand(
            // domain name
            'editorconfig',
            // command name
            'parse',
            // command handler function
            cmdParse,
            // asynchronous command?
            false,
            // description
            'Parse a string with .editorconfig formatting.',
            // parameters
            [
                {
                    name: "filepath",
                    type: "string",
                    description: "Path to file."
                },
                {
                    name: "options",
                    type: "object",
                    description: "Optional. Currently unused."
                }
            ],
            // return value
            [
                {
                    name: "format",
                    type: "object",
                    description: "Information about format."
                }
            ]
        );
    }
    
    exports.init = init;
}());