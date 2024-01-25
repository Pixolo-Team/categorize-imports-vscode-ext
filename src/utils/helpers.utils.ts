// CONSTANTS //
import { importCategoryMap } from "../infrastructure/constants";

/** Read the import and return Category Name */
export const determineCategory = (importStatement: string): string => {
	// Iterate through each defined category in the import statement and check if it matches any category
	for (const category in importCategoryMap) {
		if (importStatement.includes(category)) {
			return importCategoryMap[category];
		}
	}
	return "OTHERS";
};

/** Categorizes imports and pushes them in their respective category array */
export const categorizeImports = (
	imports: string[]
): { [category: string]: string[] } => {
	// Create an object to store imports categorized by their categories
	const categorizedImports: { [category: string]: string[] } = {};

	// Loop in all imports
	for (const importItem of imports) {
		// Find category of the import
		const category = determineCategory(importItem);

		// Check if the category exists in the categorized imports object
		if (!categorizedImports[category]) {
			// If the category doesn't exist, create an array for it
			categorizedImports[category] = [];
		}

		// Push the import into the category array
		categorizedImports[category].push(importItem);
	}
	return categorizedImports;
};

/** Get all import statements from the given text */
export const getImports = (documentText: string): string[] => {
	// Regular expression to find all imports
	const importRegex = /import[\s\S]*?['"].*?['"]/g;

	// Checks if the file has imports
	const imports = documentText?.match(importRegex) || [];
	return imports;
};
