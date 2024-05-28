import { makeUser } from '../../../../login'
import { createInMemorySettingsService } from '../../../../settings'
import { smsTemplateMapper } from '../sms-template-mapper'
import type { SmsTemplate } from '../types'

describe('smsTemplateMapper', () => {
  const createMapper = (templates: SmsTemplate[]) =>
    smsTemplateMapper(
      createInMemorySettingsService({
        'sms-notification-templates': templates,
      })
    )

  const renderTemplate = (
    templates: SmsTemplate[],
    templateId: string,
    data: any
  ) => createMapper(templates).renderTemplate(templateId, data)

  it('does not render unknown templates', async () => {
    const mapper = createMapper([])
    const rendered = await mapper.renderTemplate('missing-template', {})
    expect(rendered).toBeNull()
  })
  it('dooes not render known templates if not enabled', async () => {
    const mapper = createMapper([
      {
        templateId: 'advert-was-reserved',
        template: 'Annonsen {{advert.title}} reserverades av {{by.id}}',
        enabled: false,
      },
    ])
    const rendered = await mapper.renderTemplate('advert-was-reserved', {
      by: makeUser({ id: 'test@user' }),
      advert: { title: 'testannons' },
    })
    expect(rendered).toBeNull()
  })

  it('renders known templates if enabled', async () => {
    const mapper = createMapper([
      {
        templateId: 'advert-was-reserved',
        template: 'Annonsen {{advert.title}} reserverades av {{by.id}}',
        enabled: true,
      },
    ])
    const rendered = await mapper.renderTemplate('advert-was-reserved', {
      by: makeUser({ id: 'test@user' }),
      advert: { title: 'testannons' },
    })
    expect(rendered).toBe('Annonsen testannons reserverades av test@user')
  })

  it('can render conditionals', async () => {
    const templates: SmsTemplate[] = [
      {
        templateId: 'advert-was-reserved',
        template:
          'Annonsen {{advert.title}} är reserverad {{#if advert.pickedAt}}och kan hämtas ut.{{else}}och vi meddelar när den kan hämtas ut.{{/if}}',
        enabled: true,
      },
    ]

    expect(
      await renderTemplate(templates, 'advert-was-reserved', {
        advert: { title: 'testannons', pickedAt: '' },
      })
    ).toBe(
      'Annonsen testannons är reserverad och vi meddelar när den kan hämtas ut.'
    )
    expect(
      await renderTemplate(templates, 'advert-was-reserved', {
        advert: { title: 'testannons', pickedAt: '2024-01-01' },
      })
    ).toBe('Annonsen testannons är reserverad och kan hämtas ut.')
  })
})
