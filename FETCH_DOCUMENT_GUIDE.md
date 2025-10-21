# 📚 Documentation: FetchDocument - Système de Récupération des Documents

## Vue d'ensemble

Le système `fetchDocument` est une architecture complète pour récupérer, valider et gérer les données d'exercices et de cours générés par l'IA depuis le backend FastAPI.

## 📁 Structure des Fichiers

```
src/
├── models/
│   └── Document.ts                 # Types TypeScript & Type Guards
├── server/
│   ├── document.api.ts             # Fonctions d'appel API brutes
│   └── document.server.ts          # Server functions TanStack React Start (Zod validées)
└── hooks/
    └── useDocument.ts              # Hooks React pour utilisation en composants
```

## 🎯 Cas d'Utilisation

### 1. Utiliser le Hook dans un Composant React

```tsx
import { useExercise } from "~/hooks/useDocument"

export function ExerciseViewer({ exerciseId }: { exerciseId: string }) {
  const { data, loading, error } = useExercise(exerciseId)

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>
  
  return (
    <div>
      {data?.exercises.map((exercise, idx) => (
        <ExerciseBlock key={idx} exercise={exercise} />
      ))}
    </div>
  )
}
```

### 2. Utiliser la Server Function Directement

```tsx
import { getCourse } from "~/server/document.server"

export async function CourseLoader() {
  try {
    const course = await getCourse({
      data: { session_id: "course-123" }
    })
    console.log(course.title) // "Les Nombres Complexes : Bases Essentielles"
  } catch (error) {
    console.error("Erreur:", error)
  }
}
```

### 3. Utiliser l'API Client Directement (Côté Client)

```tsx
import { fetchExercise, fetchCourse } from "~/server/document.api"

const exercise = await fetchExercise("exercise-456")
const course = await fetchCourse("course-789")
```

## 🔑 Fonctions Principales

### Server Functions (Recommandées)

#### `getExercise({ data: { session_id } })`
- **Paramètres**: `session_id: string`
- **Retour**: `ExerciseOutput`
- **Validation**: Zod
- **Sécurité**: Côté serveur

```ts
const exercise = await getExercise({ 
  data: { session_id: "exercise-123" } 
})
```

#### `getCourse({ data: { session_id } })`
- **Paramètres**: `session_id: string`
- **Retour**: `CourseOutput`
- **Validation**: Zod
- **Sécurité**: Côté serveur

```ts
const course = await getCourse({ 
  data: { session_id: "course-123" } 
})
```

#### `getDocument({ data: { session_id, type } })`
- **Paramètres**: 
  - `session_id: string`
  - `type: "exercise" | "course"`
- **Retour**: `ExerciseOutput | CourseOutput`
- **Validation**: Zod
- **Sécurité**: Côté serveur

```ts
const doc = await getDocument({ 
  data: { 
    session_id: "doc-123",
    type: "exercise"
  } 
})
```

### API Client Functions

#### `fetchExercise(sessionId)`
- Appel direct au backend
- POST vers `/testfetchexercise`
- Params: FormData `session_id`

#### `fetchCourse(sessionId)`
- Appel direct au backend
- POST vers `/testfetchcourse`
- Params: FormData `session_id`

#### `fetchDocumentWithRetry(sessionId, type, maxRetries, delayMs)`
- Retry automatique avec backoff exponentiel
- Idéal pour les connexions instables
- Délai croissant: 1s → 2s → 4s

### Hooks React

#### `useExercise(sessionId, options?)`
```tsx
const { data, loading, error } = useExercise("exercise-123")
```

#### `useCourse(sessionId, options?)`
```tsx
const { data, loading, error } = useCourse("course-123")
```

#### `useDocument(sessionId, type, options?)`
```tsx
const { data, loading, error } = useDocument("doc-123", "exercise")
```

**Options**:
```tsx
interface UseDocumentOptions {
  autoFetch?: boolean  // Défaut: true
}
```

## 🏗️ Types TypeScript

### ExerciseOutput
```ts
interface ExerciseOutput {
  id?: string
  exercises: (QCM | Open)[]  // Union discriminée par "type"
}
```

### CourseOutput
```ts
interface CourseOutput {
  id?: string
  title: string
  chapters: Chapter[]
  parts?: Chapter[]  // Alias
}
```

