import { HaffaUser } from '../login/types'

export interface Profile {
	email: string
	phone: string
	adress: string
	zipCode: string
	city: string
	country: string 
}

export interface ProfileInput {
	phone: string
	adress: string
	zipCode: string
	city: string
	country: string 
}

export interface ProfileRepository {
	getProfile: (user: HaffaUser) => Promise<Profile>
	updateProfile: (user: HaffaUser, input: ProfileInput) => Promise<Profile>
}