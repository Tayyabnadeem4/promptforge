// The prompt templating engine. Variables are written as {{name}} in the prompt
// or system text, surfaced as editable inputs, and interpolated before a run.

const VAR_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Extract the unique, ordered list of {{variable}} names from any text. */
export function extractVariables(...texts: string[]): string[] {
  const seen = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(VAR_PATTERN)) {
      seen.add(match[1]);
    }
  }
  return [...seen];
}

/** Replace every {{variable}} with its value (missing values become ""). */
export function interpolate(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(VAR_PATTERN, (_, name: string) => values[name] ?? "");
}

/** Split text into segments so the editor can highlight {{variables}}. */
export interface Segment {
  text: string;
  isVar: boolean;
}

export function segment(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(VAR_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), isVar: false });
    }
    segments.push({ text: match[0], isVar: true });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isVar: false });
  }
  return segments;
}
