# Affichage Dynamique des Documents de Chapitre

## 📋 Vue d'ensemble

Cette documentation décrit comment afficher dynamiquement les documents (cours, exercice, évaluation) d'un chapitre dans la vue Deep Course.

## 🏗️ Architecture

Le système utilise une architecture en 3 étapes:

```
Route: /deep-course/:deepcourseId/:chapterId
    ↓
DeepCoursesLayout (affiche le header et les onglets)
    ↓
DeepCourseMainContent (affiche le layout avec copilote)
    ↓
ChapterDocumentContainer (charge et affiche le document)
```

## 🔄 Flux de Données

### Étape 1: Récupérer les IDs des Documents du Chapitre

```typescript
const { data: chapterDocs } = useChapterDocuments(chapterId)
// Retourne:
// {
//   chapter_id: "chapter-1",
//   course_session_id: "session-123",
//   exercice_session_id: "session-456",
//   evaluation_session_id: "session-789"
// }
```

**Hook utilisé:** `useChapterDocuments` (`src/hooks/useChapterDocuments.ts`)

**Appel API Backend:** `POST /fetchchapterdocument`
- Input: `chapter_id`
- Output: Les IDs des documents (session_ids)

### Étape 2: Mapper l'Onglet au Type de Document

L'interface utilise les noms français ("cours", "exercice", "evaluation"), mais l'API utilise l'anglais ("course", "exercise").

```typescript
// Mappage dans ChapterDocumentContainer
switch (activeTab) {
  case "cours": → docType = "course"
  case "exercice": → docType = "exercise"
  case "evaluation": → docType = "exercise"
}
```

### Étape 3: Récupérer le Document Complet

Une fois l'ID de session déterminé, on utilise le hook standard `useSessionCache`:

```typescript
const { data } = useSessionCache(sessionId, docType, userId)
// Retourne:
// {
//   document: CourseOutput | ExerciseOutput,
//   documentType: "course" | "exercise",
//   messages: []
// }
```

**Hook utilisé:** `useSessionCache` (déjà existant)

**Appel API Backend (via document.server.ts):** `POST /fetchdocument`
- Input: `session_id`, `type` (course|exercise)
- Output: Le contenu complet du document

### Étape 4: Afficher le Bon Composant

```typescript
if (isExerciseOutput(document)) {
  return <ExerciseViewer exercise={document} />
}
if (isCourseOutput(document)) {
  return <CourseViewer course={document} />
}
```

## 📁 Fichiers Modifiés/Créés

### 1. `src/server/chatApi.ts`
**Nouveau:** Fonction `fetchChapterDocuments`
```typescript
export async function fetchChapterDocuments(
  chapterId: string
): Promise<FetchChapterDocumentsResponse>
```

**Type:** `FetchChapterDocumentsResponse`
```typescript
{
  chapter_id: string
  exercice_session_id: string
  course_session_id: string
  evaluation_session_id: string
}
```

### 2. `src/server/chat.server.ts`
**Nouveau:** Server function `getChapterDocuments`
```typescript
export const getChapterDocuments = createServerFn({ method: "POST" })
  .inputValidator(FetchChapterDocumentsSchema)
  .handler(async ({ data }) => { ... })
```

**Validation:** Zod schema
```typescript
const FetchChapterDocumentsSchema = z.object({
  chapter_id: z.string().min(1),
})
```

### 3. `src/hooks/useChapterDocuments.ts`
**Nouveau:** Hook React Query
```typescript
export function useChapterDocuments(
  chapterId: string | undefined,
  options?: { enabled?: boolean }
)
```

**Caractéristiques:**
- Utilise la stratégie fresh data: `staleTime: 0`, `gcTime: 30s`
- Déduplication automatique via queryKey
- Refetch au montage, focus, reconnect

### 4. `src/layouts/ChapterDocumentContainer.tsx`
**Nouveau:** Composant pour afficher dynamiquement les documents

**Responsabilités:**
- Récupère les IDs des documents du chapitre
- Détermine le document à afficher selon l'onglet actif
- Récupère le contenu du document
- Affiche le bon composant (CourseViewer ou ExerciseViewer)

### 5. `src/layouts/DeepCourseMainContent.tsx`
**Modifié:** Utilise maintenant `ChapterDocumentContainer` au lieu du simple `ContentContainer`

**Avant:**
```tsx
<ContentContainer className="flex-1 h-full" />
```

