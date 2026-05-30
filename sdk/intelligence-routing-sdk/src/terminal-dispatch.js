import crypto from 'node:crypto';

/**
 * @typedef {Object} TerminalConfig
 * @property {'local'|'remote'|'edge'} type - Terminal type
 * @property {string[]} capabilities - What this terminal can execute
 * @property {number} maxConcurrency - Max concurrent commands
 */

/**
 * @typedef {Object} Terminal
 * @property {string} terminalId
 * @property {TerminalConfig} config
 * @property {'idle'|'busy'|'offline'} status
 * @property {number} activeTasks
 * @property {Array<{commandId: string, command: object, startedAt: number}>} queue
 */

/**
 * TerminalDispatch — manages a fleet of execution terminals (local, remote,
 * or edge) and dispatches commands to them. Tracks concurrency, health, and
 * command lifecycle.
 */
export class TerminalDispatch {
  constructor() {
    /** @type {Map<string, Terminal>} */
    this._terminals = new Map();
  }

  /**
   * Creates and registers a new terminal.
   * @param {string} terminalId
   * @param {TerminalConfig} config
   * @returns {Terminal}
   */
  createTerminal(terminalId, config) {
    if (!terminalId) throw new Error('terminalId is required');
    if (this._terminals.has(terminalId)) {
      throw new Error(`Terminal "${terminalId}" already exists`);
    }

    const terminal = {
      terminalId,
      config: {
        type: config?.type ?? 'local',
        capabilities: Array.isArray(config?.capabilities) ? [...config.capabilities] : [],
        maxConcurrency: config?.maxConcurrency ?? 4,
      },
      status: 'idle',
      activeTasks: 0,
      queue: [],
    };

    this._terminals.set(terminalId, terminal);
    return { ...terminal, queue: [] };
  }

  /**
   * Dispatches a command to a specific terminal.
   * Resolves when the command "completes" (simulated with a microtask for
   * in-process execution; real implementations would await remote results).
   * @param {string} terminalId
   * @param {object} command - Command payload (shape determined by consumer)
   * @returns {Promise<{ commandId: string, terminalId: string, result: string, duration: number }>}
   */
  async dispatch(terminalId, command) {
    const terminal = this._terminals.get(terminalId);
    if (!terminal) throw new Error(`Unknown terminal: ${terminalId}`);
    if (terminal.status === 'offline') {
      throw new Error(`Terminal "${terminalId}" is offline`);
    }
    if (terminal.activeTasks >= terminal.config.maxConcurrency) {
      throw new Error(
        `Terminal "${terminalId}" at max concurrency (${terminal.config.maxConcurrency})`,
      );
    }

    const commandId = crypto.randomUUID();
    const startedAt = Date.now();

    terminal.activeTasks += 1;
    terminal.status = 'busy';
    terminal.queue.push({ commandId, command, startedAt });

    try {
      // Simulate asynchronous execution
      await this._execute(terminal, command);

      const duration = Date.now() - startedAt;
      return { commandId, terminalId, result: 'completed', duration };
    } finally {
      terminal.activeTasks -= 1;
      terminal.queue = terminal.queue.filter((q) => q.commandId !== commandId);
      if (terminal.activeTasks === 0) terminal.status = 'idle';
    }
  }

  /**
   * Broadcasts a command to every online terminal.
   * @param {object} command
   * @returns {Promise<Array<{ commandId: string, terminalId: string, result: string, duration: number }>>}
   */
  async broadcast(command) {
    const promises = [];
    for (const [id, terminal] of this._terminals) {
      if (terminal.status !== 'offline') {
        promises.push(this.dispatch(id, command));
      }
    }
    return Promise.allSettled(promises).then((results) =>
      results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value),
    );
  }

  /**
   * Returns current health and load information for a terminal.
   * @param {string} terminalId
   * @returns {{ terminalId: string, status: string, activeTasks: number, maxConcurrency: number, utilization: number }}
   */
  getTerminalStatus(terminalId) {
    const terminal = this._terminals.get(terminalId);
    if (!terminal) throw new Error(`Unknown terminal: ${terminalId}`);

    return {
      terminalId,
      status: terminal.status,
      activeTasks: terminal.activeTasks,
      maxConcurrency: terminal.config.maxConcurrency,
      utilization:
        Math.round(
          (terminal.activeTasks / terminal.config.maxConcurrency) * 100,
        ) / 100,
    };
  }

  /**
   * Lists all terminals and their states.
   * @returns {Array<{ terminalId: string, type: string, status: string, activeTasks: number, capabilities: string[] }>}
   */
  listTerminals() {
    return Array.from(this._terminals.values()).map((t) => ({
      terminalId: t.terminalId,
      type: t.config.type,
      status: t.status,
      activeTasks: t.activeTasks,
      capabilities: [...t.config.capabilities],
    }));
  }

  /* ---- internal ---- */

  /**
   * Simulated execution — yields control to allow concurrency tracking to work
   * correctly. In production, this would delegate to a real runtime.
   * @private
   */
  async _execute(_terminal, _command) {
    return new Promise((resolve) => {
      setImmediate(resolve);
    });
  }
}

export default TerminalDispatch;
