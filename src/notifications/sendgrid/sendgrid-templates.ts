import request from 'superagent'
import type { MapTemplateToTemplateId, SendGridConfig } from "./types";

export const createSendGridTemplateMapper = ({apiKey}: Pick<SendGridConfig, 'apiKey'>): MapTemplateToTemplateId => {
	let templateCache: Record<string, string>|null = null

	const getTemplateId = async (template: string): Promise<string|null|undefined> => {
		if (!(templateCache?.[template])) {
			const {body: {templates}} = await request.get('https://api.sendgrid.com/v3/templates?generations=dynamic')
			 .set('Authorization', `Bearer ${apiKey}`)
			 .set('Content-Type', 'application/json')
			 .send()
			
			templateCache = (templates as {id: string, name: string}[]).reduce((cache, {id, name}) => ({...cache, [name as string]: id}), {} as Record<string, string>)
			// console.log(JSON.stringify({templateCache, templates}, null, 2))
		}
		return templateCache?.[template]
	}
	return getTemplateId
}