import sgmail from '@sendgrid/mail'
import { createSendGridTemplateMapper } from './sendgrid-templates'
import type { MailSender, SendGridConfig } from './types'

export const createSendGridMailSender = ({
  apiKey,
  from,
}: SendGridConfig): MailSender => {
  sgmail.setApiKey(apiKey)

  const getTemplateId = createSendGridTemplateMapper({ apiKey })

  return async (to, template, data) => {
    const templateId = await getTemplateId(template)
    if (!templateId) {
      console.error(
        `sendgrid notifications: no template for event ${template} was found`
      )
      return
    }

    await sgmail.send({
      from,
      templateId,
      personalizations: [
        {
          to: [{ email: to }],
          dynamicTemplateData: data,
        },
      ],
    })
  }
}
