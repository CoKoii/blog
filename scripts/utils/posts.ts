export type PostFileEntry = {
  category: string
  slug: string
  fileName: string
  filePath: string
}

// @ts-expect-error: .mjs runtime module isn't typed in TS build
export { listPostFiles } from './posts.mjs'
