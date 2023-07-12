import type { CollationOptions } from "mongodb";
import type { Advert, AdvertsRepository } from "../types";
import type { MongoAdvert} from "./types";
import { mapAdvertFilterInputToMongoQuery, mapAdvertFilterInputToMongoSort, mapAdvertToMongoAdvert } from './mappers';
import { createEmptyAdvert } from '../mappers';
import type { MongoConnection } from "../../mongodb-utils/types";

export const createMongoAdvertsRepository = ({getCollection}: MongoConnection<MongoAdvert>, collation: CollationOptions): AdvertsRepository => {
	const getAdvert: AdvertsRepository['getAdvert'] = async (_user, id) => getCollection()
		.then(collection => collection.findOne({id}))
		.then(envelope => envelope?.advert || null)

	const list: AdvertsRepository['list'] = (user, filter) => getCollection()
		.then(collection =>	collection
			.find(mapAdvertFilterInputToMongoQuery(user, filter))
			.collation(collation)
			.sort(mapAdvertFilterInputToMongoSort(filter))
			.toArray()
			.then(envelopes => envelopes.map(envelope => envelope.advert))
			.then(adverts => adverts.map<Advert>(advert => ({ ...createEmptyAdvert(), ...advert }))))

	const create: AdvertsRepository['create'] = async (user, advert) => 
			getCollection()
				.then(collection => ({
					collection, mongoAdvert: mapAdvertToMongoAdvert(advert)
				}))
				.then(({collection, mongoAdvert}) => collection.insertOne(mongoAdvert).then(() => mongoAdvert.advert))

	const remove: AdvertsRepository['remove'] = async (user, id) => {
		const existing = await getAdvert(user, id)
		if (existing) {
			const collection = await getCollection()
			await collection.deleteOne({id})
		}
		return existing
	}

	const saveAdvertVersion: AdvertsRepository['saveAdvertVersion'] = async (
		user,
		versionId,
		advert
	) => {
		const collection = await getCollection()
		const result = await collection.updateOne({id: advert.id, versionId}, {
			$set: mapAdvertToMongoAdvert(advert)
		}, {upsert: false})

		return result.modifiedCount > 0 ? advert : null
	}

	return {
		getAdvert,
		list,
		create,
		remove,
		saveAdvertVersion,
	}
}
