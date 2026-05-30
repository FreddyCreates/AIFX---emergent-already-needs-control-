export interface ParsedCommand {
  raw: string;
  intent: string;
  confidence: number;
  matchedKeywords: string[];
  params: Record<string, unknown>;
  tokens: string[];
  timestamp: number;
}

export interface CommandEntry {
  id: number;
  raw: string;
  intent: string;
  confidence: number;
  timestamp: number;
  agent: { id: string; name: string; domain: string } | null;
}

export interface Note {
  id: number;
  content: string;
  author: string;
  timestamp: number;
  date: string;
}

export interface JarvisDocument {
  id: number;
  title: string;
  content: string;
  author: string;
  type: 'document' | 'pdf' | 'excel';
  timestamp: number;
  date: string;
}

export interface MemoryTemple {
  research: TempleEntry[];
  theory: TempleEntry[];
  decisions: TempleEntry[];
  frameworks: TempleEntry[];
  insights: TempleEntry[];
}

export interface TempleEntry {
  text: string;
  intent: string;
  mood: string;
  timestamp: number;
}

export interface JarvisStatus {
  heartbeatCount: number;
  commandCount: number;
  uptime: number;
  uptimeFormatted: string;
  version: string;
  agentCount: number;
  mood: string;
  focus: string;
  awarenessLevel: number;
  memoryTempleStats: { stats: Record<string, number>; total: number };
  memoryTurns: number;
}

export interface SearchResult {
  type: 'answer' | 'abstract' | 'related';
  title: string;
  text: string;
  url: string;
  source: string;
}

export type MessageAction =
  | 'executeCommand'
  | 'parseCommand'
  | 'getHistory'
  | 'getStatus'
  | 'listTabs'
  | 'listNotes'
  | 'deleteNote'
  | 'takeNote'
  | 'screenshot'
  | 'readPage'
  | 'summarize'
  | 'openSidePanel'
  | 'getAgents'
  | 'listDocuments'
  | 'switchTab'
  | 'sandboxSearch'
  | 'captureTab'
  | 'getNeuroState'
  | 'getUpdateStatus'
  | 'getMemoryTemple'
  | 'addTempleEntry'
  | 'runSovereignTool'
  | 'autoInstallUpdate'
  | 'downloadJarvisZip'
  | 'downloadJarvisBat'
  | 'generatePdf'
  | 'generateExcel'
  | 'draftEmail';
