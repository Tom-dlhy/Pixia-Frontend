# 📚 Combined Chat + Document Fetching

## Vue d'ensemble

Système complet pour récupérer **chat ET document ensemble** en un seul appel, car dans la DB:
- `doc_id === session_id` (1 document = 1 session)
- Permet d'afficher un document à gauche et le chat à droite simultanément

## 🔑 Problème résolu

**Avant**: Deux appels séparés
```
fetchChat(sessionId)     →  /testfetchchat
fetchDocument(sessionId) →  /testfetchexercise OU /testfetchcourse
```

**Après**: Un seul appel combiné
```
getChatWithDocument(sessionId, docType?) → Récupère TOUT en parallèle
```

## 📡 Server Function

### `getChatWithDocument`

```typescript
export const getChatWithDocument = createServerFn({ method: "POST" })
  .inputValidator(FetchChatWithDocumentSchema)
  .handler(async ({ data }): Promise<ChatWithDocumentResponse> => {
    const { user_id, session_id, doc_type } = data
    // Retourne: { messages, document, documentType }
  })
```

**Paramètres**:
- `user_id: string` - L'ID utilisateur
- `session_id: string` - L'ID session (= doc_id)
- `doc_type?: "exercise" | "course"` - Type optionnel (sinon essaie les deux)

**Retour**:
```typescript
interface ChatWithDocumentResponse {
  messages: EventMessage[]                          // Messages du chat
  document: ExerciseOutput | CourseOutput | null    // Données du document
  documentType: "exercise" | "course" | null        // Type détecté
}
```

**Logique interne**:
1. Récupère le chat via `/testfetchchat`
2. Récupère l'exercice via `/testfetchexercise` (si `doc_type !== "course"`)
3. Récupère le cours via `/testfetchcourse` (si `doc_type !== "exercise"`)
4. Combine les résultats en parallèle avec `Promise.allSettled()`
5. Priorité document: exercise → course → null

## 🪝 Hook React

### `useChatWithDocument`

```typescript
export function useChatWithDocument(
  sessionId: string | null,
  docType?: "exercise" | "course",
  options?: { autoFetch?: boolean }
): UseChatWithDocumentState
```

**Paramètres**:
- `sessionId` - L'ID de la session
- `docType` - Type optionnel (auto-détection sinon)
- `options.autoFetch` - Fetch automatique au montage (défaut: true)

**Retour**:
```typescript
interface UseChatWithDocumentState {
  messages: EventMessage[]                          // Messages du chat
  document: ExerciseOutput | CourseOutput | null    // Document
  documentType: "exercise" | "course" | null        // Type détecté
  loading: boolean                                   // En cours de chargement
  error: Error | null                                // Erreur si applicable
}
```

## 📝 Exemples d'utilisation

### 1. Cas Simple

```tsx
import { useChatWithDocument } from "~/hooks/useDocument"

export function ChatWithDocView({ sessionId }: { sessionId: string }) {
  const { messages, document, loading, error } = 
    useChatWithDocument(sessionId)

  if (loading) return <Spinner />
  if (error) return <ErrorAlert error={error} />

  return (
    <div className="flex gap-6">
      {/* Document à gauche */}
      <div className="flex-1">
        {document ? <DocumentDisplay doc={document} /> : <div>Pas de doc</div>}
      </div>

      {/* Chat à droite */}
      <div className="flex-1">
        <ChatDisplay messages={messages} />
      </div>
    </div>
  )
}
```

### 2. Avec Type Spécifié

```tsx
// Récupère uniquement les exercices
const { document, messages } = useChatWithDocument(
  sessionId, 
  "exercise"  // Force le type exercice
)

// Récupère uniquement les cours
const { document, messages } = useChatWithDocument(
  sessionId, 
  "course"    // Force le type cours
)
```

### 3. Avec Détection Automatique

```tsx
// Essaie exercise, puis course
const { document, documentType, messages } = useChatWithDocument(
  sessionId
  // pas de docType → auto-détection
)

// Utiliser le type détecté
if (documentType === "exercise") {
  // Afficher comme exercice
} else if (documentType === "course") {
  // Afficher comme cours
}
```

### 4. Composant Complet Exemple

