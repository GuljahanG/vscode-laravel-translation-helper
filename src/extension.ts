import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

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
            const rootDirectory = vscode.workspace.getConfiguration('laravelTranslatorHelper').get<string>('rootDirectory') || 'resources/lang';

            // Retrieve and process locale folders
            const locales = getLocaleFolders(path.join(vscode.workspace.rootPath!, rootDirectory));
            if (locales.length === 0) {
                vscode.window.showErrorMessage('No locale directories found.');
                return;
            }

            // Process each locale
            for (const locale of locales) {
                const localeDirPath = path.join(vscode.workspace.rootPath!, rootDirectory, locale);
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

function getKeyAndPath(filePath: string, text: string): { key: string, translationPath: string } {
    const parsedPath = path.parse(filePath);
    const key = generateKeyFromText(text);
    const translationPath = path.join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
    
    return { key, translationPath };
}

function generateKeyFromText(text: string): string {
    const latinText = transliterate(text);
    return latinText
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

function transliterate(text: string): string {
    const cyrillicToLatinMap: { [key: string]: string } = {
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

function translationKeyExists(filePath: string, key: string): boolean {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const regex = new RegExp(`['"]${key}['"]\\s*=>`);
        return regex.test(fileContent);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to read locale file: ' + (error as Error).message);
        return false;
    }
}

function updateLocaleFile(filePath: string, key: string, text: string) {
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
        } else {
            // The file has existing content
            const lines = textContent.split('\n');
            let lastLineIndex = lines.length - 1;

            // Remove trailing white spaces or new lines at the end of the document
            while (lastLineIndex >= 0 && !lines[lastLineIndex].trim()) {
                lastLineIndex--;
            }

            let insertPosition: vscode.Position | null = null;
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
            } else {
                // Handle case where the array was empty or newly created
                edit.insert(fileUri, new vscode.Position(lines.length, 0), `\n    ${newEntry},\n];\n`);
            }
        }

        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                vscode.window.showInformationMessage('Translation added to the locale file.');
            } else {
                vscode.window.showErrorMessage('Failed to update the locale file.');
            }
        });
    });
}
function getLocaleFolders(rootLangPath: string): string[] {
    try {
        return fs.readdirSync(rootLangPath).filter(file => {
            return fs.statSync(path.join(rootLangPath, file)).isDirectory();
        });
    } catch (error) {
        vscode.window.showErrorMessage('Failed to retrieve locale folders: ' + (error as Error).message);
        return [];
    }
}