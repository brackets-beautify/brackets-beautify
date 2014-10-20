brackets-beautify
=================

[Brackets](http://brackets.io/) Extension that formats open HTML, CSS, and JavaScript files using [js-beautify](https://github.com/einars/js-beautify).

Compatible with  Sprint 22 and above.

Installation
---
Search for "Beautify" in [Extension Manager](https://github.com/adobe/brackets/wiki/Brackets-Extensions), then click on `Install` for Beautify by Drew Hamlett.

### Alternative Install

Download zip and extract into arbitrary directory (or clone source files), then move the folder to the extensions folder (you can open this folder by clicking "Help > Show Extensions Folder" menu).

Usage
---

`Edit > Beautify` menu or `Cmd-Shift-L(Mac) / Ctrl-Shift-L(Win)` key.

SASS Formatting
---

You need to supply an absolute path to the sass-convert executble for SASS formatting to work.

+ Install [SASS Installation website](http://sass-lang.com/install)
+ Get absolute path to executable

On MacOSX you can go into terminal and type `which sass-convert`

Since I use rbenv for manageing Ruby versions it gave me this.
`/Users/drewh/.rbenv/shims/sass-convert`

If you use system Ruby, when you do `sudo gem install sass` your path will be something like `/usr/bin/sass-convert`

On Windows your path will be something similiar to this.
`C:\\Ruby193\\bin\\sass-convert.bat`

+ Now go open Brackets and go to `Debug > Open Preferences File`


It will look something like this.

```js
{
    "useTabChar": false,
    "tabSize": 2,
    "spaceUnits": 2,
    "closeBrackets": true,
    "showLineNumbers": true,
    "styleActiveLine": false,
    "wordWrap": false,
    "linting.enabled": true,
    "linting.collapsed": false,
    "quickview.enabled": true
}
```


Now add ```"beautify.sassConvertPath": "/Users/drewh/.rbenv/shims/sass-convert"``` at the bottom.  Change the path name to the path all the way to executable.  The upcoming version will use ```me.drewh.jsbeautify.sassConvertPath``` as the key.

You will now be able to format scss files.

For windows add  `"beautify.sassConvertPath": "C:\\Ruby193\\bin\\sass-convert.bat"`

Contributing
---

For any pull requesets dealing with the actual formatting or the source in beautify-css.js, beautify.js and beautify-html.js, please send to:

https://github.com/einars/js-beautify/issues






