import eslintConfigPrettier from "eslint-config-prettier";
import js from "@eslint/js";
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";
import turboPlugin from "eslint-plugin-turbo";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	{
		plugins: {
			turbo: turboPlugin
		},
		rules: {
			"turbo/no-undeclared-env-vars": "warn"
		}
	},
	{
		plugins: {
			onlyWarn
		}
	},
	{
		ignores: ["dist/**"]
	}
];