**Après:**
```tsx
<ContentContainer className="flex-1 h-full">
  <ChapterDocumentContainer />
</ContentContainer>
```

## 🔗 Intégration avec les Composants Existants

Le système s'intègre parfaitement avec les composants existants:

### DeepCourseTabs
- Gère les 3 onglets: "cours", "exercice", "evaluation"
- Utilise le contexte `DeepCoursesLayoutContext`
- Le changement d'onglet redéclenche le chargement du document

### CopiloteContainer
- Affiche le copilote à droite
- Reçoit le `sessionId` du chapitre (pas du document)
- Reste indépendant du contenu affiché

### CourseViewer / ExerciseViewer
- Composants inchangés
- Affichent le contenu du document
- Supportent les deux formats (document simple ou document avec chapitre)

## 🚀 Utilisation

Tout fonctionne automatiquement une fois qu'on navigue vers:
```
/deep-course/:deepcourseId/:chapterId
```

Le flux complet se déclenche:
1. ✅ `ChapterDocumentContainer` monte
2. ✅ Récupère les IDs des documents du chapitre
3. ✅ Récupère le document selon l'onglet actif
4. ✅ Affiche le contenu

En changeant d'onglet:
1. ✅ Le contexte `activeTab` se met à jour
2. ✅ Le `sessionId` change selon l'onglet
3. ✅ `useSessionCache` détecte le changement et refetch
4. ✅ Le nouveau document s'affiche

## 💾 Caching Strategy

**Fresh Data Mode:**
- `staleTime: 0` → Les données sont toujours considérées comme obsolètes
- `gcTime: 30s` → Cache en mémoire pendant 30 secondes (prévient les requêtes en doublon)
- `refetchOnMount: true` → Refetch quand le composant monte
- `refetchOnWindowFocus: true` → Refetch quand la fenêtre récupère le focus
- `refetchOnReconnect: true` → Refetch quand la connexion est rétablie

**Déduplication:**
React Query déduplique automatiquement les requêtes identiques en vol (même `queryKey`).

## 🔍 Debugging

Consultez les logs console:
```
📡 [fetchChapterDocuments] Appel API pour chapter_id: xxx
✅ [fetchChapterDocuments] Documents récupérés pour chapitre xxx
🔍 [useChapterDocuments] Récupération des documents pour chapitre: xxx
🚀 [useSessionCache] Fetching (course|exercise)
```

## 📝 Exemple Complet

Navigate vers `/deep-course/deepcourse-1/chapter-1`:

```typescript
// 1. useChapterDocuments récupère les IDs
📡 Appel: POST /fetchchapterdocument (chapter_id: "chapter-1")
📨 Réponse: {
  chapter_id: "chapter-1",
  course_session_id: "session-111",
  exercice_session_id: "session-222",
  evaluation_session_id: "session-333"
}

// 2. activeTab = "cours" par défaut
// 3. sessionId = "session-111"
// 4. docType = "course"

// 5. useSessionCache récupère le document
📡 Appel: POST /fetchdocument (session_id: "session-111", type: "course")
📨 Réponse: CourseOutput { title: "...", chapters: [...] }

// 6. <CourseViewer> affiche le contenu

// 7. Utilisateur clique sur "exercice"
// 8. activeTab = "exercice"
// 9. sessionId = "session-222"
// 10. docType = "exercise"

// 11. useSessionCache récupère le nouvel exercice
// 12. <ExerciseViewer> affiche le contenu
```

## ✨ Avantages

✅ **Dynamique:** Affiche le bon document selon l'onglet  
✅ **Performant:** Cache avec déduplication  
✅ **Fresh Data:** Toujours données fraîches du backend  
✅ **Réactif:** Changement d'onglet = changement de contenu immédiat  
✅ **Maintenable:** Réutilise les composants existants (CourseViewer, ExerciseViewer)  
✅ **Testable:** Trois étapes claires et séparées  

## 🐛 Troubleshooting

**"Aucun document disponible"**
- Vérifier que l'API retourne bien les session_ids
- Vérifier que les documents existent avec ces IDs

**Document ne se recharge pas au changement d'onglet**
- Vérifier que le contexte `activeTab` se met à jour
- Vérifier que `useDeepCoursesLayout()` retourne le bon contexte

**Requêtes en doublon**
- Vérifier les queryKeys (doivent être différentes pour chaque onglet)
- Vérifier que `gcTime` n'est pas trop court (30s minimum)
