/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 0:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(2);
const path = __webpack_require__(3);
const formatText_1 = __webpack_require__(30);
const filePathUtils_1 = __webpack_require__(31);
const translationService_1 = __webpack_require__(48);
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.handleText', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (!text) {
                vscode.window.showErrorMessage('No text selected.');
                return;
            }
            const filePathInput = yield (0, filePathUtils_1.getFilePath)();
            // Extract key and translation path from the file path
            const { key, translationPath } = yield getKeyAndPath(filePathInput, text);
            // Format the wrapped text
            const wrappedText = `{{ __('${translationPath}.${key}') }}`;
            editor.edit(editBuilder => {
                editBuilder.replace(selection, wrappedText);
            });
            // Hardcoded root directory
            const rootDirectory = vscode.workspace.getConfiguration('laravelTranslatorHelper').get('rootDirectory') || 'resources/lang';
            // Retrieve and process locale folders
            const locales = getLocaleFolders(path.join(vscode.workspace.rootPath, rootDirectory));
            if (locales.length === 0) {
                vscode.window.showErrorMessage('No locale directories found.');
                return;
            }
            // Process each locale
            for (const locale of locales) {
                const localeDirPath = path.join(vscode.workspace.rootPath, rootDirectory, locale);
                const targetDirPath = path.join(localeDirPath, path.dirname(filePathInput));
                const fileName = path.basename(filePathInput);
                const filePath = path.join(targetDirPath, fileName);
                // Create the directory if it does not exist
                if (!fs.existsSync(targetDirPath)) {
                    fs.mkdirSync(targetDirPath, { recursive: true });
                }
                // Create the file if it does not exist
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, `<?php\n\nreturn [\n];\n`);
                }
                // Update the locale file with the new key-value pair
                if (!translationKeyExists(filePath, key)) {
                    yield updateLocaleFile(filePath, key, text, locale);
                }
            }
        }
    }));
    context.subscriptions.push(disposable);
}
function getKeyAndPath(filePath, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedPath = path.parse(filePath);
        const key = yield generateKeyFromText(text);
        const translationPath = path.join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
        return { key, translationPath };
    });
}
function generateKeyFromText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('laravelTranslatorHelper');
        const caseFormat = config.get('caseFormat', 'snake_case'); // Default to snake_case if not set
        try {
            const translatedText = yield (0, translationService_1.translateText)(text, 'en'); //translate.translate(text, { from: 'ru', to: 'en', fetchOptions: { agent } });
            return (0, formatText_1.formatText)(translatedText, caseFormat);
        }
        catch (error) {
            console.error("Translation error: ", error);
            return text;
        }
    });
}
function translationKeyExists(filePath, key) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const regex = new RegExp(`['"]${key}['"]\\s*=>`);
        return regex.test(fileContent);
    }
    catch (error) {
        vscode.window.showErrorMessage('Failed to read locale file: ' + error.message);
        return false;
    }
}
function updateLocaleFile(filePath, key, text, locale) {
    return __awaiter(this, void 0, void 0, function* () {
        const translatedText = yield (0, translationService_1.translateText)(text, locale); //await fetchTranslation(text, 'en', locale); //await translate.translate(text, { to: locale });
        vscode.workspace.openTextDocument(filePath).then(document => {
            const edit = new vscode.WorkspaceEdit();
            const newEntry = `'${key}' => '${translatedText}'`;
            const fileUri = vscode.Uri.file(filePath);
            const textContent = document.getText();
            // Check if the file is new or empty
            const isFileNew = !textContent.trim() || textContent.includes('return [\n];');
            if (isFileNew) {
                // For a new file or an empty file, set up the array and add the entry
                edit.replace(fileUri, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount, 0)), `<?php\n\nreturn [\n    ${newEntry}\n];\n`);
            }
            else {
                // The file has existing content
                const lines = textContent.split('\n');
                let lastLineIndex = lines.length - 1;
                // Remove trailing white spaces or new lines at the end of the document
                while (lastLineIndex >= 0 && !lines[lastLineIndex].trim()) {
                    lastLineIndex--;
                }
                let insertPosition = null;
                let needsComma = false;
                // Find the position to insert the new entry
                for (let i = lastLineIndex; i >= 0; i--) {
                    const line = lines[i].trim();
                    if (line === '];') {
                        insertPosition = new vscode.Position(i, 0);
                        // Check if we need to add a comma
                        if (lines[i - 1] && !lines[i - 1].trim().endsWith(',')) {
                            needsComma = true;
                        }
                        break;
                    }
                }
                if (insertPosition) {
                    if (needsComma) {
                        // Add a comma before the new entry if needed
                        const previousLinePosition = new vscode.Position(insertPosition.line - 1, lines[insertPosition.line - 1].length);
                        edit.insert(fileUri, previousLinePosition, ',');
                    }
                    // Insert the new entry and maintain formatting
                    edit.insert(fileUri, insertPosition, `    ${newEntry}\n`);
                }
                else {
                    // Handle case where the array was empty or newly created
                    edit.insert(fileUri, new vscode.Position(lines.length, 0), `\n    ${newEntry},\n];\n`);
                }
            }
            vscode.workspace.applyEdit(edit).then(success => {
                if (success) {
                    vscode.window.showInformationMessage('Translation added to the locale file.');
                }
                else {
                    vscode.window.showErrorMessage('Failed to update the locale file.');
                }
            });
        });
    });
}
function getLocaleFolders(rootLangPath) {
    try {
        return fs.readdirSync(rootLangPath).filter(file => {
            return fs.statSync(path.join(rootLangPath, file)).isDirectory();
        });
    }
    catch (error) {
        vscode.window.showErrorMessage('Failed to retrieve locale folders: ' + error.message);
        return [];
    }
}


