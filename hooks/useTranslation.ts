import { useAuthRole } from '../store/authRole';
import { t as translate } from '../lib/i18n';

export function useTranslation() {
  const { language } = useAuthRole();
  return {
    language,
    t: (key: string, fallback?: string) => translate(language, key, fallback),
  };
}
