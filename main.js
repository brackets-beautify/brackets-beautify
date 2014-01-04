/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4 */
/*global define, $, brackets, window, js_beautify, style_html, css_beautify */

define(function (require, exports, module) {

    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Editor = brackets.getModule("editor/Editor").Editor,
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus = brackets.getModule("command/Menus"),
        AppInit = brackets.getModule("utils/AppInit"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        COMMAND_ID = "me.drewh.jsbeautify";

    var js_beautify = require('beautify');
    var css_beautify = require('beautify-css').css_beautify;
    var html_beautify = require('beautify-html').html_beautify;

    var settings = JSON.parse(require("text!settings.json"));

    var nodeConnection  = new NodeConnection();

    /**
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatJavascript(unformattedText, indentChar, indentSize) {

        var options = {
            indent_size: indentSize,
            indent_char: indentChar
        };

        var formattedText = js_beautify(unformattedText, $.extend(options, settings));

        return formattedText;
    }


    /**
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatHTML(unformattedText, indentChar, indentSize) {

        var formattedText = html_beautify(unformattedText, {
            indent_size: indentSize,
            indent_char: indentChar,
            max_char: 0,
            unformatted: []
        });

        return formattedText;
    }

    /**
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatCSS(unformattedText, indentChar, indentSize) {

        var formattedText = css_beautify(unformattedText, {
            indent_size: indentSize,
            indent_char: indentChar
        });

        return formattedText;
    }

    /**
     * Format
     */

    function format(indentChar, indentSize) {

        var formattedText;
        var unformattedText, isSelection = false;
        var useTabs = Editor.getUseTabChar();

        var editor = EditorManager.getCurrentFullEditor();
        var selectedText = editor.getSelectedText();

        var selection = editor.getSelection();

        if (selectedText.length > 0) {
            isSelection = true;
            unformattedText = selectedText;
        } else {
            unformattedText = DocumentManager.getCurrentDocument().getText();
        }

        var cursor = editor.getCursorPos();
        var scroll = editor.getScrollPos();
        var doc = DocumentManager.getCurrentDocument();

        var language = doc.getLanguage();
        var fileType = language._id;

        switch (fileType) {

        case 'javascript':
        case 'json':
            formattedText = _formatJavascript(unformattedText, indentChar, indentSize);
            break;

        case 'html':
        case 'php':
        case 'xml':
        case 'ejs':
            formattedText = _formatHTML(unformattedText, indentChar, indentSize);
            break;

        case 'css':
        case 'less':
        case 'scss':
            formattedText = _formatCSS(unformattedText, indentChar, indentSize);
            break;

        default:
            alert('Could not determine file type');
            return;
        }

        doc.batchOperation(function () {

            if (settings.git_happy) {
                formattedText += '\n';
            }

            if (isSelection) {
                doc.replaceRange(formattedText, selection.start, selection.end);
            } else {
                doc.setText(formattedText);
            }

            editor.setCursorPos(cursor);
            editor.setScrollPos(scroll.x, scroll.y);
        });
    }
    
    /**
     * Prepare format
     */

    function prepareFormat() {
        var fullPath = DocumentManager.getCurrentDocument().file.fullPath;
        var parsePromise = nodeConnection.domains.editorconfig.parse(fullPath);

        parsePromise.done(function (res) {

            var indentChar, indentSize;

            switch (res.indent_style) {

            case 'space':
                indentChar = ' ';
                break;
    
            case 'tab':
                indentChar = '\t';
                break;

            default:
                if (Editor.getUseTabChar()) {
                    indentChar = '\t';
                    indentSize = 1;
                } else {
                    indentChar = ' ';
                    indentSize = Editor.getSpaceUnits();
                }
                return;
            }

            if (indentChar === '\t') {
                indentSize = res.tab_width || 1;
            } else {
                indentSize = res.indent_size || Editor.getSpaceUnits();
            }

            format(indentChar, indentSize);
        });
    }

        
    /**
     * Create NodeConnection
     */
    
    AppInit.appReady(function () {
        nodeConnection.connect(true).done(function () {
            var path = ExtensionUtils.getModulePath(module, "node/EditorConfigDomain");
            nodeConnection.loadDomains([path], true).done(function () {

                CommandManager.register("Beautify", COMMAND_ID, prepareFormat);
                var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
            
                var windowsCommand = {
                    key: "Ctrl-Alt-L",
                    platform: "win"
                };
            
                var macCommand = {
                    key: "Cmd-Alt-L",
                    platform: "mac"
                };
            
                var command = [windowsCommand, macCommand];
                menu.addMenuItem(COMMAND_ID, command);

            });
        });
    });
});
