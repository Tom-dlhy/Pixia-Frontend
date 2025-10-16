"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function DocPanel() {
  const mockMarkdown = `
# Introduction au Machine Learning

Le **machine learning** (ou apprentissage automatique) est un domaine de l'intelligence artificielle 
qui permet aux ordinateurs **d'apprendre à partir des données** sans être explicitement programmés.

## Concepts clés
- *Dataset* : ensemble des données utilisées pour l'entraînement.
- *Modèle* : fonction qui apprend les relations entre les données d'entrée et de sortie.
- *Overfitting* : quand un modèle apprend trop bien les exemples d'entraînement.

## Exemple de code
\`\`\`python
from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4]]
y = [2, 4, 6, 8]

model = LinearRegression()
model.fit(X, y)
print(model.predict([[5]]))  # Résultat attendu : 10
\`\`\`

## Conclusion
Le machine learning repose sur la **collecte de données**, le **choix d'un modèle adapté**, 
et la **validation** pour éviter le sur-apprentissage.
`

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{mockMarkdown}</ReactMarkdown>
    </div>
  )
}
