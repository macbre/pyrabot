// ts-check
const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
	{
		rules: {
			semi: "error",
			"prefer-const": "error",
		},
    },
    {
        languageOptions: {
            ecmaVersion: 5,
            sourceType: "commonjs",
        },
    },
    {
        ignores: ["**/config.js"],
	},
];
