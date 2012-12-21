/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Editor = brackets.getModule("editor/Editor").Editor,
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorUtils = brackets.getModule("editor/EditorUtils"),
        Menus = brackets.getModule("command/Menus"),
        COMMAND_ID = "me.drewh.jsbeautify";

    require('beautify');
    require('beautify-html');
    require('beautify-css');

    /**
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatJavascript(unformattedText, indentChar, indentSize) {

        var formattedText = js_beautify(unformattedText, {
            indent_size: indentSize,
            indent_char: indentChar,
            reserve_newlines: true,
            jslint_happy: true,
            keep_array_indentation: false,
            space_before_conditional: true
        });

        return formattedText;
    }


    /**
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatHTML(unformattedText, indentChar, indentSize) {

        var formattedText = style_html(unformattedText, {
            indent_size: indentSize,
            indent_char: indentChar
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

        var indentChar, formattedText;

        var useTabs = Editor.getUseTabChar();
        var indentSize = Editor.getTabSize();
        var indentUnit = Editor.getIndentUnit();

        if (useTabs) {
            indentChar = '\t';
        } else {
            indentChar = ' ';
            indentSize = indentUnit;
        }

        var unformattedText = DocumentManager.getCurrentDocument().getText();
        var editor = EditorManager.getCurrentFullEditor();
        var fileType = EditorUtils.getModeFromFileExtension(DocumentManager.getCurrentDocument().url); // -- var fileType = editor.getModeForDocument()
       
        var cursor = editor.getCursorPos();
        var scroll = editor.getScrollPos();

        if (fileType === "javascript") {

            formattedText = _formatJavascript(unformattedText, indentChar, indentSize);

        } else if (fileType === 'htmlmixed') {

            formattedText = _formatHTML(unformattedText, indentChar, indentSize);

        } else if (fileType === 'css' || fileType === 'less') {

            formattedText = _formatCSS(unformattedText, indentChar, indentSize);

        } else {
            alert('Could not determine file type');
            return;
        }

        DocumentManager.getCurrentDocument().setText(formattedText);
        var newCursorPos = editor.getCursorPos();

        editor.setCursorPos(cursor);
        editor.setScrollPos(scroll.x, scroll.y);
    }

    CommandManager.register("Beautify", COMMAND_ID, format);

    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    var windowsCommand = {
        key: "Ctrl-Shift-F",
        platform: "win"
    };

    var macCommand = {
        key: "Ctrl-Shift-F",
        platform: "mac"
    };

    var command = [];
    command.push(windowsCommand);
    command.push(macCommand);

    menu.addMenuItem(COMMAND_ID, command);
});
