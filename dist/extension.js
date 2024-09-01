/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 0:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(37));
const path = __importStar(__webpack_require__(38));
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.handleText', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (!text) {
                vscode.window.showErrorMessage('No text selected.');
                return;
            }
            // Prompt user for file path
            const filePathInput = await vscode.window.showInputBox({
                prompt: 'Enter file path for localization (e.g., head/message.php)',
                placeHolder: 'e.g., head/message.php',
            });
            if (!filePathInput) {
                vscode.window.showErrorMessage('No file path entered, operation canceled.');
                return;
            }
            // Extract key and translation path from the file path
            const { key, translationPath } = getKeyAndPath(filePathInput, text);
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
                    updateLocaleFile(filePath, key, text);
                }
            }
        }
    });
    context.subscriptions.push(disposable);
}
function getKeyAndPath(filePath, text) {
    const parsedPath = path.parse(filePath);
    const key = generateKeyFromText(text);
    const translationPath = path.join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
    return { key, translationPath };
}
function generateKeyFromText(text) {
    const latinText = transliterate(text);
    return latinText
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}
function transliterate(text) {
    const cyrillicToLatinMap = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya', 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh',
        'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e',
        'ю': 'yu', 'я': 'ya'
    };
    return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
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
function updateLocaleFile(filePath, key, text) {
    vscode.workspace.openTextDocument(filePath).then(document => {
        const edit = new vscode.WorkspaceEdit();
        const newEntry = `'${key}' => '${text}'`;
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

/***/ 1:
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),

/***/ 37:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 38:
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