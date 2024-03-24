module.exports = {
	"env": {
		"browser": true, // works with 'document'
	},
	"extends": [
		"plugin:react/recommended" // works with JSX tags
	],
	"settings": {
		"react": {
			"version": "detect" // silence warning
		}
	},
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module" // works with 'import'
	},
	"rules": {
		"semi": "warn",
		"eqeqeq": "warn",
		"react/prop-types": "off",
		"react/no-unknown-property": ["error", { "ignore": ["jsx"] }]
	}
};
