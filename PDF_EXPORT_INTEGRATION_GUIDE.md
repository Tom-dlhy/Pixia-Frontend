# 📄 Guide d'Intégration - Export PDF avec Données Structurées

## 🎯 Contexte

Auparavant, l'export PDF était basé sur la capture d'écran (DOM + html2canvas), ce qui causait des problèmes:
- ❌ Screenshots avec tous les styles glassmorphic
- ❌ Texte blanc sur fond transparent
- ❌ Impossibilité de formater correctement

**Nouvelle approche**: Utiliser les **données structurées du cours** (modèle `CourseWithChapters`) pour générer un PDF propre avec jsPDF.

---

## 🏗️ Architecture

### 1. **CourseContentContext** (`src/context/CourseContentContext.tsx`)
Contexte global qui stocke les données du cours actuellement affiché.

```tsx
import { useCourseContent } from '~/context/CourseContentContext'

const { course, setCourse } = useCourseContent()
```

### 2. **generatePdfFromCourseData** (`src/utils/generatePdfFromCourseData.ts`)
Fonction qui génère un PDF directement à partir des données structurées.

```tsx
import { generatePdfFromCourseData } from '~/utils/generatePdfFromCourseData'

await generatePdfFromCourseData(courseData, filename)
```

### 3. **ChatActionButton** (`src/components/ChatActionButton.tsx`)
Utilise maintenant le contexte `CourseContentContext` au lieu de parser le DOM.

---

## 🔧 Comment Intégrer

### Étape 1: Envelopper avec le Provider

Dans `src/routes/__root.tsx`, ajouter le `CourseContentProvider`:

```tsx
import { CourseContentProvider } from '~/context/CourseContentContext'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={clientId ?? ""}>
      <SessionProvider>
        <SettingsProvider>
          <CourseTypeProvider>
            <CourseContentProvider>  {/* ← AJOUTER ICI */}
              {/* ... reste du code ... */}
            </CourseContentProvider>
          </CourseTypeProvider>
        </SettingsProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  )
}
```

### Étape 2: Passer les Données du Cours

Quand vous récupérez les données du cours, appeler `setCourse`:

**Exemple 1: DocPanel** (où le contenu est affiché)
```tsx
import { useCourseContent } from '~/context/CourseContentContext'
import { useDocumentTitle } from '~/context/DocumentTitleContext'

export function DocPanel() {
  const { setCourse } = useCourseContent()
  const { setTitle } = useDocumentTitle()

  // Supposons que les données du cours viennent d'une API ou state
  useEffect(() => {
    const courseData = fetchCourseData() // votre logique
    
    if (courseData) {
      setCourse(courseData) // CourseWithChapters
      setTitle(courseData.title)
    }
  }, [courseId])

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{mockMarkdown}</ReactMarkdown>
    </div>
  )
}
```

**Exemple 2: CourseLayout** (layout principal)
```tsx
import { useCourseContent } from '~/context/CourseContentContext'

export function CourseLayout() {
  const { setCourse } = useCourseContent()

  useEffect(() => {
    // Récupérer les données du cours
    const course = getCourseFromRoute()
    if (course) {
      setCourse(course)
    }
  }, [courseId])

  return (
    // ... votre layout ...
  )
}
```

### Étape 3: Vérifier les Types

Le modèle attendu est `CourseWithChapters`:

```typescript
interface CourseWithChapters {
  id: string
  title: string
  chapters: Chapter[]
  type?: CourseType
}

interface Chapter {
  id: string
  title: string
  content: string  // Peut être du HTML ou du plain text
  schemas?: Schema[]
}
```

---

## 📋 Modèles Concernés

Les cours sont gérés par plusieurs systèmes:

### Standard Courses
- **Model**: `CourseWithChapters` (en `src/models/Course.ts`)
- **Exemple**:
  ```typescript
  {
    id: "cours-1",
    title: "Introduction au Machine Learning",
    chapters: [
      {
        id: "ch-1",
        title: "Concepts clés",
        content: "Le machine learning est..."
      }
    ]
  }
  ```

### Deep Courses
- **Model**: `DeepCourseHydrated` (en `src/models/Deep.ts`)
- Même structure mais avec chapitres enrichis

---

## 🚀 Tester

1. **Ajouter le Provider** dans `__root.tsx`
2. **Passer les données** dans le composant où vous affichezle contenu
3. **Cliquer sur "Enregistrer en PDF"** dans le menu des actions
4. ✅ Vérifier que le PDF se génère correctement

---

## 🔍 Debugging

- Vérifier que `course` n'est pas null: `console.log(useCourseContent())`
- Vérifier que les chapitres ont bien un `content`: `console.log(course.chapters)`
- Vérifier la console pour les logs de génération PDF

---

## 📝 Notes

- Le contenu HTML est nettoyé automatiquement par `cleanHtmlContent()`
- Tailles de police: Titre=24px, Chapitres=16px, Contenu=11px
- Le PDF commence directement sans sommaire
- Première page contient le titre
- Les pages suivantes contiennent les chapitres
