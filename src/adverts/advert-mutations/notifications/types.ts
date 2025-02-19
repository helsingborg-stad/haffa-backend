import type { Advert, AdvertClaim } from '../../types'

export interface AdvertNotifier {
  wasArchived: (advert: Advert) => Promise<any>
  wasUnArchived: (advert: Advert) => Promise<any>
  wasRemoved: (advert: Advert) => Promise<any>
  wasPicked: (advert: Advert, claims: AdvertClaim[]) => Promise<any>
  wasUnPicked: (advert: Advert) => Promise<any>
}

export interface AdvertPickingNotifier {}

export interface AdvertWaitlistNotifier {
  wasWaitListAvailble: (advert: Advert) => Promise<any>
}

export interface AdvertClaimsNotifier {
  wasReserved: (
    advert: Advert,
    quantity: number,
    claims: AdvertClaim[]
  ) => Promise<any>
  wasCollected: (
    advert: Advert,
    quantity: number,
    claims: AdvertClaim[]
  ) => Promise<any>
  wasCancelled: (advert: Advert, claims: AdvertClaim[]) => Promise<any>
  wasReservedOrCollected: (
    advert: Advert,
    claims: AdvertClaim[]
  ) => Promise<any>
  wasRenewed: (advert: Advert, claims: AdvertClaim[]) => Promise<any>
  wasReturned: (advert: Advert, claims: AdvertClaim[]) => Promise<any>

  // wasNotCollected
  // wasNotReturned
  // wasReturned
}
