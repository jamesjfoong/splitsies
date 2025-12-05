/**
 * Color generation utilities
 */

/**
 * Generate a consistent, vibrant color from a string (e.g., person's name)
 * Uses HSL for accessibility and visual appeal
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate hue (0-360)
  const hue = Math.abs(hash % 360);

  // Use consistent saturation and lightness for vibrant, accessible colors
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Generate a random vibrant color
 * Useful for initial color assignment
 */
export function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(bgColor: string): string {
  // Simple implementation - for HSL, check lightness
  const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#ffffff";

  const lightness = Number.parseInt(match[3] ?? "50", 10);
  return lightness > 50 ? "#000000" : "#ffffff";
}
