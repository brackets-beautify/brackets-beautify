/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4 */
/*global define, $, brackets, window, js_beautify, style_html, css_beautify */

define(function (require, exports, module) {

    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Commands = brackets.getModule('command/Commands'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Editor = brackets.getModule("editor/Editor").Editor,
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus = brackets.getModule("command/Menus"),
        COMMAND_SAVE_ID = "me.dpalmero.jsbeautify",
        COMMAND_ID = "me.drewh.jsbeautify";

    var js_beautify = require('beautify').js_beautify;
    var css_beautify = require('beautify-css').css_beautify;
    var html_beautify = require('beautify-html').html_beautify;

    var settings = JSON.parse(require("text!settings.json"));

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

    function format() {

        var indentChar, indentSize, formattedText;
        var unformattedText, isSelection = false;
        var useTabs = Editor.getUseTabChar();

        if (useTabs) {
            indentChar = '\t';
            indentSize = 1;
        } else {
            indentChar = ' ';
            indentSize = Editor.getSpaceUnits();
        }

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


    $(DocumentManager).on("documentSaved", function (event, doc) {
        if (localStorage.getItem("me.dpalmero.jsbeautify") == "true") {
            if ((event.timeStamp - localStorage.getItem("me.dpalmero.jsbeautify.timeStamp")) > 1000) {
                format();
                localStorage.setItem("me.dpalmero.jsbeautify.timeStamp", event.timeStamp);
                CommandManager.execute(Commands.FILE_SAVE, {
                    doc: doc
                });
            }
        }
    });

    CommandManager.register("Beautify", COMMAND_ID, format);
    CommandManager.register("Beautify on Save", COMMAND_SAVE_ID, function () {
        this.setChecked(!this.getChecked());
        localStorage.setItem("me.dpalmero.jsbeautify", this.getChecked());
        if (this.getChecked()) {
            localStorage.setItem("me.dpalmero.jsbeautify.timeStamp", 0);
        }
    });

    var automaton = CommandManager.get(COMMAND_SAVE_ID);
    automaton.setChecked(localStorage.getItem("me.dpalmero.jsbeautify"));
    localStorage.setItem("me.dpalmero.jsbeautify", true);

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
    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID, command);
    menu.addMenuItem(automaton);

});
