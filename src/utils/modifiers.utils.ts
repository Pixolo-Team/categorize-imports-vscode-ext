import * as vscode from "vscode";

// UTILS //
import { categorizeImports, getImports } from "./helpers.utils";

// CONSTANTS //
import {
	importCategories,
	importCategoriesWithVariations,
} from "../infrastructure/constants";

/** This function deletes previous comments and empty lines and adds segregated imports */
export const segregateImports = async (): Promise<void> => {
	// Get the current document
	const document = vscode.window.activeTextEditor?.document;
	// Get the text of the current document
	const documentText = document?.getText();

	// Get all imports
	const imports = getImports(documentText ?? "");

	// This removes the lines with comments of the format // CATEGORY //
	const deleteCommentsResult = await deleteCategoryComments();

	// If the comments are deleted, delete the import lines
	if (deleteCommentsResult.success) {
		const deleteImportsResult = await deleteImportLines(imports);

		// If the import lines are deleted, display the categorized imports
		if (deleteImportsResult.success) {
			// Categorize the imports
			const categorizedImports = categorizeImports(imports);
			// Display categorized imports
			const displayCategorizedImportsResult = await displayCategorizedImports(
				categorizedImports,
				deleteImportsResult.startOffset ?? 0
			);

			// If the categorized imports are displayed, remove empty lines after the last import
			if (displayCategorizedImportsResult.status) {
				// Remove empty lines after the last import
				removeEmptyLinesAfterPosition(
					displayCategorizedImportsResult.lastImportText ?? ""
				);
			}
		}
	}
};

/** To delete the import lines */
export const deleteImportLines = (
	imports: string[]
): Promise<{ success: boolean; startOffset?: number }> => {
	return new Promise((resolve) => {
		// Access the active text editor
		const activeEditor = vscode.window.activeTextEditor;

		// Check if there is an active text editor
		if (activeEditor) {
			// Initialize startOffset to -1 (to find the start of imports)
			let startOffset = -1;

			// Use the edit method to modify the document
			activeEditor
				.edit((textEditor) => {
					// For loop on imports (array of strings)
					for (const searchString of imports) {
						// Find the startOffset (start of imports)
						const currentOffset = activeEditor.document
							.getText()
							.indexOf(searchString);
						if (
							startOffset === -1 ||
							(currentOffset !== -1 && currentOffset < startOffset)
						) {
							startOffset = currentOffset;
						}
						if (currentOffset !== -1) {
							// Find end offset of a search string
							const endOffset = currentOffset + searchString.length;
							// Find start position of imports
							const startPosition = activeEditor.document.positionAt(currentOffset);
							// Find end position of imports
							const endPosition = activeEditor.document.positionAt(endOffset);

							// Loop from start line to end line of imports
							for (
								let lineNumber = startPosition.line;
								lineNumber <= endPosition.line;
								lineNumber++
							) {
								// Create line object for each line and delete it
								const lineObject = activeEditor.document.lineAt(lineNumber);
								const lineRange = lineObject.rangeIncludingLineBreak;

								// Delete text of Line Range
								textEditor.delete(lineRange);
							}
						}
					}
				})
				.then(() => {
					// Resolve the promise with the deletion result and start offset
					resolve({ success: true, startOffset });
				});
		} else {
			// If there is no active text editor, resolve the promise with false
			resolve({ success: false });
		}
	});
};

/** To delete the correct import comments ( // CATEGORY // format ) */
export const deleteCategoryComments = (): Promise<{ success: boolean }> => {
	return new Promise((resolve) => {
		// Access the active text editor
		const activeEditor = vscode.window.activeTextEditor;

		// Check if there is an active text editor
		if (activeEditor) {
			// Use the edit method to modify the document
			activeEditor
				.edit((textEditor) => {
					// Iterate through lines to check for comments of imports
					for (
						let lineNumber = 0;
						lineNumber <= activeEditor.document.lineCount - 1;
						lineNumber++
					) {
						const lineObject = activeEditor.document.lineAt(lineNumber);
						// Regular expression for comments
						const commentMatch = RegExp(/\/\/.*?\/\/.*?/).exec(lineObject.text);

						// Check if the line contains a comment
						if (commentMatch) {
							// Iterate through each import type
							for (const importType of importCategoriesWithVariations) {
								// Check if the comment string is in the imports array

								if (lineObject.text.includes(importType.toUpperCase())) {
									// Delete the line if the comment string is in the imports array
									const lineRange = lineObject.rangeIncludingLineBreak;

									// Delete text of Line Range of the comment
									textEditor.delete(lineRange);

									// Break the loop after the first match is found and line is deleted
									break;
								}
							}
						}
					}
				})
				.then(() => {
					// Resolve the promise with the deletion result and start offset
					resolve({ success: true });
				});
		} else {
			// If there is no active text editor, resolve the promise
			resolve({ success: false });
		}
	});
};

/** Displays Categorized imports on the screen */
export const displayCategorizedImports = (
	categorizedImports: {
		[category: string]: string[];
	},
	startOffset: number
): Promise<{ status: boolean; lastImportText?: string }> => {
	return new Promise((resolve) => {
		// Retrieve the active text editor
		const activeEditor = vscode.window.activeTextEditor;
		let lastImportText = "";

		// Check if there is an active text editor
		if (activeEditor) {
			// Use the edit method to modify the document
			activeEditor
				.edit((text) => {
					// Start position to insert categorized imports
					const insertPosition = activeEditor.document.positionAt(startOffset);

					// Iterate through categories and imports
					for (const category of importCategories) {
						if (!categorizedImports[category]) {
							continue;
						}
						const categoryImports = categorizedImports[category];

						// Insert a header for the category
						text.insert(insertPosition, `// ${category} //\n`);

						// Insert each import line
						for (const importLine of categoryImports) {
							text.insert(insertPosition, `${importLine};\n`);
							lastImportText = importLine;
						}
						// Insert a separator between categories
						text.insert(insertPosition, "\n");
					}
					// }
				})
				.then(() => {
					resolve({ status: true, lastImportText });
				});
		} else {
			resolve({ status: false });
		}
	});
};

/** Remove empty lines after correct imports end */
export const removeEmptyLinesAfterPosition = (lastImportText: string): void => {
	// Access the active text editor
	const activeEditor = vscode.window.activeTextEditor;

	// Check if there is an active text editor
	if (activeEditor) {
		let importsLastPosition = new vscode.Position(0, 0);
		const currentOffset = activeEditor.document.getText().indexOf(lastImportText);

		// Checks if the last import was found or not
		if (currentOffset !== -1) {
			// Find end offset of last import
			const endOffset = currentOffset + lastImportText.length;
			importsLastPosition = activeEditor.document.positionAt(endOffset);
		}

		// Use the edit method to modify the document
		activeEditor.edit((textEditor) => {
			// Iterate through lines starting from the line after the provided position leaving one empty line
			for (
				let lineNumber = importsLastPosition.line + 2;
				lineNumber < activeEditor.document.lineCount;
				lineNumber++
			) {
				const lineObject = activeEditor.document.lineAt(lineNumber);
				// Check if the line is empty
				if (!lineObject.text.trim()) {
					const lineRange = lineObject.rangeIncludingLineBreak;
					textEditor.delete(lineRange);
				} else {
					// Stop deleting lines if a non-empty line is encountered
					break;
				}
			}
		});
	}
};
