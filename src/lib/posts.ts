import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  readingTime: string
  thumbnail?: string
}

export interface Post extends PostMeta {
  content: string
}

export function getAllPosts(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames
    .filter((f) => f.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const stats = readingTime(content)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category || '사주역학',
        tags: data.tags || [],
        readingTime: `${Math.ceil(stats.minutes)}분`,
        thumbnail: data.thumbnail || null,
      } as PostMeta
    })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      category: data.category || '사주역학',
      tags: data.tags || [],
      readingTime: `${Math.ceil(stats.minutes)}분`,
      thumbnail: data.thumbnail || null,
      content,
    }
  } catch {
    return null
  }
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  return [...new Set(posts.map((p) => p.category))]
}
