import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { CourseWithChapters } from '~/models/Course'

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    flexDirection: 'column',
    fontFamily: 'Helvetica',
  },
  titlePage: {
    padding: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000000',
  },
  date: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 12,
    color: '#000000',
  },
  chapterContent: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#333333',
    textAlign: 'justify',
  },
  image: {
    marginVertical: 15,
    maxWidth: '100%',
    height: 'auto',
  },
  imageContainer: {
    marginVertical: 15,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
  },
  caption: {
    fontSize: 9,
    color: '#777777',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: '#eeeeee',
  },
})

interface PdfReportProps {
  course: CourseWithChapters
}

/**
 * Composant React PDF pour générer un rapport de cours avec schémas PNG
 * Supporte les images base64 et les descriptions
 */
export function PdfReport({ course }: PdfReportProps) {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  console.log('🎯 [PdfReport] Initializing PDF with course:', course.title)
  console.log('📚 [PdfReport] Total chapters:', course.chapters.length)

  // Convertir l'image base64 au format correct pour react-pdf
  const getImageSource = (imgBase64?: string) => {
    if (!imgBase64) {
      console.log('⚠️ [getImageSource] No image data provided')
      return null
    }

    console.log('🖼️ [getImageSource] Image data length:', imgBase64.length)
    console.log('🖼️ [getImageSource] First 50 chars:', imgBase64.substring(0, 50))

    if (imgBase64.startsWith('data:')) {
      console.log('✅ [getImageSource] Already has data: prefix')
      return imgBase64
    }

    // Si c'est du base64 pur, ajouter le préfixe data:
    const result = `data:image/png;base64,${imgBase64}`
    console.log('✅ [getImageSource] Added data:image/png;base64 prefix')
    console.log('📏 [getImageSource] Final URL length:', result.length)
    return result
  }

  // Parser le contenu Markdown/HTML en paragraphes avec meilleure mise en forme
  const parseContent = (content: string): { text: string; isBold?: boolean }[] => {
    // Nettoyer les tags HTML
    let cleaned = content
      .replace(/<[^>]*>/g, '') // Enlever tous les tags HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    // Diviser par double saut de ligne (paragraphes)
    const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

    const result: { text: string; isBold?: boolean }[] = []

    paragraphs.forEach((para) => {
      // Traiter les **texte** en gras
      const boldRegex = /\*\*(.*?)\*\*/g
      let lastIndex = 0
      let match

      while ((match = boldRegex.exec(para)) !== null) {
        // Ajouter le texte avant le **
        if (match.index > lastIndex) {
          result.push({ text: para.substring(lastIndex, match.index) })
        }
        // Ajouter le texte en gras
        result.push({ text: match[1], isBold: true })
        lastIndex = boldRegex.lastIndex
      }

      // Ajouter le texte restant
      if (lastIndex < para.length) {
        result.push({ text: para.substring(lastIndex) })
      }

      // Ajouter un saut de ligne après chaque paragraphe
      if (result.length > 0) {
        const last = result[result.length - 1]
        last.text = last.text.trimEnd() + '\n'
      }
    })

    return result
  }

  return (
    <Document title={course.title} author="Hackathon Google - Equipe Pixia">
      {/* --- PAGE 1: TITRE --- */}
      <Page size="A4" style={styles.titlePage}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.date}>Généré le {currentDate}</Text>
        <Text style={{ marginTop: 40, fontSize: 12, color: '#666666' }}>
          © Hackathon Google Equipe Pixia - {new Date().getFullYear()}
        </Text>
      </Page>

      {/* --- CHAPITRES --- */}
      {course.chapters.map((chapter, chapterIdx) => {
        console.log(`📖 [Chapter ${chapterIdx}] Title:`, chapter.title)
        console.log(`📖 [Chapter ${chapterIdx}] Has img_base64:`, !!chapter.img_base64)
        console.log(`📖 [Chapter ${chapterIdx}] Schemas array:`, chapter.schemas?.length || 0)
        
        if (chapter.schemas && chapter.schemas.length > 0) {
          chapter.schemas.forEach((schema, schemaIdx) => {
            console.log(`   └─ Schema ${schemaIdx}: ${schema.name}`)
            console.log(`      - pngBase64 size: ${schema.pngBase64.length} bytes`)
          })
        }
        
        console.log(`📖 [Chapter ${chapterIdx}] Schema description:`, chapter.schema_description)

        // Récupérer la première image disponible (soit img_base64, soit la première du tableau schemas)
        const primaryImage = chapter.img_base64 || (chapter.schemas?.[0]?.pngBase64)
        console.log(`📖 [Chapter ${chapterIdx}] Primary image available:`, !!primaryImage)

        return (
          <React.Fragment key={`chapter-${chapterIdx}`}>
            <Page size="A4" style={styles.page}>
              {/* Titre du chapitre */}
              <Text style={styles.chapterTitle}>
                Chapitre {chapterIdx + 1}: {chapter.title}
              </Text>

              {/* Contenu du chapitre */}
              <View>
                {parseContent(chapter.content).map((item, idx) => {
                  const textStyle = item.isBold 
                    ? { ...styles.chapterContent, fontWeight: 'bold' as const }
                    : styles.chapterContent
                  return (
                    <Text 
                      key={`para-${idx}`} 
                      style={textStyle}
                    >
                      {item.text}
                    </Text>
                  )
                })}
              </View>

              {/* Image/Schéma si disponible */}
              {primaryImage && (
                <View style={styles.imageContainer}>
                  {(() => {
                    const src = getImageSource(primaryImage)
                    console.log(`📖 [Chapter ${chapterIdx}] Image src created:`, src ? src.substring(0, 80) + '...' : 'NULL')
                    if (!src) {
                      return (
                        <Text style={{ color: 'red', fontSize: 10 }}>
                          ❌ Erreur: Impossible de charger l'image
                        </Text>
                      )
                    }
                    return (
                      <Image
                          src={src}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                          }}
                          cache={false}
                        />
                    )
                  })()}
                  {chapter.schema_description && (
                    <Text style={styles.caption}>
                      {chapter.schema_description}
                    </Text>
                  )}
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text>
                  © Hackathon Google Equipe Pixia - {new Date().getFullYear()}
                </Text>
              </View>
            </Page>
          </React.Fragment>
        )
      })}
    </Document>
  )
}

export default PdfReport
