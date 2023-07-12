import type { ProfileRepository } from "../types";
import type { MongoProfileConnection } from "./types";
import { createEmptyProfile } from "../mappers";


export const createMongoDBProfileRepository = (connection: MongoProfileConnection): ProfileRepository => {
	const getProfile: ProfileRepository['getProfile'] = async ({ id }) => {
		const collection = await connection.getCollection()
		const envelope = await collection.findOne({id: id.toLowerCase()})
		return {
			...createEmptyProfile(),
			email: id,
			...envelope?.profile
		}
	}
  const updateProfile: ProfileRepository['updateProfile'] = async (user, input) => {
		const collection = await connection.getCollection()
		const id = user.id.toLowerCase()
		await collection.updateOne({
			id,
		}, {$set: {
			id,
			profile: {
				...createEmptyProfile(),
				...input,
				email: id,
			}
		}}, {upsert: true}
		)
    return getProfile(user)
  }
	return {getProfile, updateProfile}
}