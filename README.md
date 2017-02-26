[![Brackets Beautify on npm](https://img.shields.io/npm/v/brackets-beautify.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/brackets-beautify)
# Brackets Beautify 2.x
[Brackets][Brackets] Extension that formats open HTML, CSS, and JavaScript files using [js-beautify][js-beautify] version [1.6.11][js-beautify version].

## Version Information
We are currently having [trouble](https://github.com/adobe/brackets/issues/12464) uploading the latest version to the Brackets Extension Registry.
The last version on the Brackets Extension Registry is [1.2.0](https://github.com/brackets-beautify/brackets-beautify/tree/v1.2.0).


## Installation
### Latest Release
To install the latest _release_ of this extension use the `Install from URL...` function of the Brackets [Extension Manager][Brackets Extension Manager].
The link can be found on our [Release-page][Beautify latest release].

### Latest Commit
To install the latest _commit_ of this extension use the built-in Brackets [Extension Manager][Brackets Extension Manager] which has a function to `Install from URL...` using this link:
```
https://github.com/brackets-beautify/brackets-beautify/archive/master.zip
```

### Brackets npm Registry
The latest _release_ of this extension is also available on the [Brackets npm Registry][Brackets npm Registry].

## Usage
Brackets Beautify can be run manually on the whole file or on a selection.
Use the Toolbar Button with the wand icon, the menu entry `Edit > Beautify`, the context-menu entry `Beautify`, or one of the keyboard shortcuts `Ctrl-Alt-B` (Windows/Linux), `Ctrl-Shift-L` (Windows), `Cmd-Shift-L` (Mac), or [define your own][Beautify User Key Map].


Alternatively it can be enabled to run automatically on save.
Use the menu entry `Edit > Beautify on Save` or the more [advanced settings][Beautify Beautify on Save] to activate.

## Configuration
### Beautifier Options
Brackets Beautify supports the same [options][js-beautify options] as [js-beautify][js-beautify] with the exception of indentation-based options (`indent_size`, `indent_char`, and `indent_with_tabs`) which are taken from the current settings in Brackets.
The options can be specified in a `.jsbeautifyrc` file on project level and will be merged with the default.
The default is defined in `default.jsbeautifyrc` and looks like this:
```json
{
    "js": {
        "eol": "\n",
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "space_after_anon_function": true,
        "brace_style": "collapse",
        "keep_array_indentation": true,
        "keep_function_indentation": false,
        "space_before_conditional": true,
        "break_chained_methods": false,
        "eval_code": false,
        "unescape_strings": false,
        "wrap_line_length": 0,
        "wrap_attributes": "auto",
        "end_with_newline": true,
        "comma_first": false
    },
    "css": {
        "eol": "\n",
        "end_with_newline": true,
        "selector_separator_newline": true,
        "newline_between_rules": true
    },
    "html": {
        "eol": "\n",
        "end_with_newline": true,
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "indent_inner_html": false,
        "brace_style": "collapse",
        "indent_scripts": "normal",
        "wrap_line_length": 0,
        "wrap_attributes": "auto"
    }
}
```

### File Options for Beautify on Save
Brackets Beautify leverages [Brackets preferences][Brackets preferences], which means that you can specify per project settings by defining a `.brackets.json` in the root directory of your project. With Brackets preferences you can even define per file settings, which is really handy when dealing with third party libraries or minified resources.

Brackets Beautify also support per language settings, which enables you to enable/disabled `Beautify on Save` for your documents using the Brackets language layer.

The sample `.brackets.json` below generally enables `Beautify on Save` and disables it for any JavaScript file in `thirdparty`, any JavaScript file whose filename contains `min` and any PHP file.
```json
{
    "bb.beautify.onSave": true,
    "path": {
        "thirdparty/**.js": {
            "bb.beautify.onSave": false
        },
        "**min**.js": {
            "bb.beautify.onSave": false
        }
    },
    "language": {
        "php": {
            "bb.beautify.onSave": false
        }
    }
}
```

### User Key Map for Beautify
Open the `keymap.json` with the menu entry `Debug > Open User Key Map` and add an _overrides_ entry.
For example:
```js
{
    "documentation": "https://github.com/adobe/brackets/wiki/User-Key-Bindings",
    "overrides": {
        "Ctrl-Alt-F": "bb.beautify.beautify"
    }
}
```

### Configure languages
Brackets Beautify comes with beautifiers for JavaScript, HTML and CSS:
```json
{
    "css": "css",
    "ejs": "html",
    "handlebars": "html",
    "html": "html",
    "javascript": "js",
    "json": "js",
    "jsx": "js",
    "less": "css",
    "php": "html",
    "scss": "css",
    "svg": "html",
    "vue": "html",
    "xml": "html"
}
```

You can add languages or change their assigned beautifiers by adding their ids to the `bb.beautify.languages` setting:
```json
{
    "bb.beautify.languages": {
        "<LANGUAGE_ID>": "<BEAUTIFIER_ID>"
    }
}
```

The language id for the current document can be found by using the following command in the Brackets DeveloperTools:
```js
brackets.getModule('document/DocumentManager').getCurrentDocument().getLanguage().getId();
```

The beautifier id has to be either one of the bundled beautifiers (`js`, `css`, or `html`) or one that was defined as [external formatter][Beautify External Formatters].

### External formatters
Additionally, external formatters can be added to Brackets Beautify by modifying the `bb.beautify.beautifiers` setting.
```json
{
    "bb.beautify.beautifiers": {
        "<BEAUTIFIER_ID>": {
            "<COMMAND>": "/path/to/file --with args"
        }
    },
    "bb.beautify.languages": {
        "<LANGUAGE_ID>": "<BEAUTIFIER_ID>"
    }
}
```
The key is a name that can be use to configure the language where this formatter should be used.
The `<COMMAND>` is executed on a shell and gets the filename as last command line argument.


## Issues
Brackets Beautify uses [js-beautify][js-beautify] to beautify files and is therefore limited to its capabilities.
For any issues concerning the actual formatting please refer to the [js-beautify issues][js-beautify issues].

## License
Brackets Beautify is licensed under the [MIT license][MIT]. [js-beautify][js-beautify] is also licensed under the MIT license.

[Brackets]: http://brackets.io
[Brackets Extension Manager]: https://github.com/adobe/brackets/wiki/Brackets-Extensions
[Brackets Extension Registry]: https://brackets-registry.aboutweb.com
[Brackets preferences]: https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences
[Brackets npm Registry]: https://github.com/zaggino/brackets-npm-registry
[Beautify User Key Map]: https://github.com/brackets-beautify/brackets-beautify#user-key-map-for-beautify
[Beautify Beautify on Save]: https://github.com/brackets-beautify/brackets-beautify#file-options-for-beautify-on-save
[Beautify External Formatters]: https://github.com/brackets-beautify/brackets-beautify#external-formatters
[Beautify latest release]: https://github.com/brackets-beautify/brackets-beautify/releases/latest
[js-beautify]: https://github.com/beautify-web/js-beautify
[js-beautify version]: https://github.com/beautify-web/js-beautify/blob/master/CHANGELOG.md#v1611
[js-beautify issues]: https://github.com/beautify-web/js-beautify/issues
[js-beautify options]: https://github.com/beautify-web/js-beautify#options
[MIT]: http://opensource.org/licenses/MIT