/***/ }),

/***/ 31:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFilePath = getFilePath;
const vscode = __webpack_require__(1);
const path = __webpack_require__(3);
// Function to get the file path based on configuration mode
function getFilePath() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('laravelTranslatorHelper');
        const filePathMode = config.get('filePathMode', 'auto');
        if (filePathMode === 'manual') {
            // Prompt the user for the file path
            const filePathInput = yield vscode.window.showInputBox({
                prompt: 'Enter file path for localization (e.g., head/message.php)',
                placeHolder: 'e.g., head/message.php',
            });
            if (!filePathInput) {
                vscode.window.showErrorMessage('No file path entered, operation canceled.');
                return '';
            }
            return filePathInput;
        }
        else {
            // Use the file path of the currently active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found, operation canceled.');
                return '';
            }
            const filePath = editor.document.uri.fsPath;
            const basePath = path.join(vscode.workspace.rootPath || '', 'resources', 'views') + path.sep;
            let relativePath = filePath.replace(basePath, '').replace(/\\/g, '/');
            if (relativePath.endsWith('.blade.php')) {
                relativePath = relativePath.slice(0, -'.blade.php'.length) + '.php';
            }
            return relativePath;
        }
    });
}


/***/ }),

/***/ 30:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatText = formatText;
function toCamelCase(text) {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => index === 0 ? match.toLowerCase() : match.toUpperCase())
        .replace(/\s+/g, ''); // Remove spaces after transforming to camelCase
}
function toSnakeCase(text) {
    return text.replace(/\s+/g, '_'); // Replace spaces with underscores
}
function formatText(text, format) {
    let formattedText = text.trim().toLowerCase();
    if (format === 'camelCase') {
        formattedText = toCamelCase(formattedText);
    }
    else if (format === 'snake_case') {
        formattedText = toSnakeCase(formattedText);
    }
    // Remove non-alphanumeric characters
    return formattedText.replace(/[^\w]/g, '');
}


/***/ }),

/***/ 48:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.translateText = translateText;
function translateText(text_1, targetLang_1) {
    return __awaiter(this, arguments, void 0, function* (text, targetLang, sourceLang = 'auto') {
        const url = 'https://translate.googleapis.com/translate_a/single?';
        const params = {
            client: 'at',
            dt: 't', //return sentences
            sl: 'auto', //from
            tl: targetLang, //to
            q: text
        };
        const queryString = new URLSearchParams(params).toString();
        try {
            const response = yield fetch(url + queryString, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const resultArrayBuffer = yield response.arrayBuffer();
            const decoder = new TextDecoder('utf-8');
            const resultText = decoder.decode(resultArrayBuffer);
            const result = JSON.parse(resultText);
            return result[0][0][0];
        }
        catch (error) {
            throw new Error('Error with translation request: ' + error);
        }
    });
}


/***/ }),

/***/ 1:
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),

/***/ 2:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 3:
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map