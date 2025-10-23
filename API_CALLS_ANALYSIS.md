# 📊 Analyse des Appels API - Deep Course vs Course/Exercise

## Flux sur `/course/$id` et `/exercise/$id`

```
AppSidebar.tsx
  ↓
handleSessionClick()
  ├─ 1️⃣ getChat(user_id, session_id)                         [POST /api/testfetchchat]
  │   └─ Récupère les messages existants
  │
  └─ navigate() → ChatQuickViewLayout
       ↓
       useChatWithDocument()
         ├─ 2️⃣ getChatWithDocument(user_id, session_id, docType="auto-detect")
         │   ├─ 2a) getChat() + tentative getExercise() + tentative getCourse()
         │   ├─ [POST /api/testfetchchat] - Récupère messages
         │   ├─ [POST /api/testfetchexercise] - Auto-détection
         │   └─ [POST /api/testfetchcourse] - Auto-détection
         │
         └─ Affiche le résultat (soit course, soit exercise)

⚠️ PROBLÈME: Les messages sont fetchés 2 fois
  - 1x dans handleSessionClick()
  - 1x dans useChatWithDocument()
```

---

## Flux sur `/deep-course/$deepcourseId/$chapterId`

```
DeepCoursesLayout.tsx
  ↓
DeepCourseMainContent.tsx (depth === 3)
  ↓
ChapterDocumentContainer.tsx
  ├─ 1️⃣ useChapterDocuments(chapterId)
  │   └─ getChapterDocuments(chapter_id)
  │       [POST /api/... ]  ← Récupère les 3 IDs:
  │       {
  │         course_session_id: "...",
  │         exercice_session_id: "...",
  │         evaluation_session_id: "..."
  │       }
  │
  └─ useSessionCache(sessionId, docType, userId)
      ├─ 2️⃣ getChatWithDocument(user_id, session_id, docType="cours"|"exercice"|"evaluation")
      │   [POST /api/testfetchcourse] ou [POST /api/testfetchexercise]
      │   └─ Récupère les messages + le document
      │
      └─ Affiche CourseViewer ou ExerciseViewer

BONUS: Quand on change d'onglet (cours → exercice → evaluation)
  └─ 3️⃣ useSessionCache() refetch (sessionId change)
      ├─ [POST /api/testfetchcourse]
      ├─ [POST /api/testfetchexercise]
      └─ [POST /api/testfetchevaluation]
```

---

## Résumé Comparatif

| Route | Appels Initiaux | Appels par changement d'onglet | Cache | 
|-------|---------|------------|-------|
| `/course/$id` | 3 (1 dupliqué) | N/A | ✅ React Query |
| `/exercise/$id` | 3 (1 dupliqué) | N/A | ✅ React Query |
| `/deep-course/$deepcourseId/$chapterId` | 2 ✅ | 1 par onglet | ✅ React Query |

---

## 📈 Optimisations Possible

### Option 1: Éliminer l'appel dupliqué dans `/course` et `/exercise`
- Supprimer `handleSessionClick()` → `getChat()`
- Laisser `useChatWithDocument()` faire tout le travail
- **Économie: 1 appel par ouverture**

### Option 2: Prefetch les onglets suivants
```typescript
// Quand utilisateur arrive sur un chapitre
prefetch(exercice_session_id, "exercise")
prefetch(evaluation_session_id, "exercise")

// Résultat: les onglets se chargent instantanément
```

### Option 3: Batch les requêtes
```typescript
// Au lieu de 3 appels séparés pour les 3 documents
// Faire 1 appel: getChapterDocumentsWithContent(chapter_id)
// Retourne directement: { course, exercise, evaluation }
```

---

## 🎯 Recommandation

**Pour `/deep-course`** : C'est déjà optimisé! ✅
- 2 appels initiaux (logique et nécessaire)
- Cache React Query fonctionne bien
- Onglets se chargent rapidement

**Pour `/course` et `/exercise`** : À nettoyer
- Supprimer l'appel dupliqué dans AppSidebar
- Utiliser uniquement `useChatWithDocument()` et `useSessionCache()`
