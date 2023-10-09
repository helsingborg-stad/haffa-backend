import request from 'superagent'
import type {
  BrevoConfig,
  BrevoClient,
  RelevantGetTemplatesResult,
  Identity,
  TemplateName,
  SendMailPostRequestBody,
} from './types'

export function createClient(config: BrevoConfig): BrevoClient {
  const doGet = async <T>(endpoint: string, data?: string) => {
    const { body } = await request
      .get(`https://api.brevo.com/v3/${endpoint}`)
      .set('api-key', config.apiKey)
      .set('Content-Type', 'application/json')
      .send(data)
    return body as T
  }

  const doPost = async <T = undefined>(endpoint: string, data: object) => {
    const { body } = await request
      .post(`https://api.brevo.com/v3/${endpoint}`)
      .set('api-key', config.apiKey)
      .set('Content-Type', 'application/json')
      .send(data)
    return body as T
  }

  const getTemplateId = async (commonName: string) => {
    const { templates } = await doGet<RelevantGetTemplatesResult>(
      'smtp/templates'
    )
    const relevantTemplate = templates.find(
      template => template.name === commonName
    )

    if (!relevantTemplate) {
      console.error(
        `Brevo notifications: no template found for event '${commonName}'`
      )
      return -1
    }

    return relevantTemplate.id
  }

  const send = async (
    to: Identity,
    templateCommonName: TemplateName,
    params: Record<string, string>,
    replyTo?: Identity
  ) => {
    const templateId = await getTemplateId(templateCommonName)

    if (templateId === -1) {
      return
    }

    await doPost<SendMailPostRequestBody>('smtp/email', {
      sender: config.from,
      to: [to],
      templateId,
      params,
      replyTo,
    }).catch(e => {
      console.error(
        JSON.stringify(
          {
            templateCommonName,
            to,
            params,
            e,
          },
          null,
          2
        )
      )
      throw e
    })
  }

  return {
    getTemplateId,
    send,
  }
}
