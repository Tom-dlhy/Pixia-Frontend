const tailwindColorMap: Record<string, string> = {
  // Reds
  "red-500": "239, 68, 68",
  "red-600": "220, 38, 38",
  // Oranges
  "orange-500": "249, 115, 22",
  "orange-600": "234, 88, 12",
  // Ambers
  "amber-200": "253, 230, 138",
  "amber-300": "252, 211, 77",
  "amber-500": "245, 158, 11",
  // Yellows
  "yellow-200": "254, 240, 138",
  "yellow-400": "250, 204, 21",
  "yellow-500": "234, 179, 8",
  // Limes
  "lime-400": "132, 204, 22",
  "lime-500": "132, 204, 22",
  // Greens
  "green-500": "34, 197, 94",
  "green-600": "22, 163, 74",
  // Emeralds
  "emerald-400": "52, 211, 153",
  "emerald-500": "16, 185, 129",
  "emerald-600": "5, 150, 105",
  // Teals
  "teal-200": "153, 246, 228",
  "teal-400": "45, 212, 191",
  "teal-500": "20, 184, 166",
  // Cyans
  "cyan-400": "34, 211, 238",
  "cyan-500": "6, 182, 212",
  // Blues
  "blue-500": "59, 130, 246",
  "blue-600": "37, 99, 235",
  "blue-800": "30, 58, 138",
  // Indigos
  "indigo-400": "129, 140, 248",
  "indigo-500": "99, 102, 241",
  "indigo-600": "79, 70, 229",
  "indigo-900": "37, 35, 126",
  // Violets
  "violet-500": "168, 85, 247",
  "violet-600": "147, 51, 234",
  // Purples
  "purple-500": "168, 85, 247",
  "purple-600": "147, 51, 234",
  "purple-900": "88, 28, 135",
  // Pinks
  "pink-500": "236, 72, 153",
  "pink-600": "219, 39, 119",
  // Roses
  "rose-400": "251, 113, 133",
  "rose-500": "244, 63, 94",
  "fuchsia-500": "217, 70, 239",
  "fuchsia-600": "192, 24, 224",
  // Grays
  "gray-400": "156, 163, 175",
}

export function convertTailwindGradientToCss(tailwindGradient: string): string {
  const directionMatch = tailwindGradient.match(/to-(\w+)/);
  const directionMap: Record<string, string> = {
    "br": "to bottom right",
    "b": "to bottom",
    "bl": "to bottom left",
    "l": "to left",
    "tl": "to top left",
    "t": "to top",
    "tr": "to top right",
    "r": "to right",
  };
  
  const direction = directionMap[directionMatch?.[1] || "br"] || "to bottom right";

  const fromMatch = tailwindGradient.match(/from-([a-z]+-\d+)/);
  const toMatch = tailwindGradient.match(/to-([a-z]+-\d+)/);
  
  const fromColor = fromMatch ? tailwindColorMap[fromMatch[1]] || tailwindColorMap["gray-400"] : tailwindColorMap["gray-400"];
  const toColor = toMatch ? tailwindColorMap[toMatch[1]] || tailwindColorMap["gray-400"] : tailwindColorMap["gray-400"];

  return `linear-gradient(${direction}, rgb(${fromColor}), rgb(${toColor}))`;
}

export function extractPrimaryColor(gradientClass: string): string {
  const match = gradientClass.match(/from-([a-z]+-\d+)/);
  return match ? match[1] : "gray-400";
}

export function getColorBorderStyle(colorClass: string): string {
  const rgb = tailwindColorMap[colorClass] || tailwindColorMap["gray-400"];
  return `3px solid rgba(${rgb}, 0.6)`;
}
