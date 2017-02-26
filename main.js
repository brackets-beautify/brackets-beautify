define(function (require, exports, module) {
    'use strict';

    var PREFIX = 'bb.beautify';
    var COMMAND_ID = PREFIX + '.beautify';
    var COMMAND_SAVE_ID = PREFIX + '.autosave';
    var PREF_SAVE_ID = 'onSave';
    var PREF_DIALOG_ID = 'hideDialog';
    var PREF_BEAUTIFIERS_ID = 'beautifiers';
    var PREF_LANGUAGES_ID = 'languages';
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
    var LANGUAGE_MAPPING = {
        javascript: 'js',
        json: 'js',
        jsx: 'js',

        html: 'html',
        xml: 'html',
        svg: 'html',
        php: 'html',
        ejs: 'html',
        handlebars: 'html',
        vue: 'html',

        css: 'css',
        less: 'css',
        scss: 'css'
    };

    /* beautify preserve:start *//* eslint-disable no-multi-spaces */
    var CommandManager     = brackets.getModule('command/CommandManager');
    var Commands           = brackets.getModule('command/Commands');
    var Menus              = brackets.getModule('command/Menus');
    var DocumentManager    = brackets.getModule('document/DocumentManager');
    var Editor             = brackets.getModule('editor/Editor').Editor;
    var EditorManager      = brackets.getModule('editor/EditorManager');
    var FileSystem         = brackets.getModule('filesystem/FileSystem');
    var LanguageManager    = brackets.getModule('language/LanguageManager');
    var LiveDevelopment    = brackets.getModule('LiveDevelopment/LiveDevelopment');
    var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
    var ProjectManager     = brackets.getModule('project/ProjectManager');
    var Mustache           = brackets.getModule('thirdparty/mustache/mustache');
    var AppInit            = brackets.getModule('utils/AppInit');
    var ExtensionUtils     = brackets.getModule('utils/ExtensionUtils');
    var DefaultDialogs     = brackets.getModule('widgets/DefaultDialogs');
    var Dialogs            = brackets.getModule('widgets/Dialogs');
    /* eslint-enable no-multi-spaces *//* beautify preserve:end */

    var Strings = require('strings');
    var DialogContentTemplate = require('text!templates/dialog-content.html');
    var DialogContent = Mustache.render(DialogContentTemplate, {
        Strings: Strings
    });
    var beautifyWeb = {
        js: require('thirdparty/beautify').js_beautify,
        css: require('thirdparty/beautify-css').css_beautify,
        html: require('thirdparty/beautify-html').html_beautify
    };
    var externalBeautifier = require('external/beautify');
    var defaultOptions = JSON.parse(require('text!default.jsbeautifyrc'));
    var options;

    ExtensionUtils.loadStyleSheet(module, 'styles/styles.css');
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
        var document = DocumentManager.getCurrentDocument();
        var beautifiers = $.extend({}, LANGUAGE_MAPPING, prefs.get(PREF_LANGUAGES_ID));
        var beautifier = beautifiers[document.getLanguage().getId()];

        if (!beautifier && !autoSave) {
            var Dialog = Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, Strings.UNSUPPORTED_TITLE, DialogContent);
            Dialog.getPromise().done(function () {
                prefs.set(PREF_DIALOG_ID, Dialog.getElement().find('input').prop('checked'));
            });
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
            currentOptions.end_with_newline = false;
            unformattedText = editor.getSelectedText();
            range = editor.getSelection();

            /*
             * When we are only formatting a range, we still want to have it correctly indented with the flow.
             * The library has an option for that (indent_level), however that doesn't seem to work.
             * See open issue: https://github.com/beautify-web/js-beautify/issues/724).
             * As a temporary solution we are checking if the starting line of the selection has some unselected
             * indentation and if so extending the selection.
             */
            // currentOptions.indent_level = range.start.ch;
            var indentChars = document.getLine(range.start.line).substr(0, range.start.ch);
            if (indentChars.trim().length === 0) {
                range.start.ch = 0;
                unformattedText = indentChars + unformattedText;
            }
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

        if (beautifyWeb[beautifier]) {
            var formattedText = beautifyWeb[beautifier](unformattedText, currentOptions);
            if (formattedText !== unformattedText) {
                batchUpdate(formattedText, range);
            }
        } else {
            var externalBeautifierOptions = prefs.get(PREF_BEAUTIFIERS_ID)[beautifier];
            // eslint-disable-next-line no-shadow
            externalBeautifier.beautify(externalBeautifierOptions, unformattedText, function (err, formattedText) {
                if (err) {
                    console.error(err);
                } else if (formattedText !== unformattedText) {
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

    function loadOptions(optionsFile) {
        if (!optionsFile) {
            optionsFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + OPTIONS_FILE_NAME);
        }
        optionsFile.read(function (err, content) {
            if (!err && content) {
                try {
                    options = $.extend(true, {}, defaultOptions, JSON.parse(content));
                    return;
                } catch (error) {
                    console.error('Brackets Beautify - Error parsing options (' + optionsFile.fullPath + '). Using default.');
                }
            }
            options = defaultOptions;
        });
    }

    function loadOptionsOnChange(error, document) {
        if (document.file.fullPath === ProjectManager.getProjectRoot().fullPath + OPTIONS_FILE_NAME) {
            loadOptions(document.file);
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
    prefs.definePreference(PREF_DIALOG_ID, 'boolean', false, {
        name: Strings.PREF_DIALOG_NAME,
        description: Strings.PREF_DIALOG_DESC
    });
    prefs.definePreference(PREF_BEAUTIFIERS_ID, 'object', {}, {
        name: Strings.PREF_BEAUTIFIERS_NAME,
        description: Strings.PREF_BEAUTIFIERS_DESC,
        validator: function (value) {
            // Disallow overriding built-in beautifiers
            return !value.js && !value.html && !value.css;
        }
    });
    prefs.definePreference(PREF_LANGUAGES_ID, 'object', LANGUAGE_MAPPING, {
        name: Strings.PREF_LANGUAGES_NAME,
        description: Strings.PREF_LANGUAGES_DESC
    });

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

    // Add Toolbar Button
    $(document.createElement('a'))
        .attr('id', 'beautify-icon')
        .attr('href', '#')
        .attr('title', Strings.BEAUTIFY)
        .on('click', function () {
            format();
        })
        .appendTo($('#main-toolbar .buttons'));

    AppInit.appReady(function () {
        DocumentManager.on('documentSaved.beautify', onSave);
        DocumentManager.on('documentSaved.beautifyOptions', loadOptionsOnChange);
        DocumentManager.on('documentRefreshed.beautifyOptions', loadOptionsOnChange);
        ProjectManager.on('projectOpen.beautifyOptions', function () {
            loadOptions();
        });
        loadOptions();
    });
});
