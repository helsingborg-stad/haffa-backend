export interface SendGridConfig {
	apiKey: string
	from: string
}

export interface MapTemplateToTemplateId {
	(template: string): Promise<string|null|undefined> 
}
export interface MailSender {
	(to: string, template: string, data: any): Promise<void>
}

