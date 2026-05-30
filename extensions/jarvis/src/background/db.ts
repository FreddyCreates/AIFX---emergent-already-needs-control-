import Dexie, { type EntityTable } from 'dexie';
import type { Note, JarvisDocument, TempleEntry } from './types';

interface NoteRecord extends Note { pk?: number }
interface DocRecord extends JarvisDocument { pk?: number }
interface TempleRecord extends TempleEntry {
  pk?: number;
  category: string;
}
interface ConversationRecord {
  pk?: number;
  role: string;
  text: string;
  intent: string;
  timestamp: number;
}

export class JarvisDB extends Dexie {
  notes!: EntityTable<NoteRecord, 'pk'>;
  documents!: EntityTable<DocRecord, 'pk'>;
  temple!: EntityTable<TempleRecord, 'pk'>;
  conversation!: EntityTable<ConversationRecord, 'pk'>;

  constructor() {
    super('JarvisDB');
    this.version(1).stores({
      notes: '++pk, id, timestamp',
      documents: '++pk, id, timestamp, type',
      temple: '++pk, category, timestamp',
      conversation: '++pk, role, timestamp',
    });
  }
}

export const db = new JarvisDB();

export async function dbAddNote(note: Note): Promise<void> {
  await db.notes.add({ ...note });
}

export async function dbGetNotes(): Promise<Note[]> {
  const rows = await db.notes.orderBy('timestamp').reverse().toArray();
  return rows.map(r => ({ id: r.id, content: r.content, author: r.author, timestamp: r.timestamp, date: r.date }));
}

export async function dbDeleteNote(noteId: number): Promise<boolean> {
  const row = await db.notes.where('id').equals(noteId).first();
  if (!row?.pk) return false;
  await db.notes.delete(row.pk);
  return true;
}

export async function dbAddDocument(doc: JarvisDocument): Promise<void> {
  await db.documents.add({ ...doc });
}

export async function dbGetDocuments(): Promise<JarvisDocument[]> {
  const rows = await db.documents.orderBy('timestamp').reverse().toArray();
  return rows.map(r => ({ id: r.id, title: r.title, content: r.content, author: r.author, type: r.type, timestamp: r.timestamp, date: r.date }));
}

export async function dbAddTempleEntry(category: string, entry: TempleEntry): Promise<void> {
  await db.temple.add({ ...entry, category });
}

export async function dbGetTempleEntries(category: string, limit = 50): Promise<TempleEntry[]> {
  const rows = (await db.temple.where('category').equals(category).sortBy('timestamp')).reverse();
  return rows.slice(0, limit).map(r => ({ text: r.text, intent: r.intent, mood: r.mood, timestamp: r.timestamp }));
}

export async function dbAddConversation(role: string, text: string, intent: string): Promise<void> {
  await db.conversation.add({ role, text, intent, timestamp: Date.now() });
  const count = await db.conversation.count();
  if (count > 100) {
    const oldest = await db.conversation.orderBy('timestamp').first();
    if (oldest?.pk) await db.conversation.delete(oldest.pk);
  }
}
