import * as vscode from 'vscode';
import * as path from 'path';

// Function to get the file path based on configuration mode
export  async function getFilePath(): Promise<string> {
    const config = vscode.workspace.getConfiguration('laravelTranslatorHelper');
    const filePathMode = config.get<string>('filePathMode', 'auto');

    if (filePathMode === 'manual') {
        // Prompt the user for the file path
        const filePathInput = await vscode.window.showInputBox({
            prompt: 'Enter file path for localization (e.g., head/message.php)',
            placeHolder: 'e.g., head/message.php',
        });

        if (!filePathInput) {
            vscode.window.showErrorMessage('No file path entered, operation canceled.');
            return '';
        }

        return filePathInput;
    } else {
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
}