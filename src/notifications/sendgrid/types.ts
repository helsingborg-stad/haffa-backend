export interface SendGridConfig {
  apiKey: string
  from: string
}

export type MapTemplateToTemplateId = (
  template: string
) => Promise<string | null | undefined>
export type MailSender = (
  to: string,
  template: string,
  data: any
) => Promise<void>
