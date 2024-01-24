import * as vscode from "vscode";

// UTILS //
import { segregateImports } from "./utils/modifiers.utils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Register the command to segregate imports
	let disposable = vscode.commands.registerCommand(
		"importo.segregate-imports",

		() => {
			segregateImports();
		}
	);
	context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() {}
