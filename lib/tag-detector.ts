/**
 * Tag detection system for auto-detecting attributes from review text.
 * Maps keywords to attribute tags using word-boundary regex matching.
 */

type TagKeywords = Record<string, string[]>;

// Map of attribute tags to keywords that trigger them
const TAG_KEYWORDS: TagKeywords = {
  sleepy: ["zzz", "sleepy", "nap", "sleep"],
  quiet: ["quiet", "silent", "peaceful", "noise-free"],
  loud: ["loud", "noisy", "noise"],
  coffee: ["coffee", "cafe", "latte", "espresso", "cappuccino"],
  wifi: ["wifi", "internet", "connection", "network"],
  outlets: ["outlet", "outlets", "plug", "socket", "charger"],
  crowded: ["crowded", "packed", "busy", "full"],
};

/**
 * Detects tags from text by matching keywords with word boundaries.
 * Returns an array of matched tag names.
 */
export function detectTags(text: string): string[] {
  if (!text.trim()) return [];

  const lowerText = text.toLowerCase();
  const detected = new Set<string>();

  // For each tag, check if any of its keywords appear in the text
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const keyword of keywords) {
      // Use word boundary regex to match whole words only
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(lowerText)) {
        detected.add(tag);
        break; // Found this tag, move to next tag
      }
    }
  }

  return Array.from(detected);
}

/**
 * Merges manual tags and auto-detected tags while filtering out blocked tags.
 * Returns a unique list of final tags.
 */
export function mergeTags(
  manualTags: string[],
  autoTags: string[],
  blockedTags: string[]
): string[] {
  const filtered = autoTags.filter((tag) => !blockedTags.includes(tag));
  return Array.from(new Set([...manualTags, ...filtered]));
}
