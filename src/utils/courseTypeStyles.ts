import type { CourseType } from "~/context/CourseTypeContext"

export type CourseAccent = {
	gradient: string
	glow: string
	accent: string
	accentMuted: string
}

const DEFAULT_ACCENT: CourseAccent = {
	gradient:
		"linear-gradient(135deg, rgba(148,163,184,0.85) 0%, rgba(71,85,105,0.95) 45%, rgba(30,41,59,0.92) 100%)",
	glow: "0 0 46px rgba(148,163,184,0.25)",
	accent: "#94a3b8",
	accentMuted: "rgba(148,163,184,0.16)",
}

const ACCENTS: Record<CourseType, CourseAccent> = {
	none: DEFAULT_ACCENT,
	exercice: {
		gradient:
			"linear-gradient(130deg, rgba(59,130,246,0.95) 0%, rgba(14,116,144,0.9) 40%, rgba(59,130,246,0.92) 100%)",
		glow: "0 0 48px rgba(37, 100, 235, 0.1)",
		accent: "#3b82f6",
		accentMuted: "rgba(59,130,246,0.15)",
	},
	cours: {
		gradient:
			"linear-gradient(130deg, rgba(52,211,153,0.95) 0%, rgba(34,197,94,0.9) 40%, rgba(45,212,191,0.92) 100%)",
		glow: "0 0 48px rgba(34,197,94,0.1)",
		accent: "#22c55e",
		accentMuted: "rgba(34,197,94,0.15)",
	},
	discuss: {
		gradient:
		"linear-gradient(130deg, rgba(147,51,234,0.95) 0%, rgba(168,85,247,0.9) 40%, rgba(196,181,253,0.9) 100%)",
		glow: "0 0 48px rgba(147,51,234,0.1)",
		accent: "#9333ea",
		accentMuted: "rgba(147,51,234,0.18)",
	},
	deep: {
		gradient:
			"linear-gradient(135deg, rgba(244,114,182,0.95) 0%, rgba(192,38,211,0.9) 35%, rgba(56,189,248,0.9) 70%, rgba(244,114,182,0.95) 100%)",
		glow: "0 0 50px rgba(244,114,182,0.25)",
		accent: "#ec4899",
		accentMuted: "rgba(236,72,153,0.16)",
	},
}

export function getCourseAccent(type: CourseType | undefined): CourseAccent {
	if (!type) return DEFAULT_ACCENT
	return ACCENTS[type] ?? DEFAULT_ACCENT
}
