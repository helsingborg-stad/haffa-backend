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
  body: string
  image: string
  categories: string
  tags: string
}
