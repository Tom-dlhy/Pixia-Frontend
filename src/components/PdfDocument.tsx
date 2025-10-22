'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    color: 'black',
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 10,
    color: 'gray',
  },
})

export function PdfDocument({ title, content, type }: any) {
  const isCourse = type === 'course'
  const chapters = isCourse ? content?.chapters || [] : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          Généré le{' '}
          {new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {isCourse &&
          chapters.map((chapter: any, idx: number) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.header}>{chapter.title}</Text>
              <Text style={styles.text}>{chapter.content}</Text>
            </View>
          ))}

        <Text style={styles.footer}>
          © Hackathon Google - Equipe Pixia - {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  )
}
