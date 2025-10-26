'use client'

import { CourseWithChapters } from '~/models/Course'

export function generateMarkdownFromCourseData(
  course: CourseWithChapters,
  filename: string
): boolean {
  try {
    
    
    
    let markdown = ''

    markdown += `# ${course.title}\n\n`

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    markdown += `*Généré le ${dateStr}*\n\n`

    markdown += '---\n\n'

    course.chapters.forEach((chapter, chapterIdx) => {
      markdown += `## Chapitre ${chapterIdx + 1} — ${chapter.title}\n\n`

      markdown += `${chapter.content}\n\n`

      markdown += '---\n\n'
    })

    markdown += `\n\n*© ${new Date().getFullYear()} Hackathon Google — Équipe Pixia*\n`

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.md') ? filename : `${filename}.md`
    
    
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)

    

    return true
  } catch (error) {
    console.error('Erreur lors de la génération du Markdown:', error)
    return false
  }
}
