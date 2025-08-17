import { config as baseConfig } from "./base.js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import pluginSvelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

/**
 * A custom ESLint configuration for SvelteKit projects.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const svelteConfig = [
	{
		ignores: [
			"**/build/**",
			"**/.svelte-kit/**",
			"**/dist/**",
			"**/node_modules/**",
			"**/.env",
			"**/.env.*",
			"!**/.env.example"
		]
	},
	...baseConfig,
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginSvelte.configs["flat/recommended"],
	eslintConfigPrettier,
	...pluginSvelte.configs["flat/prettier"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser
			}
		}
	}
];
