export const CODE_LANGUAGES = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
} as const;

export type CodeLanguage = typeof CODE_LANGUAGES[keyof typeof CODE_LANGUAGES];

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  [CODE_LANGUAGES.JAVASCRIPT]: 'JavaScript',
  [CODE_LANGUAGES.PYTHON]: 'Python',
};