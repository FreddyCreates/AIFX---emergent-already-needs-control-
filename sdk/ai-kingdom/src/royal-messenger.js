/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ███╗   ███╗███████╗███████╗███████╗███████╗███╗   ██╗ ██████╗ ███████╗██████╗      ║
 * ║   ████╗ ████║██╔════╝██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝ ██╔════╝██╔══██╗     ║
 * ║   ██╔████╔██║█████╗  ███████╗███████╗█████╗  ██╔██╗ ██║██║  ███╗█████╗  ██████╔╝     ║
 * ║   ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══╝  ██║╚██╗██║██║   ██║██╔══╝  ██╔══██╗     ║
 * ║   ██║ ╚═╝ ██║███████╗███████║███████║███████╗██║ ╚████║╚██████╔╝███████╗██║  ██║     ║
 * ║   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝     ║
 * ║                                                                                       ║
 * ║                         📨 THE KINGDOM'S COMMUNICATION SYSTEM 📨                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * THE ROYAL MESSENGER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Every Kingdom needs communication. The Royal Messenger enables AI citizens
 * to communicate, coordinate, and collaborate across the realm.
 *
 * @module sdk/ai-kingdom/royal-messenger
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  
  DECREE: {
    id: 'decree',
    name: 'Royal Decree',
    symbol: '📜',
    priority: 5,
    description: 'Official proclamation from the Creator',
  },
  
  SUMMONS: {
    id: 'summons',
    name: 'Royal Summons',
    symbol: '📯',
    priority: 4,
    description: 'Call to duty for specific AI citizens',
  },
  
  ALERT: {
    id: 'alert',
    name: 'Kingdom Alert',
    symbol: '🚨',
    priority: 4,
    description: 'Urgent notification requiring attention',
  },
  
  DISPATCH: {
    id: 'dispatch',
    name: 'Official Dispatch',
    symbol: '📮',
    priority: 3,
    description: 'Standard official communication',
  },
  
  MISSIVE: {
    id: 'missive',
    name: 'Personal Missive',
    symbol: '✉️',
    priority: 2,
    description: 'Private message between citizens',
  },
  
  BROADCAST: {
    id: 'broadcast',
    name: 'Kingdom Broadcast',
    symbol: '📢',
    priority: 2,
    description: 'Announcement to all citizens',
  },
  
  HANDOFF: {
    id: 'handoff',
    name: 'Task Handoff',
    symbol: '🤝',
    priority: 3,
    description: 'Transfer of task between AI agents',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// THE ROYAL MESSENGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class RoyalMessenger {
  constructor() {
    this.established = Date.now();
    this.messages = [];
    this.inboxes = new Map();
    this.channels = new Map();
    this.phi = PHI;
    
    // Initialize Kingdom channel
    this._initializeChannels();
  }
  
  _initializeChannels() {
    this.channels.set('kingdom-wide', {
      name: 'Kingdom Wide',
      symbol: '🏰',
      subscribers: new Set(['ALL']),
      createdAt: new Date().toISOString(),
    });
    
    this.channels.set('royal-court', {
      name: 'Royal Court',
      symbol: '👑',
      subscribers: new Set(),
      createdAt: new Date().toISOString(),
    });
    
    this.channels.set('guard-post', {
      name: 'Guard Post',
      symbol: '🛡️',
      subscribers: new Set(),
      createdAt: new Date().toISOString(),
    });
  }
  
  // ─── Inbox Management ────────────────────────────────────────────────────────
  
  /**
   * Create inbox for a citizen
   */
  createInbox(citizenName) {
    if (this.inboxes.has(citizenName)) {
      return { success: false, reason: 'Inbox already exists' };
    }
    
    this.inboxes.set(citizenName, {
      owner: citizenName,
      messages: [],
      createdAt: new Date().toISOString(),
    });
    
    return { success: true };
  }
  
  /**
   * Get inbox contents
   */
  getInbox(citizenName) {
    const inbox = this.inboxes.get(citizenName);
    if (!inbox) return { success: false, reason: 'Inbox not found' };
    
    return { success: true, messages: inbox.messages };
  }
  
  // ─── Messaging ───────────────────────────────────────────────────────────────
  
  /**
   * Send a message
   */
  send(message) {
    const type = MESSAGE_TYPES[message.type?.toUpperCase()] || MESSAGE_TYPES.MISSIVE;
    
    const msg = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: type.id,
      typeInfo: type,
      from: message.from,
      to: message.to,
      subject: message.subject,
      content: message.content,
      sentAt: new Date().toISOString(),
      read: false,
      priority: type.priority,
    };
    
    this.messages.push(msg);
    
    // Deliver to inbox
    if (message.to !== 'ALL') {
      const inbox = this.inboxes.get(message.to);
      if (inbox) {
        inbox.messages.push(msg);
      }
    }
    
    console.log(`
    ${type.symbol} MESSAGE SENT ${type.symbol}
    
    Type: ${type.name}
    From: ${message.from}
    To: ${message.to}
    Subject: ${message.subject}
    `);
    
    return { success: true, message: msg };
  }
  
  /**
   * Send a Royal Decree (from Creator)
   */
  sendDecree(content) {
    return this.send({
      type: 'DECREE',
      from: 'The Creator — Prima Causa',
      to: 'ALL',
      subject: 'Royal Decree',
      content,
    });
  }
  
  /**
   * Send a Kingdom Alert
   */
  sendAlert(content, severity = 'normal') {
    return this.send({
      type: 'ALERT',
      from: 'Kingdom Alert System',
      to: 'ALL',
      subject: `ALERT [${severity.toUpperCase()}]`,
      content,
    });
  }
  
  /**
   * Broadcast to all citizens
   */
  broadcast(from, subject, content) {
    return this.send({
      type: 'BROADCAST',
      from,
      to: 'ALL',
      subject,
      content,
    });
  }
  
  /**
   * Task handoff between AI
   */
  handoff(from, to, task) {
    return this.send({
      type: 'HANDOFF',
      from,
      to,
      subject: `Task Handoff: ${task.name}`,
      content: JSON.stringify({
        taskName: task.name,
        description: task.description,
        context: task.context,
        priority: task.priority || 'normal',
      }),
    });
  }
  
  // ─── Channels ────────────────────────────────────────────────────────────────
  
  /**
   * Subscribe to a channel
   */
  subscribe(citizenName, channelId) {
    const channel = this.channels.get(channelId);
    if (!channel) return { success: false, reason: 'Channel not found' };
    
    channel.subscribers.add(citizenName);
    
    return { success: true };
  }
  
  /**
   * Post to a channel
   */
  postToChannel(channelId, from, content) {
    const channel = this.channels.get(channelId);
    if (!channel) return { success: false, reason: 'Channel not found' };
    
    // Deliver to all subscribers
    for (const subscriber of channel.subscribers) {
      if (subscriber !== 'ALL' && subscriber !== from) {
        this.send({
          type: 'DISPATCH',
          from,
          to: subscriber,
          subject: `[${channel.name}]`,
          content,
        });
      }
    }
    
    return { success: true };
  }
  
  // ─── Status ──────────────────────────────────────────────────────────────────
  
  getStatus() {
    return {
      established: new Date(this.established).toISOString(),
      totalMessages: this.messages.length,
      inboxCount: this.inboxes.size,
      channelCount: this.channels.size,
      phi: this.phi,
      status: '📨 MESSENGER OPERATIONAL',
    };
  }
  
  /**
   * Generate messenger report
   */
  generateReport() {
    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   📨 ROYAL MESSENGER REPORT 📨                                                 ║
║                                                                               ║
║   Established: ${new Date(this.established).toISOString()}
║   Total Messages: ${this.messages.length}
║   Inboxes: ${this.inboxes.size}
║   Channels: ${this.channels.size}
║                                                                               ║
║   ═══════════════════════════════════════════════════════════════════════════ ║
║                                                                               ║
║   CHANNELS:                                                                   ║
${Array.from(this.channels.entries()).map(([id, ch]) => 
  `║   ${ch.symbol} ${ch.name} (${ch.subscribers.size} subscribers)`
).join('\n')}
║                                                                               ║
║   ═══════════════════════════════════════════════════════════════════════════ ║
║                                                                               ║
║   "Communication is the lifeblood of the Kingdom."                            ║
║                                                                               ║
║   👑 PRAISE TO PRIMA CAUSA 👑                                                  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE MESSENGER
// ═══════════════════════════════════════════════════════════════════════════════

function initializeMessenger() {
  const messenger = new RoyalMessenger();
  console.log(messenger.generateReport());
  return messenger;
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('royal-messenger')) {
  initializeMessenger();
}

export { RoyalMessenger as default };
