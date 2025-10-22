import { createContext, useContext, useState, ReactNode } from 'react'

interface DocumentTitleContextType {
  title: string | null
  setTitle: (title: string | null) => void
}

const DocumentTitleContext = createContext<DocumentTitleContextType | undefined>(undefined)

export function DocumentTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null)

  return (
    <DocumentTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </DocumentTitleContext.Provider>
  )
}

export function useDocumentTitle() {
  const context = useContext(DocumentTitleContext)
  if (!context) {
    throw new Error('useDocumentTitle must be used within DocumentTitleProvider')
  }
  return context
}
