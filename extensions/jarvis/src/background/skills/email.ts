export interface EmailDraft {
  to?: string;
  subject?: string;
  body?: string;
  cc?: string;
}

/**
 * Opens the user's default mail client via a mailto: link.
 */
export function draftEmail(draft: EmailDraft): void {
  const params: string[] = [];
  if (draft.subject) params.push(`subject=${encodeURIComponent(draft.subject)}`);
  if (draft.body) params.push(`body=${encodeURIComponent(draft.body)}`);
  if (draft.cc) params.push(`cc=${encodeURIComponent(draft.cc)}`);

  const to = draft.to ? encodeURIComponent(draft.to) : '';
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  const mailto = `mailto:${to}${qs}`;

  chrome.tabs.create({ url: mailto });
}

export function buildMailtoUrl(draft: EmailDraft): string {
  const params: string[] = [];
  if (draft.subject) params.push(`subject=${encodeURIComponent(draft.subject)}`);
  if (draft.body) params.push(`body=${encodeURIComponent(draft.body)}`);
  if (draft.cc) params.push(`cc=${encodeURIComponent(draft.cc)}`);
  const to = draft.to ? encodeURIComponent(draft.to) : '';
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${to}${qs}`;
}
