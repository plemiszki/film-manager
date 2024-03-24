module.exports = {
	"extends": [
		"plugin:react/recommended" // works with tags
	],
	"settings": {
		"react": {
			"version": "detect"
		}
	},
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module" // works with 'import'
	},
	"rules": {
		"semi": "warn",
		"eqeqeq": "warn",
	}
}
