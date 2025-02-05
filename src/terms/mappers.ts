import { uniqueBy } from '../lib'
import type { SettingsService } from '../settings/types'
import type { Terms } from './types'

const normalizeStringList = (l: any, defaultValue: string[]): string[] =>
  Array.isArray(l)
    ? l
        .filter(v => typeof v === 'string')
        .map(s => s.trim())
        .filter(s => s)
        .filter(uniqueBy(s => s))
    : defaultValue

const normalizeTerms = (terms: Terms | null): Terms => ({
  organization: normalizeStringList(terms?.organization, []),
  unit: normalizeStringList(terms?.unit, [
    'st',
    'm',
    'dm',
    'cm',
    'mm',
    'm²',
    'dm²',
    'cm²',
    'mm²',
    'm³',
    'dm³',
    'cm³',
    'mm³',
    'l',
    'kg',
    'hg',
    'g',
    'mg',
  ]),
  material: normalizeStringList(terms?.material, [
    'Trä',
    'Plast',
    'Metall',
    'Textil',
    'Annat',
  ]),
  condition: normalizeStringList(terms?.condition, [
    'Nyskick',
    'Bra',
    'Sliten',
  ]),
  usage: normalizeStringList(terms?.usage, ['Inomhus', 'Utomhus']),
  tags: normalizeStringList(terms?.tags, []),
  sizes: normalizeStringList(terms?.sizes, []),
  places: normalizeStringList(terms?.places, []),
})

export const termsAdapter = (settings: SettingsService) => ({
  getTerms: () => settings.getSetting<Terms>('terms').then(normalizeTerms),
  updateTerms: (terms: Terms) =>
    settings.updateSetting('terms', terms).then(normalizeTerms),
})
