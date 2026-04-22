/**
 * Strip markdown-ish syntax from FAQ body for JSON-LD Answer.text (plain text).
 */
export function faqAnswerPlain(markdown: string): string {
  let s = markdown;
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/^#{1,6}\s+/gm, '');
  s = s.replace(/^\|.*$/gm, ' ');
  s = s.replace(/^[-*]\s+/gm, '');
  s = s.replace(/^\d+\.\s+/gm, '');
  s = s.replace(/[`_]/g, '');
  s = s.replace(/\s+/g, ' ');
  return s.trim();
}
