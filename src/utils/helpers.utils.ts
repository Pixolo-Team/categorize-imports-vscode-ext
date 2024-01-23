import { importCategoryToComment } from "../infrastructure/constants";
import { displayCategorizedImports } from "./modifiers.utils";

/** Read the import and return Category Name */
export const determineCategory = (importStatement: string): string => {
	// Check if import ends with "Request"
	if (importStatement.endsWith("Request")) {
		return "API SERVICES";
	}

	for (const category in importCategoryToComment) {
		if (importStatement.includes(category)) {
			return importCategoryToComment[category];
		}
	}
	return "OTHERS";
};

/** Categorizes imports and pushes them in their respective category array */
export const categorizeImports = (imports: string[], startOffset: any) => {
	// Create an object to store imports categorized by their categories
	const categorizedImports: { [category: string]: string[] } = {};

	// Loop in all imports
	for (const singleImport of imports) {
		// Find category of the import
		const category = determineCategory(singleImport);

		// Check if the category exists in the categorized imports object
		if (!categorizedImports[category]) {
			// If the category doesn't exist, create an array for it
			categorizedImports[category] = [];
		}

		// Push the import into the category array
		categorizedImports[category].push(singleImport);
	}
	// Display categorized imports
	displayCategorizedImports(categorizedImports, startOffset);
};
