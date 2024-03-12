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
  align: 'left' | 'right' | 'center'
  border: 'true' | 'false'
  background: string
  image: string
  position: 'top' | 'bottom' | 'left' | 'right'
  width: string
  categories: string
  tags: string
}
