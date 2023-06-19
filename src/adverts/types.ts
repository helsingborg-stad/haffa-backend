export interface Advert {
	title: string
}
export interface AdvertsRepository {
	list: () => Promise<Advert[]>
}