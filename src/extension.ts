import * as vscode from "vscode";
import {
	deleteCategoryComments,
	segregateImports,
} from "./utils/modifiers.utils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Now provide the implementation of the command with registerCommand
	let disposable = vscode.commands.registerCommand(
		"importo.segregate-imports",

		() => {
			const document = vscode.window.activeTextEditor?.document;
			const documentText = document?.getText();

			// Regular expression to find all imports
			const importRegex = /import[\s\S]*?['"].*?['"]/g;

			// Checks if the file has imports
			const imports = documentText?.match(importRegex) || [];

			// Delete imports to categorize them
			segregateImports(imports);
		}
	);
	context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() {}
