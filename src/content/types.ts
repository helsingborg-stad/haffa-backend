export interface ContentRepository {
  getComposition: () => Promise<ViewComposition>
  updateComposition: (page: ViewComposition) => Promise<ViewComposition>
}
export interface ViewComposition {
  rows: ViewRow[]
}
export interface ViewRow {
  columns: ViewColumn[]
}
export interface ViewColumn {
  module: ContentModule
}
export type ContentModule = {
  title: string
  size: string
  body: string
  border: 'true' | 'false'
  image: string
  position: 'top' | 'bottom' | 'left' | 'right'
  width: string
  imageRef: string
  categories: string
  tags: string
}
