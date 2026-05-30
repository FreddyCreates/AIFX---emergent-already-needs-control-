import { create } from 'zustand';

interface Message {
  role: 'user' | 'animus';
  text: string;
  ts: number;
}

interface JarvisState {
  messages: Message[];
  isTyping: boolean;
  activePanel: string;
  heartbeatCount: number;
  uptime: number;
  commandCount: number;
  mood: string;
  awareness: number;
  memTurns: number;
  micListening: boolean;
  ttsEnabled: boolean;
  workspaceText: string;
  notes: any[];
  docs: any[];
  openTabs: any[];
  // Live neurochemical state (concentrations normalized to baseline = 1.0)
  neuroChem: {
    DA: number; SE: number; NE: number;
    CO: number; ACh: number; OX: number;
  };
  neuroMood: string;
  neuroEnergy: number;
  neuroState: string;
}

interface JarvisActions {
  addMessage: (msg: Message) => void;
  setTyping: (typing: boolean) => void;
  setActivePanel: (panel: string) => void;
  setStatus: (status: { heartbeatCount?: number; uptime?: number; commandCount?: number; mood?: string; awareness?: number; memTurns?: number; neuroChem?: { DA: number; SE: number; NE: number; CO: number; ACh: number; OX: number }; neuroMood?: string; neuroEnergy?: number; neuroState?: string }) => void;
  setMicListening: (listening: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setWorkspaceText: (text: string) => void;
  setNotes: (notes: any[]) => void;
  setDocs: (docs: any[]) => void;
  setOpenTabs: (tabs: any[]) => void;
  clearMessages: () => void;
}

export const useJarvisStore = create<JarvisState & JarvisActions>()((set) => ({
  messages: [],
  isTyping: false,
  activePanel: 'chat',
  heartbeatCount: 0,
  uptime: 0,
  commandCount: 0,
  mood: 'focused',
  awareness: 0,
  memTurns: 0,
  micListening: false,
  ttsEnabled: false,
  workspaceText: '',
  notes: [],
  docs: [],
  openTabs: [],
  neuroChem: { DA: 1, SE: 1, NE: 1, CO: 1, ACh: 1, OX: 1 },
  neuroMood: 'focused',
  neuroEnergy: 50,
  neuroState: 'nominal',

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setTyping: (typing) => set({ isTyping: typing }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setStatus: (status) => set((state) => ({ ...state, ...status })),
  setMicListening: (listening) => set({ micListening: listening }),
  setTtsEnabled: (enabled) => set({ ttsEnabled: enabled }),
  setWorkspaceText: (text) => set({ workspaceText: text }),
  setNotes: (notes) => set({ notes }),
  setDocs: (docs) => set({ docs }),
  setOpenTabs: (tabs) => set({ openTabs: tabs }),
  clearMessages: () => set({ messages: [] }),
}));
