define(function (require) {
    'use strict';

    var PREFIX = 'bb.beautify';
    var COMMAND_ID = PREFIX + '.beautify';
    var COMMAND_SAVE_ID = PREFIX + '.autosave';
    var PREF_SAVE_ID = 'onSave';
    var OPTIONS_FILE_NAME = '.jsbeautifyrc';
    var KEY_BINDINGS = [
        {
            key: 'Ctrl-Shift-L',
            platform: 'win'
        }, {
            key: 'Ctrl-Alt-B',
            platform: 'win'
        }, {
            key: 'Cmd-Shift-L',
            platform: 'mac'
        }, {
            key: 'Ctrl-Alt-B'
        }
    ];

    /* beautify preserve:start */
    var CommandManager     = brackets.getModule('command/CommandManager');
    var Commands           = brackets.getModule('command/Commands');
    var Menus              = brackets.getModule('command/Menus');
    var DocumentManager    = brackets.getModule('document/DocumentManager');
    var Editor             = brackets.getModule('editor/Editor').Editor;
    var EditorManager      = brackets.getModule('editor/EditorManager');
    var FileSystem         = brackets.getModule('filesystem/FileSystem');
    var FileSystemError    = brackets.getModule('filesystem/FileSystemError');
    var LanguageManager    = brackets.getModule('language/LanguageManager');
    var LiveDevelopment    = brackets.getModule('LiveDevelopment/LiveDevelopment');
    var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
    var ProjectManager     = brackets.getModule('project/ProjectManager');
    var AppInit            = brackets.getModule('utils/AppInit');
    var DefaultDialogs     = brackets.getModule('widgets/DefaultDialogs');
    var Dialogs            = brackets.getModule('widgets/Dialogs');
    /* beautify preserve:end */

    var Strings = require('strings');
    var beautifiers = {
        js: require('thirdparty/beautify').js_beautify,
        css: require('thirdparty/beautify-css').css_beautify,
        html: require('thirdparty/beautify-html').html_beautify,
        sass: require('external/sass/beautify').beautify
    };
    var defaultOptions = JSON.parse(require('text!default.jsbeautifyrc'));
    var options;

    var prefs = PreferencesManager.getExtensionPrefs(PREFIX);

    function batchUpdate(formattedText, range) {
        var editor = EditorManager.getCurrentFullEditor();
        var cursorPos = editor.getCursorPos();
        var scrollPos = editor.getScrollPos();
        var document = DocumentManager.getCurrentDocument();
        document.batchOperation(function () {
            if (range) {
                document.replaceRange(formattedText, range.start, range.end);
            } else {
                document.setText(formattedText);
            }
            editor.setCursorPos(cursorPos);
            editor.setScrollPos(scrollPos.x, scrollPos.y);
        });
    }

    function format(autoSave) {
        var beautifier;
        var externalBeautifier;
        var document = DocumentManager.getCurrentDocument();
        switch (document.getLanguage().getId()) {
            case 'javascript':
            case 'json':
                beautifier = 'js';
                break;
            case 'html':
            case 'xml':
            case 'svg':
            case 'php':
            case 'ejs':
            case 'handlebars':
                beautifier = 'html';
                break;
            case 'css':
            case 'less':
                beautifier = 'css';
                break;
            case 'scss':
                beautifier = 'sass';
                externalBeautifier = true;
                break;
            default:
                if (!autoSave) {
                    Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, Strings.UNSUPPORTED_TITLE, Strings.UNSUPPORTED_MESSAGE);
                }
                return;
        }

        var unformattedText;
        var editor = EditorManager.getCurrentFullEditor();
        var currentOptions = $.extend({}, options[beautifier] || options);
        if (Editor.getUseTabChar()) {
            currentOptions.indent_with_tabs = true;
        } else {
            currentOptions.indent_size = Editor.getSpaceUnits();
            currentOptions.indent_char = ' ';
        }
        var range;
        if (editor.hasSelection()) {
            currentOptions.indentation_level = editor.getSelection().start.ch;
            currentOptions.end_with_newline = false;
            unformattedText = editor.getSelectedText();
            range = editor.getSelection();
        } else {
            unformattedText = document.getText();
            /*
             * If the current document is html and is currently used in LiveDevelopment, we must not change the html tag
             * as that causes the DOM in the browser to duplicate (see https://github.com/adobe/brackets/issues/10634).
             * To prevent that, we select the content inside <html> if we can find one and pretend a selection for the
             * formatting and replacing.
             * NOTE: Currently it is only checked if LiveDevelopment is active in general as I don't know how to check
             * for a specific file (see https://groups.google.com/forum/#!topic/brackets-dev/9wEtqG684cI).
             */
            if (document.getLanguage().getId() === 'html' && LiveDevelopment.status === LiveDevelopment.STATUS_ACTIVE) {
                // Regex to match everything inside <html> beginning by the first tag and ending at the last
                var match = /((?:.|\n)*<html[^>]*>\s*)((?:.|\n)*?)(\s*<\/html>)/gm.exec(unformattedText);
                if (match) {
                    unformattedText = match[2];
                    range = {
                        start: {
                            line: match[1].split('\n').length - 1,
                            ch: match[1].length - match[1].lastIndexOf('\n') - 1
                        },
                        end: {
                            line: (match[1] + match[2]).split('\n').length - 1,
                            ch: (match[1] + match[2]).length - (match[1] + match[2]).lastIndexOf('\n') - 1
                        }
                    };
                    currentOptions.end_with_newline = false;
                }
            }
        }
        if (!externalBeautifier) {
            var formattedText = beautifiers[beautifier](unformattedText, currentOptions);
            if (formattedText !== unformattedText) {
                batchUpdate(formattedText, range);
            }
        } else {
            beautifiers[beautifier](unformattedText, currentOptions, function (formattedText) {
                if (formattedText !== unformattedText) {
                    batchUpdate(formattedText, range);
                }
            });
        }
    }

    function onSave(event, doc) {
        if (doc.__beautifySaving) {
            return;
        }
        var context = PreferencesManager._buildContext(doc.file.fullPath, doc.getLanguage().getId());
        if (prefs.get(PREF_SAVE_ID, context)) {
            doc.addRef();
            doc.__beautifySaving = true;
            format(true);
            setTimeout(function () {
                CommandManager.execute(Commands.FILE_SAVE, {
                    doc: doc
                }).always(function () {
                    delete doc.__beautifySaving;
                    doc.releaseRef();
                });
            });
        }
    }

    function loadConfig(optionsFile) {
        if (!optionsFile) {
            optionsFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + OPTIONS_FILE_NAME);
        }
        optionsFile.read(function (err, content) {
            if (err === FileSystemError.NOT_FOUND) {
                return;
            }
            try {
                options = $.extend(true, {}, defaultOptions, JSON.parse(content));
            } catch (e) {
                console.error('Brackets Beautify - Error parsing options (' + optionsFile.fullPath + '). Using default.');
                options = defaultOptions;
            }
        });
    }

    function loadConfigOnChange(e, document) {
        if (document.file.fullPath === ProjectManager.getProjectRoot().fullPath + OPTIONS_FILE_NAME) {
            loadConfig(document.file);
        }
    }

    function changePref() {
        CommandManager.get(COMMAND_SAVE_ID).setChecked(prefs.get(PREF_SAVE_ID));
    }

    function executeCommand() {
        CommandManager.get(COMMAND_SAVE_ID).setChecked(!CommandManager.get(COMMAND_SAVE_ID).getChecked());
        prefs.set(PREF_SAVE_ID, CommandManager.get(COMMAND_SAVE_ID).getChecked());
    }

    prefs.definePreference(PREF_SAVE_ID, 'boolean', false, {
        name: Strings.BEAUTIFY_ON_SAVE,
        description: Strings.BEAUTIFY_ON_SAVE_DESC
    }).on('change', changePref);

    CommandManager.register(Strings.BEAUTIFY, COMMAND_ID, format);
    CommandManager.register(Strings.BEAUTIFY_ON_SAVE, COMMAND_SAVE_ID, executeCommand);

    var editMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    editMenu.addMenuDivider();
    editMenu.addMenuItem(COMMAND_ID, KEY_BINDINGS);
    editMenu.addMenuItem(COMMAND_SAVE_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(COMMAND_ID);

    var jsonLanguage = LanguageManager.getLanguage('json');
    jsonLanguage.addFileExtension(OPTIONS_FILE_NAME);
    jsonLanguage.addFileName(OPTIONS_FILE_NAME);

    AppInit.appReady(function () {
        DocumentManager.on('documentSaved.beautify', onSave);
        DocumentManager.on('documentSaved.beautifyOptions', loadConfigOnChange);
        DocumentManager.on('documentRefreshed.beautifyOptions', loadConfigOnChange);
        ProjectManager.on('projectOpen.beautifyOptions', function () {
            loadConfig();
        });
        loadConfig();
    });
});
