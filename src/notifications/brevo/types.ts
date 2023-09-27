export type TemplateName =
  | 'pincode-requested'
  | 'advert-was-reserved'
  | 'advert-reservation-was-cancelled'
  | 'advert-was-collected'
  | 'advert-not-collected'

export interface Identity {
  name: string
  email: string
}

export interface BrevoConfig {
  apiKey: string
  from: Identity
}

export interface BrevoClient {
  getTemplateId(commonName: TemplateName): Promise<number>
  send(
    to: Identity,
    templateCommonName: TemplateName,
    params: Record<string, unknown>,
    replyTo?: Identity
  ): Promise<void>
}

export interface RelevantGetTemplatesResult {
  templates: {
    id: number
    name: string
  }[]
}

export interface SendMailPostRequestBody {
  sender: {
    name: string
    email: string
  }

  to: [
    {
      name: string
      email: string
    }
  ]

  templateId: number

  params: Record<string, string>
}
