import * as vscode from 'vscode';

export function getProxies(): string[] {
    const config = vscode.workspace.getConfiguration('laravelTranslatorHelper');
    return config.get<string[]>('proxies', []);
}