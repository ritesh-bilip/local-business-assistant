import type { Source } from "../api/rag";

export function formatCitation(s: Source): string {
  const page = s.page != null ? ` · p.${s.page}` : "";
  return `${s.filename}${page}`;
}