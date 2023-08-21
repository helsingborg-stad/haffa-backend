import type { HaffaUser } from "../login/types";

export interface UserMapper {
	mapAndValidateEmail: (email: string|null) => Promise<HaffaUser|null>
	mapAndValidateUser: (user: HaffaUser|null) => Promise<HaffaUser|null>
}