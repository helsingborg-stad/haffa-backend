export const defaultSmsTemplates: Record<string, string> = {
  'pincode-requested': 'Din pinkod är {{pincode}}',
  'advert-was-reserved': 'Du har reserverat {{advert.title}}',
  'advert-was-reserved-owner': 'Din annons {{advert.title}} har reserverats',
  'advert-reservation-was-cancelled': 'Du har avreserverat {{advert.title}}',
  'advert-reservation-was-cancelled-owner':
    'Din annons {{advert.title}} har avreserverats',
  'advert-was-collected': '',
  'advert-was-collected-owner': 'Din annons {{advert.title}} har hämtats ut',
  'advert-collect-was-cancelled': '',
  'advert-collect-was-cancelled-owner': '',
  'advert-not-returned': 'Då måste återlämna {{advert.title}} ',
  'advert-was-returned': 'Äterlämningskvitto för {{advert.title}}',
  'advert-waitlist-available':
    '{{advert.title}} är nu tillgänglig. Skynda dig att reservera :)',
  'advert-was-picked': '{{advert.title}} är nu redo att hämtas.',
  'advert-collect-was-renewed': '',
  'advert-reservation-was-renewed': '',
}

const defaultTemplateIds = new Set<string>(Object.keys(defaultSmsTemplates))

export const isValidSmsTemplateName = (name: string) =>
  defaultTemplateIds.has(name)
