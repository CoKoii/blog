---
title: 'SEO Markdown Playground'
description: 'A single file that exercises common Markdown (GFM) syntax.'
tags: [seo, markdown, demo]
date: 2025-01-14
coverImage: https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1600
wordCount: 1800
readTime: 8
views: 125
location: 深圳
comments: 3
---

# SEO Markdown Playground

> A compact SEO note that intentionally uses _many_ Markdown features.
>
> Nested quote:
>
> > Search is a dialogue, not a destination.

## 1. Purpose

This document is **not** a full SEO guide; it is a _syntax showcase_ with SEO-flavored content.  
Use it to validate renderers, themes, and exports.

### 1.1 Emphasis Variations

- _italic_
- **bold**
- **_bold italic_**
- ~~strikethrough~~
- Inline `code` sample
- Escaped characters: \* \_ \# \[ \] \(

## 2. Lists

### 2.1 Unordered

- Title tags
- Meta descriptions
  - Keep under ~160 chars
  - Include a primary keyword
- H1/H2 hierarchy

### 2.2 Ordered

1. Research topics
2. Draft outline
3. Publish
   1. Submit sitemap
   2. Request indexing

### 2.3 Task List

- [x] Define target keywords
- [x] Write the draft
- [ ] Add internal links
- [ ] Measure CTR

## 3. Links and References

Inline link: [Google Search Central](https://developers.google.com/search).

Reference link: [SEO Guide][seo-guide].

Autolink: <https://www.example.com/seo>.

[seo-guide]: https://moz.com/learn/seo "Moz Beginner's Guide"

## 4. Images

![SEO diagram](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800 'Alt text helps accessibility')

## 5. Tables

| Signal | Why it matters        | Example          |
| ------ | --------------------- | ---------------- |
| Title  | Ranking relevance     | "Local SEO Tips" |
| Speed  | UX + crawl efficiency | LCP < 2.5s       |
| Links  | Authority             | Internal hub     |

## 6. Code Blocks

Fenced code (HTML):

```html
<meta name="description" content="Concise summary for SERP." />
```

Fenced code (JSON):

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "SEO Markdown Playground"
}
```

Indented code block:

    curl -I https://www.example.com

## 7. Horizontal Rules

---

## 8. Blockquote + List Combo

> Core checklist:
>
> - One H1
> - Logical headings
> - Descriptive anchors

## 9. Footnote

Footnote example[^1].

[^1]: A short note about E-E-A-T and trust.

## 10. HTML Mix

<details>
  <summary>Click to expand</summary>
  <p>Hidden copy can be useful, but avoid keyword stuffing.</p>
</details>

<kbd>⌘</kbd> + <kbd>K</kbd> for site search (if supported).

## 11. Definition List (extension)

SEO
: Search Engine Optimization.

SERP
: Search Engine Results Page.

## 12. Headings Depth

#### H4 Example

##### H5 Example

###### H6 Example

## 13. Final Note

Use this file to test rendering of Markdown features in your pipeline.
