import type { Collection } from "mongodb";
import type { Profile } from "../types";

export interface MongoProfile {
	id: string
	profile: Profile
}

export interface MongoProfileConnection {
	getCollection: () => Promise<Collection<MongoProfile>>
}