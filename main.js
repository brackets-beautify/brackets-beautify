/*global define, $, brackets, window, style_html, localStorage, console, alert */

define(function (require, exports, module) {

    'use strict';

    /* Globals */
    var DEBUG_MODE,
        COMMAND_ID = 'me.drewh.jsbeautify',
        OLD_COMMAND_ID = 'beautify',
        COMMAND_SAVE_ID = COMMAND_ID + '.autosave',
        COMMAND_TIMESTAMP = COMMAND_ID + '-timeStamp',
        CONTEXTUAL_COMMAND_ID = COMMAND_ID + 'Contextual';

    var Menus = brackets.getModule('command/Menus'),
        AppInit = brackets.getModule('utils/AppInit'),
        Commands = brackets.getModule('command/Commands'),
        Editor = brackets.getModule('editor/Editor').Editor,
        NodeDomain = brackets.getModule('utils/NodeDomain'),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        NodeConnection = brackets.getModule('utils/NodeConnection'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        CommandManager = brackets.getModule('command/CommandManager'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');

    /* Formatters */
    var Strings = require('strings'),
        js_beautify = require('thirdparty/js-beautify/js/lib/beautify').js_beautify,
        css_beautify = require('thirdparty/js-beautify/js/lib/beautify-css').css_beautify,
        html_beautify = require('thirdparty/js-beautify/js/lib/beautify-html').html_beautify;

    /* Variables */
    var beautifyOnSave,
        settingsFileName = '.jsbeautifyrc',
        menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
        settings = JSON.parse(require('text!settings.json')),
        debugPreferences = PreferencesManager.getExtensionPrefs('debug'),
        beautifyPreferences = PreferencesManager.getExtensionPrefs(COMMAND_ID),
        oldBeautifyPreferences = PreferencesManager.getExtensionPrefs(OLD_COMMAND_ID),
        windowsCommand = {
            key: 'Ctrl-Shift-L',
            platform: 'win'
        },
        macCommand = {
            key: 'Cmd-Shift-L',
            platform: 'mac'
        },
        command = [windowsCommand, macCommand];

    // Brackets debug mode
    DEBUG_MODE = debugPreferences.get('showErrorsInStatusBar');

    beautifyOnSave = beautifyPreferences.get('on_save') || false;
    if (!beautifyOnSave) {
        beautifyPreferences.set('on_save', false);
        beautifyPreferences.save();
    }

    function __debug(msg, code) {
        if (DEBUG_MODE) {
            var m = '[brackets-beautify] :: ' + msg;
            if (typeof msg !== 'string') {
                m = msg;
            }
            if (code === 0) {
                console.log(m);
            } else {
                console.error(m);
            }
        }
    }

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
        var options = {
            indent_size: indentSize,
            indent_char: indentChar
        };
        var formattedText = html_beautify(unformattedText, $.extend(options, settings));
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
     *
     * @param {String} unformattedText
     * @param {String} indentChar
     * @param {String} indentSize
     */

    function _formatSASS(indentChar, indentSize, callback) {
        if (indentChar === '\t') {
            indentSize = 't';
        }
        var path = beautifyPreferences.get('sassConvertPath');

        if (!path) {
            // try old one
            console.log('Fallback to old preference');
            path = oldBeautifyPreferences.get('sassConvertPath');
        }

        if (!path) {
            __debug(Strings.SASS_ERROR, 0); // Don't error on this
        }

        var simpleDomain = new NodeDomain('sassformat', ExtensionUtils.getModulePath(module, 'node/SassFormatDomain'));
        var fullPath = DocumentManager.getCurrentDocument().file.fullPath;
        var parsePromise = simpleDomain.exec('parse', path, fullPath, indentSize);
        parsePromise.done(function (res) {
            return callback(null, res);
        });
        parsePromise.fail(function (err) {
            return callback(err);
        });
    }

    function batchUpdate(formattedText, isSelection) {
        var editor = EditorManager.getCurrentFullEditor();
        var cursor = editor.getCursorPos();
        var scroll = editor.getScrollPos();
        var doc = DocumentManager.getCurrentDocument();
        var selection = editor.getSelection();
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
     * Format
     */

    function format(autoSave) {
        var indentChar, indentSize, formattedText;
        var unformattedText, isSelection = false;
        var useTabs = Editor.getUseTabChar();

        __debug(settings, 0);
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

        var doc = DocumentManager.getCurrentDocument();
        var language = doc.getLanguage();
        var fileType = language._id;

        switch (fileType) {

        case 'javascript':
        case 'json':
            formattedText = _formatJavascript(unformattedText, indentChar, indentSize);
            batchUpdate(formattedText, isSelection);
            break;

        case 'html':
        case 'php':
        case 'xml':
        case 'ejs':
        case 'handlebars':
            formattedText = _formatHTML(unformattedText, indentChar, indentSize);
            batchUpdate(formattedText, isSelection);
            break;

        case 'css':
        case 'less':
            formattedText = _formatCSS(unformattedText, indentChar, indentSize);
            batchUpdate(formattedText, isSelection);
            break;

        case 'scss':

            _formatSASS(indentChar, indentSize, function (err, res) {
                if (err) {
                    console.log(err);
                    formattedText = _formatCSS(unformattedText, indentChar, indentSize);
                    batchUpdate(formattedText, isSelection);
                } else {
                    // SASS format only works on entire file for now
                    batchUpdate(res, false);
                }
            });

            break;

        default:
            if (!autoSave) {
                alert(Strings.FILE_ERROR);
            }
            return;
        }
    }


    function onSave(event, doc) {
        var currentTimestamp = Date.now();

        if (currentTimestamp === undefined || (currentTimestamp - localStorage.getItem(COMMAND_TIMESTAMP)) > 1000) {
            format(true);
            localStorage.setItem(COMMAND_TIMESTAMP, currentTimestamp);
            CommandManager.execute(Commands.FILE_SAVE, {
                doc: doc
            });
        }
    }


    function loadConfig() {
        var settingsFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + settingsFileName);
        settingsFile.read(function (err, content) {
            if (content) {
                try {
                    settings = JSON.parse(content);
                    __debug('settings loaded' + settings, 0);
                } catch (e) {
                    __debug('error parsing ' + settingsFile + '. Details: ' + e);
                    return;
                }
            }
        });
    }

    function toggle(command, fromCheckbox) {
        var newValue = (typeof fromCheckbox === 'undefined') ? beautifyOnSave : fromCheckbox;
        $(DocumentManager)[newValue ? 'on' : 'off']('documentSaved', onSave);
        command.setChecked(newValue);
        beautifyPreferences.set('on_save', newValue);
        beautifyPreferences.save();
    }

    /**
     * File menu
     */
    CommandManager.register('Beautify', COMMAND_ID, format);
    var commandOnSave = CommandManager.register(Strings.BEAUTIFY_ON_SAVE, COMMAND_SAVE_ID, function () {
        toggle(this, !this.getChecked());
        if (this.getChecked()) {
            localStorage.setItem(COMMAND_TIMESTAMP, 0);
        }
    });

    /**
     * Contextual menu
     */
    CommandManager.register('Beautify', CONTEXTUAL_COMMAND_ID, format);
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    contextMenu.addMenuItem(CONTEXTUAL_COMMAND_ID);

    toggle(commandOnSave);

    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID, command);
    menu.addMenuItem(COMMAND_SAVE_ID);

    AppInit.appReady(function () {

        $(DocumentManager).on('documentRefreshed.beautify', function (e, document) {
            if (document.file.fullPath === ProjectManager.getProjectRoot().fullPath + settingsFileName) {
                loadConfig();
            }
        });

        $(ProjectManager).on('projectOpen.beautify', function () {
            loadConfig();
        });

        loadConfig();

    });

});