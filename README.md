# Brackets Beautify
[Brackets][Brackets] Extension that formats open HTML, CSS, and JavaScript files using [js-beautify][js-beautify] version [1.5.10][js-beautify version].

## Installation
### Latest Release
To install the latest _release_ of this extension use the built-in Brackets [Extension Manager][Brackets Extension Manager] which downloads the extension from the [extension registry][Brackets Extension Registry].

### Latest Commit
To install the latest _commit_ of this extension use the built-in Brackets [Extension Manager][Brackets Extension Manager] which has a function to `Install from URL...` using this link:
```
https://github.com/brackets-beautify/brackets-beautify/archive/master.zip
```

## Usage
Brackets Beautify can be run manually on the whole file or on a selection.
Use the menu entry `Edit > Beautify`, the context-menu entry `Beautify`, or one of the keyboard shortcuts `Ctrl-Alt-B` (Windows/Linux), `Ctrl-Shift-L` (Windows), `Cmd-Shift-L` (Mac), or [define your own][Beautify User Key Map].


Alternatively it can be enabled to run automatically on save.
Use the menu entry `Edit > Beautify on Save` or the more [advanced settings][Beautify Beautify on Save] to activate.

### Configuration
#### Beautifier Options
Brackets Beautify supports the same [options][js-beautify options] as [js-beautify][js-beautify] with the exception of indentation-based options (`indent_size`, `indent_char`, and `indent_with_tabs`) which are taken from the current settings in Brackets.
The options can be specified in a `.jsbeautifyrc` file on project level and will be merged with the default.
The default is defined in `default.jsbeautifyrc` and looks like this:
```json
{
    "js": {
        "eol": "\n",
        "indent_level": 0,
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
        "end_with_newline": true
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

#### File Options for Beautify on Save
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

#### User Key Map for Beautify
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

## External formatters
### SASS
You need to supply an absolute path to the `sass-convert` executable for SASS formatting to work.

- Install [SASS][SASS Install]
- Get the absolute path to the executable  
  Some example paths:
  - On MacOSX  
    Using *rbenv*: `/Users/<USER>/.rbenv/shims/sass-convert`  
    Using system Ruby (`sudo gem install sass`): `/usr/bin/sass-convert`
  - On Windows: `C:\\Ruby193\\bin\\sass-convert.bat`
- Open the Brackets settings file and set the entry `bb.beautify.external.sass` to the path value.


## Issues
Brackets Beautify uses [js-beautify][js-beautify] to beautify files and is therefore limited to its capabilities.
For any issues concerning the actual formatting please refer to the [js-beautify issues][js-beautify issues].

## License
Brackets Beautify is licensed under the [MIT license][MIT]. [js-beautify][js-beautify] is also licensed under the MIT license.

[Brackets]: http://brackets.io
[Brackets Extension Manager]: https://github.com/adobe/brackets/wiki/Brackets-Extensions
[Brackets Extension Registry]: https://brackets-registry.aboutweb.com
[Brackets preferences]: https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences
[Beautify User Key Map]: https://github.com/brackets-beautify/brackets-beautify#user-key-map-for-beautify
[Beautify Beautify on Save]: https://github.com/brackets-beautify/brackets-beautify#file-options-for-beautify-on-save
[js-beautify]: https://github.com/beautify-web/js-beautify
[js-beautify version]: https://github.com/beautify-web/js-beautify/blob/master/CHANGELOG.md#v1510
[js-beautify issues]: https://github.com/beautify-web/js-beautify/issues
[js-beautify options]: https://github.com/beautify-web/js-beautify#options
[SASS Install]: http://sass-lang.com/install
[MIT]: http://opensource.org/licenses/MIT
