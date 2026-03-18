// Simple markdown to HTML converter without external deps
export function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered list
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />')

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
    return `<pre><code>${code}</code></pre>`
  })

  // Paragraphs (wrap non-tagged lines)
  const lines = html.split('\n')
  const result: string[] = []
  let inBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (inBlock) {
        result.push('</p>')
        inBlock = false
      }
      continue
    }
    if (
      line.startsWith('<h') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<li') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<pre') ||
      line.startsWith('<hr')
    ) {
      if (inBlock) {
        result.push('</p>')
        inBlock = false
      }
      result.push(line)
    } else {
      if (!inBlock) {
        result.push('<p>')
        inBlock = true
      }
      result.push(line)
    }
  }
  if (inBlock) result.push('</p>')

  return result.join('\n')
}
