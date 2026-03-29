import globals from 'globals';
import pluginJs from '@eslint/js'; // <--- Falta esta línea
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        // Aplicar a archivos JS y TS
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
    // Configuración recomendada de ESLint para JS
    pluginJs.configs.recommended,
    // Configuración recomendada para TypeScript
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': 'off',
        },
    },
];
