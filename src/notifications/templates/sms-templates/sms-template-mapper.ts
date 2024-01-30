import { compile } from 'handlebars'
import type { SettingsService } from '../../../settings/types'
import type { SmsTemplate, SmsTemplatePreview } from './types'
import {
  isValidSmsTemplateName,
  defaultSmsTemplates,
} from './default-templates'
import { uniqueBy } from '../../../lib'

const normalizeSmsTemplates = (
  templates: SmsTemplate[] | null
): SmsTemplate[] =>
  (templates || [])
    // only allow known templates
    .filter(({ templateId }) => isValidSmsTemplateName(templateId))
    // map defaults
    .map(({ templateId, template, enabled }) => ({
      templateId,
      template: template?.trim() || defaultSmsTemplates[templateId] || '',
      enabled,
    }))
    .concat(
      Object.entries(defaultSmsTemplates).map(([templateId, template]) => ({
        templateId,
        template,
        enabled: false,
      }))
    )
    .filter(uniqueBy(t => t.templateId))

const tryRenderTemplate = (template: string, data: any) => {
  try {
    return template ? compile(template)(data) : null
  } catch {
    return null
  }
}

export const smsTemplateMapper = (settings: SettingsService) => ({
  getSmsTemplates: () =>
    settings
      .getSetting<SmsTemplate[]>('sms-notification-templates')
      .then(templates => normalizeSmsTemplates(templates)),
  updateSmsTemplates: (templates: SmsTemplate[]) =>
    settings
      .updateSetting<SmsTemplate[]>(
        'sms-notification-templates',
        normalizeSmsTemplates(templates)
      )
      .then(normalizeSmsTemplates),
  previewTemplates: async (
    templates: SmsTemplate[],
    data: any
  ): Promise<SmsTemplatePreview[]> =>
    Promise.resolve(templates)
      .then(normalizeSmsTemplates)
      .then(Object.values)
      .then(l =>
        l.map(({ templateId, template }) => ({
          templateId,
          template,
          preview: tryRenderTemplate(template, data) || '',
        }))
      ),
  renderTemplate: async (templateId: string, data: any) =>
    settings
      .getSetting<SmsTemplate[]>('sms-notification-templates')
      .then(templates => normalizeSmsTemplates(templates))
      .then(templates =>
        templates.find(t => t.templateId === templateId && t.enabled)
      )
      .then(template => template?.template || '')
      .then(template => tryRenderTemplate(template, data)),
})
