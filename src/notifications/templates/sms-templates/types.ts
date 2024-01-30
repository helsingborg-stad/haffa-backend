export interface SmsTemplate {
  templateId: string
  template: string
  enabled: boolean
}

export interface SmsTemplatePreview {
  templateId: string
  template: string
  preview: string
}
