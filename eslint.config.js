import { configApp } from '@adonisjs/eslint-config';
export default configApp({
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    'unicorn/filename-case': 'off',
  },
});
