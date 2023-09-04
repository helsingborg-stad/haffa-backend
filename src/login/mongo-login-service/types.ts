export interface MongoLoginPendingAttempt {
  pincode: string
  origin: string
  expires: number
}
export interface MongoLogin {
  id: string
  pending: MongoLoginPendingAttempt[]
}
