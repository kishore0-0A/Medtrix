import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../supabase/database';

export function useLocalizedMedicine(item: InventoryItem | null | undefined) {
  const { i18n } = useTranslation();

  if (!item) return { name: '', genericName: '', description: '' };

  const currentLang = i18n.language; // 'en', 'ta', 'hi'
  
  // If the language is English, or if there are no translations available, use the canonical names.
  if (currentLang === 'en' || !item.translations || !item.translations[currentLang]) {
    return {
      name: item.name,
      genericName: item.genericName || '',
      description: item.composition || '' // Mapping composition to description for fallback
    };
  }

  // Use the verified localized translations
  const trans = item.translations[currentLang];
  return {
    name: trans.name || item.name,
    genericName: trans.generic_name || item.genericName || '',
    description: trans.description || item.composition || ''
  };
}
