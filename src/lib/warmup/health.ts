/**
 * Pure (client-safe) mailbox health calculation. Kept separate from engine.ts
 * so client components can import it without bundling server-only AI code.
 */

export interface MailboxHealthInput {
  reputation: number;
  bounceCount: number;
  spamCount?: number;
  spammed?: number;
  spfStatus: boolean;
  dkimStatus: boolean;
  dmarcStatus: boolean;
  createdAt: Date;
}

/**
 * 0-100 sağlık skoru. Ölçülebilir sinyallerden hesaplanır:
 * DNS kimlik doğrulama (45), itibar (25), yaş (15), taban (15) - bounce/spam cezası.
 */
export function computeMailboxHealth(m: MailboxHealthInput): number {
  const ageDays = Math.max(0, Math.floor((Date.now() - new Date(m.createdAt).getTime()) / 86400000));
  const dns = (m.spfStatus ? 15 : 0) + (m.dkimStatus ? 20 : 0) + (m.dmarcStatus ? 10 : 0);
  const rep = Math.round((Math.min(100, Math.max(0, m.reputation)) / 100) * 25);
  const age = Math.round(Math.min(1, ageDays / 30) * 15);
  const bouncePenalty = Math.min(25, m.bounceCount * 6);
  const spamPenalty = Math.min(30, ((m.spamCount || 0) + (m.spammed || 0)) * 8);
  return Math.max(0, Math.min(100, dns + rep + age + 15 - bouncePenalty - spamPenalty));
}