```tsx
import { CombinedDocumentChatView } from "~/components/CombinedDocumentChatView"

export function SessionPage({ sessionId }: { sessionId: string }) {
  return (
    <CombinedDocumentChatView 
      sessionId={sessionId}
      documentType="exercise"  // optionnel
    />
  )
}
```

## 🏗️ Architecture du Flux

```
┌─────────────────────────────────────┐
│  Composant React                     │
│  useChatWithDocument(sessionId)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  Server Function                             │
│  getChatWithDocument({ user_id, session_id }) │
└──────────┬──────────────────────────┬────────┘
           │                          │
    ┌──────▼───────┐           ┌──────▼──────────┐
    │ Promise.all  │           │ Récupère en     │
    │              │           │ parallèle       │
    └──────┬───────┘           └──────┬──────────┘
           │
    ┌──────┴─────────────────────────────┐
    │                                     │
    ▼                    ▼                ▼
┌─────────┐         ┌─────────┐     ┌──────────┐
│ Chat    │         │Exercise │     │ Course   │
│ /fetch  │         │ /fetch  │     │ /fetch   │
│ chat    │         │exercise │     │ course   │
└─────────┘         └─────────┘     └──────────┘
    │                    │               │
    └────────────────┬───┴───────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ ChatWithDocumentResponse│
        │ {messages, document,    │
        │  documentType}          │
        └─────────────────────────┘
```

## ⚡ Optimisations

### 1. Requêtes Parallèles
- Les 3 appels API sont effectués en **parallèle** avec `Promise.allSettled()`
- Temps total = max(chat, exercise, course) au lieu de somme

### 2. Gestion d'Erreurs Robuste
- Une erreur dans un appel n'arrête pas les autres
- Retourne null pour l'erreur, continue avec les autres données

### 3. Auto-Détection Intelligente
- Si `doc_type` n'est pas spécifié, essaie automatiquement
- Priorité: exercise > course > null
- Économise les appels API si on sait déjà le type

## 🔧 Configuration

Dans `.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

## 📊 Cas d'Usage Réels

### Course Page
```tsx
export function CoursePage({ courseId }: { courseId: string }) {
  const { document, messages, documentType } = useChatWithDocument(
    courseId,
    "course"  // On sait que c'est un cours
  )

  return (
    <ChatQuickViewLayout>
      <CourseViewer course={document} />
      <CopiloteContainer messages={messages} />
    </ChatQuickViewLayout>
  )
}
```

### Exercise Page
```tsx
export function ExercisePage({ exerciseId }: { exerciseId: string }) {
  const { document, messages, documentType } = useChatWithDocument(
    exerciseId,
    "exercise"  // On sait que c'est un exercice
  )

  return (
    <ChatQuickViewLayout>
      <ExerciseViewer exercise={document} />
      <CopiloteContainer messages={messages} />
    </ChatQuickViewLayout>
  )
}
```

### Dynamic Page (Auto-Détection)
```tsx
export function DynamicSessionPage({ sessionId }: { sessionId: string }) {
  const { document, documentType, messages, loading } = useChatWithDocument(
    sessionId
    // Pas de type spécifié → auto-détection
  )

  if (loading) return <Loader />

  return documentType === "exercise" ? (
    <ExercisePage exercise={document} messages={messages} />
  ) : documentType === "course" ? (
    <CoursePage course={document} messages={messages} />
  ) : (
    <NoDocumentFound />
  )
}
```

## ✅ Checklist d'Intégration

- [ ] Remplacer les deux appels `getChat()` + `getDocument()` par `getChatWithDocument()`
- [ ] Utiliser le hook `useChatWithDocument` dans les composants
- [ ] Adapter `CopiloteContainer` pour utiliser les messages du hook
- [ ] Adapter `ContentContainer` pour utiliser le document du hook
- [ ] Tester avec exercices ET cours
- [ ] Valider les types TypeScript
- [ ] Tester la gestion d'erreurs

## 📝 Notes

- Le backend attend les deux endpoints: `/testfetchchat`, `/testfetchexercise`, `/testfetchcourse`
- Aucun changement backend nécessaire pour cette optimisation
- C'est une optimisation client-side (combiner 2-3 appels en parallèle)
- Les données sont cachées par React tant que sessionId ne change pas
