import fs from 'node:fs'
import path from 'node:path'

export const listPostFiles = (rootDir = process.cwd()) => {
  const postsDir = path.join(rootDir, 'posts')
  if (!fs.existsSync(postsDir)) return []

  const entries = []
  const categories = fs.readdirSync(postsDir)
  for (const category of categories) {
    const categoryDir = path.join(postsDir, category)
    if (!fs.statSync(categoryDir).isDirectory()) continue
    const files = fs.readdirSync(categoryDir)
    for (const file of files) {
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
