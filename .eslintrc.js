module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
            jsx: true
        }
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        'eqeqeq': [ 'error', 'always' ],
        'quotes': [ 'error', 'single' ],
        'semi': [ 'error', 'always' ],
        'semi-style': [ 'error', 'last' ],
        'no-fallthrough': 0,
        'no-unused-vars': 0,
        'no-var': 'error',
        '@typescript-eslint/no-unused-vars': [ 'warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        } ],
        '@typescript-eslint/explicit-function-return-type': [ 'error', {
            allowExpressions: true }
        ],
        '@typescript-eslint/strict-boolean-expressions': [ 'error', {
            allowString: false,
            allowNumber: false,
            allowNullableObject: false
        } ]
    }
};
