/**
 * useTranslate is now DEPRECATED.
 * All static UI text uses react-i18next's useTranslation hook.
 * This hook is kept only for backward compatibility if any component
 * is not yet migrated. It returns the original strings unchanged.
 *
 * For dynamic user-generated content that needs real-time translation,
 * call the backend POST /api/translate directly in the component.
 */
export const useTranslate = (strings) => {
  return strings;
};
