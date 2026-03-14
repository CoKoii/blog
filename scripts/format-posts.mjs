import path from 'node:path'

import { collectMarkdownFiles, formatMarkdownFile } from './utils/markdown-spacing.mjs'

const args = process.argv.slice(2)
const files = await collectMarkdownFiles(args.length ? args : ['posts'])
const changedFiles = []

for (const file of files) {
  if (await formatMarkdownFile(file)) {
    changedFiles.push(file)
    console.log(`Formatted ${path.relative(process.cwd(), file)}`)
  }
}

console.log(`Processed ${files.length} file(s), updated ${changedFiles.length}.`)
