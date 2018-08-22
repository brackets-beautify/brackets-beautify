/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *  Copied from https://github.com/Microsoft/vscode-html-languageservice/blob/master/build/update-jsbeautify.js
 *--------------------------------------------------------------------------------------------*/

'use strict';

var path = require('path');
var fs = require('fs');

function getVersion(moduleName) {
    var packageJSONPath = path.join(__dirname, '..', 'node_modules', moduleName, 'package.json');
    return readFile(packageJSONPath).then(function (content) {
        try {
            return JSON.parse(content).version;
        } catch (e) {
            return Promise.resolve(null);
        }
    });
}

function readFile(path) {
    return new Promise((s, e) => {
        fs.readFile(path, (err, res) => {
            if (err) {
                e(err);
            } else {
                s(res.toString());
            }
        })
    });

}

function update(moduleName, repoPath, dest, addHeader, patch) {
    var contentPath = path.join(__dirname, '..', 'node_modules', moduleName, repoPath);
    console.log('Reading from ' + contentPath);
    return readFile(contentPath).then(function (content) {
        return getVersion(moduleName).then(function (version) {
            let header = '';
            if (addHeader) {
                header = '// copied from js-beautify/' + repoPath + '\n';
                if (version) {
                    header += '// version: ' + version + '\n';
                }
            }
            try {
                if (patch) {
                    content = patch(content);
                }
                fs.writeFileSync(dest, header + content);
                if (version) {
                    console.log('Updated ' + path.basename(dest) + ' (' + version + ')');
                } else {
                    console.log('Updated ' + path.basename(dest));
                }
            } catch (e) {
                console.error(e);
            }
        });

    }, console.error);
}

update('js-beautify', 'js/lib/beautify-css.js', './thirdparty/beautify-css.js', true);
update('js-beautify', 'js/lib/beautify-html.js', './thirdparty/beautify-html.js', true);
update('js-beautify', 'js/lib/beautify-html.js', './thirdparty/beautify.js', true);
update('js-beautify', 'LICENSE', './thirdparty/beautify-license');

