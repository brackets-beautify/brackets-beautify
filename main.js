/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, js_beautify, style_html, css_beautify */

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

		var indentChar, indentSize, formattedText;
		var unformattedText, isSelection = false;
		var useTabs = Editor.getUseTabChar();

		if (useTabs) {
			indentChar = '\t';
			indentSize = 1;
		} else {
			indentChar = ' ';
			indentSize = Editor.getIndentUnit();
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

		var fileType = EditorUtils.getModeFromFileExtension(DocumentManager.getCurrentDocument().url); // -- var fileType = editor.getModeForDocument()
		var cursor = editor.getCursorPos();
		var scroll = editor.getScrollPos();

		if (typeof fileType === "object" && fileType.json === true) {
			fileType = "javascript";
		}

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

		var doc = DocumentManager.getCurrentDocument();


		doc.batchOperation(function () {

			if (isSelection) {
				doc.replaceRange(formattedText, selection.start, selection.end);
			} else {
				doc.setText(formattedText);
			}

//			var newCursorPos = editor.getCursorPos();

			editor.setCursorPos(cursor);
			editor.setScrollPos(scroll.x, scroll.y);
		});
	}


	CommandManager.register("Beautify", COMMAND_ID, format);
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