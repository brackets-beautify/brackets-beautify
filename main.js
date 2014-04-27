/*global define, $, brackets, window, js_beautify, style_html, css_beautify, localStorage */

define(function (require, exports, module) {

    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Commands = brackets.getModule('command/Commands'),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Editor = brackets.getModule("editor/Editor").Editor,
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        Menus = brackets.getModule("command/Menus"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        COMMAND_TIMESTAMP = "me.drewh.jsbeautify.timeStamp",
        COMMAND_SAVE_ID = "me.drewh.jsbeautify-autosave",
        COMMAND_ID = "me.drewh.jsbeautify",
        CONTEXTUAL_COMMAND_ID = "me.drewh.jsbeautifyContextual";


    var js_beautify = require('thirdparty/js-beautify/js/lib/beautify').js_beautify;
    var css_beautify = require('thirdparty/js-beautify/js/lib/beautify-css').css_beautify;
    var html_beautify = require('thirdparty/js-beautify/js/lib/beautify-html').html_beautify;

    var settings = JSON.parse(require("text!settings.json"));
    var settingsFileName = '.jsbeautifyrc';

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

    function format(autoSave) {

        var indentChar, indentSize, formattedText;
        var unformattedText, isSelection = false;
        var useTabs = Editor.getUseTabChar();

        console.log(settings);
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
            if (!autoSave) alert('Could not determine file type');
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


    function onSave(event, doc) {
        if ((event.timeStamp - localStorage.getItem(COMMAND_TIMESTAMP)) > 1000) {
            format(true);
            localStorage.setItem(COMMAND_TIMESTAMP, event.timeStamp);
            CommandManager.execute(Commands.FILE_SAVE, {
                doc: doc
            });
        }
    }

    function loadConfig() {
        var settingsFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + settingsFileName);
        settingsFile.read(function (err, content) {
            try {
                settings = JSON.parse(content);
                console.log('settings loaded' + settings);
            } catch (e) {
                console.error("Beautify: error parsing " + settingsFile + ". Details: " + e);
                return;
            }
        });
    }

    function toggle(command, fromCheckbox) {
        var newValue = (typeof fromCheckbox === "undefined") ? enabled : fromCheckbox;
        $(DocumentManager)[newValue ? 'on' : 'off']('documentSaved', onSave);
        preferences.setValue('enabled', newValue);
        command.setChecked(newValue);
    }

    var preferences = PreferencesManager.getPreferenceStorage(COMMAND_SAVE_ID, {
        enabled: false
    });

    var enabled = preferences.getValue('enabled');

    /**
     * File menu
     */


    CommandManager.register("Beautify", COMMAND_ID, format);
    var commandOnSave = CommandManager.register("Beautify on Save", COMMAND_SAVE_ID, function () {
        toggle(this, !this.getChecked());
        if (this.getChecked()) localStorage.setItem(COMMAND_TIMESTAMP, 0);
    });

    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

    var windowsCommand = {
        key: "Ctrl-Shift-L",
        platform: "win"
    };
    var macCommand = {
        key: "Cmd-Shift-L",
        platform: "mac"
    };

    var command = [windowsCommand, macCommand];

    toggle(commandOnSave);

    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID, command);
    menu.addMenuItem(COMMAND_SAVE_ID);

    AppInit.appReady(function () {

        $(DocumentManager).on("documentRefreshed.beautify", function (e, document) {
            if (document.file.fullPath ===
                ProjectManager.getProjectRoot().fullPath + settingsFileName) {
                loadConfig();
            }
        });

        $(ProjectManager).on("projectOpen.beautify", function () {
            loadConfig();
        });

        loadConfig();
    });

    /**
     * Contextual menu
     */

    CommandManager.register("Beautify", CONTEXTUAL_COMMAND_ID, format);
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    contextMenu.addMenuItem(CONTEXTUAL_COMMAND_ID);

});