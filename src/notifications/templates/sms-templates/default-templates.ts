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
}

const defaultTemplateIds = new Set<string>(Object.keys(defaultSmsTemplates))

export const isValidSmsTemplateName = (name: string) =>
  defaultTemplateIds.has(name)
