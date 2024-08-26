export type TemplateName =
  | 'subscriptions-has-new-adverts'
  | 'pincode-requested'
  | 'advert-was-reserved'
  | 'advert-reservation-was-cancelled'
  | 'advert-was-collected'
  | 'advert-collect-was-cancelled'
  | 'advert-not-collected'
  | 'advert-was-reserved-owner'
  | 'advert-reservation-was-cancelled-owner'
  | 'advert-was-collected-owner'
  | 'advert-collect-was-cancelled-owner'
  | 'advert-not-returned'
  | 'advert-was-returned'
  | 'advert-was-returned-owner'
  | 'advert-waitlist-available'
  | 'advert-was-picked'
  | 'advert-was-picked-owner'
  | 'advert-was-unpicked-owner'
  | 'advert-collect-was-renewed'
  | 'advert-collect-was-renewed-owner'
  | 'advert-reservation-was-renewed'
  | 'advert-reservation-was-renewed-owner'

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
