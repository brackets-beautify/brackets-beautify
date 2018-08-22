/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *  Copied from https://github.com/Microsoft/vscode-html-languageservice/blob/master/build/update-jsbeautify.js
 *--------------------------------------------------------------------------------------------*/

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Return the version of an installed module.
 * @param {string} moduleName Name of a package in node_modules
 * @returns {Promise<string>} The installed version
 */
async function getVersion(moduleName) {
    const packageJSONPath = path.join(__dirname, '..', 'node_modules', moduleName, 'package.json');
    try {
        const content = await readFile(packageJSONPath);
        return JSON.parse(content).version;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Asynchronously reads the entire contents of a file.
 * @param {string} path A path to a file
 * @returns {Promise<string>} Promise of the content as a string
 */
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        })
    });
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 * @param {string} path A path to a file
 * @param {string} data The data to write
 * @returns {Promise<void>} Promise resolved after file is written
 */
function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

/**
 * Update (copy) a file from its module.
 * @param {string} moduleName Name of a package in node_modules
 * @param {string} repoPath Path of the source file in the module
 * @param {string} dest Path of the destination
 * @param {boolean} addHeader Flag to add a header with source and version
 */
async function update(moduleName, repoPath, dest, addHeader=false) {
    const contentPath = path.join(__dirname, '..', 'node_modules', moduleName, repoPath);
    console.log('Reading from ' + contentPath);
    const version = await getVersion(moduleName);
    let content;
    try {
        content = await readFile(contentPath);
    } catch(e) {
        console.error(e);
    }
    let header = '';
    if (addHeader) {
        header = `// copied from js-beautify/${repoPath}${os.EOL}`;
        if (version) {
            header += `// version: ${version}${os.EOL}`;
        }
    }
    try {
        await writeFile(dest, header + content);
        if (version) {
            console.log(`Updated ${path.basename(dest)} (${version})`);
        } else {
            console.log(`Updated ${path.basename(dest)}`);
        }
    } catch(e) {
        console.error(e);
    }
}

update('js-beautify', 'js/lib/beautify-css.js', './thirdparty/beautify-css.js', true);
update('js-beautify', 'js/lib/beautify-html.js', './thirdparty/beautify-html.js', true);
update('js-beautify', 'js/lib/beautify.js', './thirdparty/beautify.js', true);
update('js-beautify', 'LICENSE', './thirdparty/beautify-license');

