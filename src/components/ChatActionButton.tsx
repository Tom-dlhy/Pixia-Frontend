"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Mail, FileText, Database, HardDrive, Menu } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { useCourseType } from "~/context/CourseTypeContext"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { useCourseContent } from "~/context/CourseContentContext"
import { PdfReport } from "~/utils/generatePdfReport"
import { cn } from "~/lib/utils"

export interface ChatActionButtonProps {
  contentRef?: React.RefObject<HTMLDivElement | null>
}

export function ChatActionButton({ contentRef }: ChatActionButtonProps) {
  const { courseType } = useCourseType()
  const { title: documentTitle } = useDocumentTitle()
  const { course } = useCourseContent()
  const [isGenerating, setIsGenerating] = useState(false)

  // Ne pas afficher le bouton si ce n'est pas un cours
  if (courseType === 'exercice' || courseType === 'discuss' || courseType === 'deep') {
    return null
  }

  console.log('👁️ [ChatActionButton] Course available:', !!course)
  if (course) {
    console.log('👁️ [ChatActionButton] Course title:', course.title)
    console.log('👁️ [ChatActionButton] Chapters:', course.chapters.length)
    course.chapters.forEach((ch, idx) => {
      console.log(`  📖 Chapter ${idx}: ${ch.title}`)
      console.log(`     - Has img_base64: ${!!ch.img_base64}`)
      if (ch.img_base64) {
        console.log(`     - Image size: ${ch.img_base64.length} bytes`)
      }
    })
  }

  const filename = `${documentTitle || 'export'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`

  // Palette d'accents cohérente avec ton style global
  const accentMap: Record<string, { light: string; dark: string }> = {
    none: { light: "rgba(209,213,219,0.3)", dark: "rgba(82,82,91,0.25)" },
    cours: { light: "rgba(167,243,208,0.25)", dark: "rgba(16,185,129,0.25)" },
    exercice: { light: "rgba(147,197,253,0.25)", dark: "rgba(56,189,248,0.25)" },
    discuss: { light: "rgba(216,180,254,0.25)", dark: "rgba(139,92,246,0.25)" },
    deep: { light: "rgba(203,213,225,0.25)", dark: "rgba(71,85,105,0.25)" },
  }

  const accent = accentMap[courseType] ?? accentMap["none"]

  return (
    <DropdownMenu>
      {/* ——— MAIN BUTTON ——— */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
            "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
            "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)]",
            "hover:scale-[1.03]"
          )}
          style={{
            background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
          }}
        >
          <Menu className="h-4 w-4 opacity-90" />
        </Button>
      </DropdownMenuTrigger>

      {/* ——— MENU CONTENT ——— */}
      <DropdownMenuContent
        className={cn(
          "min-w-56 rounded-xl border border-white/20 dark:border-white/10 p-2",
          "backdrop-blur-xl backdrop-saturate-150",
          "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(24,24,27,0.4)]",
          "shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]"
        )}
        side="bottom"
        align="end"
        sideOffset={8}
      >
        {[
          {
            label: "Envoyer par mail",
            icon: Mail,
            action: () => console.log("Envoyer par mail"),
            isPdf: false,
          },
          {
            label: "Enregistrer dans Notion",
            icon: Database,
            action: () => console.log("Enregistrer dans Notion"),
            isPdf: false,
          },
          {
            label: "Enregistrer sur Drive",
            icon: HardDrive,
            action: () => console.log("Enregistrer sur Drive"),
            isPdf: false,
          },
          {
            label: "Enregistrer en PDF",
            icon: FileText,
            action: null,
            isPdf: true,
          },
        ].map(({ label, icon: Icon, action, isPdf }, idx, arr) => (
          <div key={label}>
            {/* ——— ITEM BUTTON ——— */}
            {isPdf && course ? (
              <PDFDownloadLink
                document={<PdfReport course={course} />}
                fileName={filename}
                className={cn(
                  "w-full flex justify-start gap-2 items-center px-2 py-1.5 text-foreground rounded-md transition-all duration-300",
                  "border border-transparent text-sm",
                  "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
                )}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  cursor: isGenerating ? 'wait' : 'pointer',
                }}
                onClick={() => setIsGenerating(true)}
              >
                <Icon className="h-4 w-4 opacity-80" />
                {isGenerating ? "Génération..." : label}
              </PDFDownloadLink>
            ) : (
              <Button
                variant="ghost"
                onClick={action || undefined}
                className={cn(
                  "w-full justify-start gap-2 text-foreground rounded-md transition-all duration-300",
                  "border border-transparent",
                  "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
                )}
                style={{
                  background: `linear-gradient(135deg, transparent, transparent)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                  e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, transparent, transparent)`
                  e.currentTarget.style.backdropFilter = "blur(10px) saturate(100%)"
                }}
              >
                <Icon className="h-4 w-4 opacity-80" />
                {label}
              </Button>
            )}

            {idx < arr.length - 1 && (
              <DropdownMenuSeparator className="my-1 opacity-20" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

