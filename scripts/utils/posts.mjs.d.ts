export type PostFileEntry = {
  category: string
  slug: string
  fileName: string
  filePath: string
}

export function listPostFiles(rootDir?: string): PostFileEntry[]
