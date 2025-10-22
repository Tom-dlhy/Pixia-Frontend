'use client'

import { MarkdownRenderer } from '~/components/MarkdownRenderer'

export function MarkdownTest() {
  const testContent = `# Chapitre 1: Introduction très longue qui devrait se wraper correctement sur plusieurs lignes

Ceci est un **paragraphe** avec du texte en *italique* et du \`code inline\`.

## Sous-titre

Voici une liste :
- Élément 1 avec du **texte en gras**
- Élément 2 qui est plus long et contient de l'*italique*
- Élément 3 normal

\`\`\`javascript
function hello() {
  console.log("Hello World!")
}
\`\`\`

> Ceci est une citation avec du *texte italique*.

Et voici un paragraphe normal avec du **gras** et de l'*italique*.`

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test du MarkdownRenderer</h1>
      <div className="border rounded-lg p-4 bg-card">
        <MarkdownRenderer content={testContent} />
      </div>
    </div>
  )
}