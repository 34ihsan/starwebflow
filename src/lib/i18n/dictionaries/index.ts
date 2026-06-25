import { tr } from './tr';
import { en } from './en';
import { de } from './de';

export const dictionaries: Record<LanguageType, DictionaryType> = {
  tr,
  en,
  de,
};

export type LanguageType = 'tr' | 'en' | 'de';
export type DictionaryType = typeof tr;
export type DictionaryKeys = keyof DictionaryType;