### QCM (Multiple Choice)
```ts
interface QCM {
  id?: string
  type: "qcm"
  topic: string
  questions: QCMQuestion[]
}

interface QCMQuestion {
  id?: string
  question: string
  answers: QCMAnswer[]
  explanation: string
  multi_answers: boolean
  is_corrected?: boolean
}

interface QCMAnswer {
  id?: string
  text: string
  is_correct: boolean
  is_selected?: boolean
}
```

### Open (Text Réponse)
```ts
interface Open {
  id?: string
  type: "open"
  topic: string
  questions: OpenQuestion[]
}

interface OpenQuestion {
  id?: string
  question: string
  answers?: string
  is_correct?: boolean
  is_corrected?: boolean
  explanation: string
}
```

### Chapter
```ts
interface Chapter {
  id_chapter?: string
  id_schema?: string
  title: string
  content: string
  schema_description?: string
}
```

## 🛡️ Type Guards

Discriminer automatiquement entre exercices et cours:

```ts
import { isQCM, isOpen, isExerciseOutput, isCourseOutput } from "~/models/Document"

// Dans un exercice
if (isQCM(exerciseBlock)) {
  // Handle QCM
} else if (isOpen(exerciseBlock)) {
  // Handle Open
}

// Global
if (isExerciseOutput(data)) {
  // Handle exercise
} else if (isCourseOutput(data)) {
  // Handle course
}
```

## 🔄 Flux de Données

```
┌─────────────────────────────┐
│   Composant React           │
│  (useDocument hook)         │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Server Function             │
│  (getExercise, getCourse)    │
│  + Zod Validation            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  API Client                  │
│  (fetchExercise, fetchCourse)│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  FastAPI Backend             │
│  /testfetchexercise          │
│  /testfetchcourse            │
└──────────────────────────────┘
```

## ⚡ Gestion des Erreurs

### DocumentFetchError
```ts
class DocumentFetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  )
}
```

### Exemple de Gestion
```tsx
try {
  const exercise = await getExercise({ data: { session_id: "123" } })
} catch (error) {
  if (error instanceof DocumentFetchError) {
    console.error(`Status: ${error.statusCode}`)
    console.error(`Message: ${error.message}`)
  }
}
```

## 📊 Exemples Complets

### Afficher un Exercice QCM

```tsx
import { useExercise, isQCM } from "~/hooks/useDocument"
import { isQCM } from "~/models/Document"

export function QCMViewer({ exerciseId }: { exerciseId: string }) {
  const { data, loading, error } = useExercise(exerciseId)

  if (loading) return <Loader />
  if (error) return <ErrorAlert error={error} />
  if (!data) return null

  const data as ExerciseOutput

  return (
    <div>
      {data.exercises.map((exercise, idx) => {
        if (!isQCM(exercise)) return null
        
        return (
          <div key={exercise.id} className="qcm-block">
            <h3>{exercise.topic}</h3>
            {exercise.questions.map((q) => (
              <Question key={q.id} question={q} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
```

### Afficher un Cours avec Chapitres

```tsx
import { useCourse } from "~/hooks/useDocument"
import { CourseOutput } from "~/models/Document"

export function CourseViewer({ courseId }: { courseId: string }) {
  const { data, loading, error } = useCourse(courseId)

  if (loading) return <Loader />
  if (error) return <ErrorAlert error={error} />
  if (!data) return null

  const course = data as CourseOutput

  return (
    <div className="course">
      <h1>{course.title}</h1>
      <div className="chapters">
        {course.chapters.map((chapter) => (
          <Chapter key={chapter.id_chapter} chapter={chapter} />
        ))}
      </div>
    </div>
  )
}
```

## 🔧 Configuration API

L'URL de base est définie par:
```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
```

**À ajouter dans `.env.local`**:
```env
VITE_API_URL=http://localhost:8000
```

## 📝 Endpoints Backend Attendus

- **Exercices**: `POST /testfetchexercise`
  - Params: `session_id` (FormData)
  - Retour: `ExerciseOutput` (JSON)

- **Cours**: `POST /testfetchcourse`
  - Params: `session_id` (FormData)
  - Retour: `CourseOutput` (JSON)

## ✅ Checklist d'Intégration

- [ ] Importer les types depuis `~/models/Document`
- [ ] Utiliser les hooks depuis `~/hooks/useDocument`
- [ ] Ajouter `VITE_API_URL` dans `.env.local`
- [ ] Tester les server functions
- [ ] Implémenter les composants d'affichage
- [ ] Gérer les erreurs appropriées
- [ ] Valider les types avec TypeScript
