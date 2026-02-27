import fs from 'node:fs'
import path from 'node:path'

export const listPostFiles = (rootDir = process.cwd()) => {
  const postsDir = path.join(rootDir, 'posts')
  if (!fs.existsSync(postsDir)) return []

  const entries = []
  const categories = fs.readdirSync(postsDir, { withFileTypes: true })
  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) continue
    const category = categoryEntry.name
    const categoryDir = path.join(postsDir, category)
    const files = fs.readdirSync(categoryDir, { withFileTypes: true })
    for (const fileEntry of files) {
      if (!fileEntry.isFile()) continue
      const file = fileEntry.name
      if (!file.endsWith('.md')) continue
      const slug = file.replace(/\.md$/, '')
      entries.push({
        category,
        slug,
        fileName: file,
        filePath: path.join(categoryDir, file),
      })
    }
  }

  return entries
}
