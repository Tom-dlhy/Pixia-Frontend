import { CourseWithChapters } from '~/models/Course'

/**
 * Génère un rapport Markdown à partir d'un cours
 * ✅ Les images base64 utilisent des balises HTML <img> 
 * Compatible avec MarkdownRenderer.tsx qui supporte le rendu d'images
 */
export function generateMarkdownReport(course: CourseWithChapters): string {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let markdown = `# ${course.title}\n\n`
  markdown += `_Généré le ${currentDate}_\n\n`
  markdown += `© Hackathon Google Equipe Pixia - ${new Date().getFullYear()}\n\n---\n\n`

  // Ajouter chaque chapitre
  course.chapters.forEach((chapter, idx) => {
    markdown += `## Chapitre ${idx + 1}: ${chapter.title}\n\n`
    
    // Nettoyer le contenu du chapitre : enlever les images Markdown ![...]()
    const cleanedContent = chapter.content.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '').trim()
    markdown += `${cleanedContent}\n\n`

    // Ajouter l'image si elle existe (balises HTML pour compatibilité MarkdownRenderer)
    if (chapter.img_base64) {
      markdown += `<img src="${chapter.img_base64}" alt="Schéma - ${chapter.title}"/>\n\n`
    } else if (chapter.schemas && chapter.schemas.length > 0) {
      chapter.schemas.forEach((schema) => {
        markdown += `<img src="${schema.pngBase64}" alt="${schema.name}"/>\n\n`
      })
    }

    if (chapter.schema_description) {
      markdown += `_${chapter.schema_description}_\n\n`
    }

    markdown += `---\n\n`
  })

  return markdown
}

/**
 * Exporte le Markdown en tant que fichier .md
 */
export function downloadMarkdownReport(course: CourseWithChapters): void {
  const markdown = generateMarkdownReport(course)
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
