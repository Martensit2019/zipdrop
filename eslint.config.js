import js from '@eslint/js'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  js.configs.recommended,
  vueTsConfigs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx,vue,js}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/require-await': 'off',
      'prettier/prettier': 'warn',
    },
  },
)
