import { config as baseConfig } from "./base.js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * A custom ESLint configuration for Node.js API projects using Fastify.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const apiConfig = [
	...baseConfig,
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2022
			},
			ecmaVersion: 2022,
			sourceType: "module"
		}
	},
	{
		rules: {
			// Node.js specific rules
			"no-restricted-syntax": [
				"error",
				{
					selector: "CallExpression[callee.object.name='console'][callee.property.name='log']",
					message: "Use console.error, console.warn, or a proper logger instead of console.log"
				}
			],
			"no-path-concat": "warn",

			// TypeScript specific rules for Node.js
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_"
				}
			],
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",

			// Import/Export rules for ESM
			"prefer-const": "warn",
			"no-var": "warn",

			// Fastify specific recommendations
			"no-async-promise-executor": "warn",
			"require-await": "warn"
		}
	},
	{
		files: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
		rules: {
			// More lenient rules for test files
			"@typescript-eslint/no-explicit-any": "off",
			"no-restricted-syntax": "off"
		}
	}
];

export default apiConfig;
