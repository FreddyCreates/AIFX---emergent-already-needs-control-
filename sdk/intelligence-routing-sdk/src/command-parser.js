/**
 * @typedef {Object} ParsedCommand
 * @property {string} action - The primary action/verb
 * @property {string|null} target - The target of the action
 * @property {Record<string, string>} params - Key-value parameters
 * @property {string[]} flags - Boolean flags (e.g. --verbose)
 * @property {string} raw - Original raw input
 */

/**
 * CommandParser — parses natural language or structured commands into a
 * normalised action/target/params structure. Supports custom command
 * registration with regex or keyword matching, validation, and completion
 * suggestions.
 */
export class CommandParser {
  constructor() {
    /** @type {Array<{ name: string, pattern: RegExp | string, handler: Function, keywords: string[] }>} */
    this._commands = [];
  }

  /**
   * Parses raw input (natural language or structured) into a ParsedCommand.
   *
   * Structured format recognised:
   *   `action target --flag --key=value -k value`
   *
   * Natural-language heuristic:
   *   First token → action, second token → target, rest → params/flags.
   *
   * @param {string} rawInput
   * @returns {ParsedCommand}
   */
  parse(rawInput) {
    if (typeof rawInput !== 'string' || rawInput.trim().length === 0) {
      throw new Error('rawInput must be a non-empty string');
    }

    const raw = rawInput.trim();
    const tokens = this._tokenize(raw);

    const action = tokens[0] ?? '';
    let target = null;
    const params = {};
    const flags = [];

    let i = 1;

    // Identify target — first non-flag token after action
    if (i < tokens.length && !tokens[i].startsWith('-')) {
      target = tokens[i];
      i += 1;
    }

    // Parse remaining tokens for flags and key-value params
    while (i < tokens.length) {
      const tok = tokens[i];

      if (tok.startsWith('--') && tok.includes('=')) {
        const eqIdx = tok.indexOf('=');
        params[tok.slice(2, eqIdx)] = tok.slice(eqIdx + 1);
      } else if (tok.startsWith('--')) {
        const key = tok.slice(2);
        // Peek next token: if it exists and is not a flag, treat as value
        if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
          params[key] = tokens[i + 1];
          i += 1;
        } else {
          flags.push(key);
        }
      } else if (tok.startsWith('-') && tok.length === 2) {
        const key = tok.slice(1);
        if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
          params[key] = tokens[i + 1];
          i += 1;
        } else {
          flags.push(key);
        }
      } else {
        // Positional param — assign as numbered key
        params[`arg${Object.keys(params).length}`] = tok;
      }

      i += 1;
    }

    return { action, target, params, flags, raw };
  }

  /**
   * Registers a command pattern with an associated handler.
   * @param {RegExp | string} pattern - Regex or keyword string (comma-separated keywords also accepted)
   * @param {Function} handler - Handler function invoked when a command matches
   * @returns {{ registered: boolean, name: string }}
   */
  registerCommand(pattern, handler) {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function');
    }

    const keywords =
      typeof pattern === 'string'
        ? pattern.split(',').map((k) => k.trim().toLowerCase())
        : [];

    const name =
      typeof pattern === 'string'
        ? pattern
        : pattern.source ?? pattern.toString();

    this._commands.push({
      name,
      pattern,
      handler,
      keywords,
    });

    return { registered: true, name };
  }

  /**
   * Validates a parsed command against registered patterns.
   * @param {ParsedCommand} parsed
   * @returns {{ valid: boolean, matchedCommand: string | null, errors: string[] }}
   */
  validate(parsed) {
    if (!parsed || !parsed.action) {
      return { valid: false, matchedCommand: null, errors: ['No action specified'] };
    }

    for (const cmd of this._commands) {
      if (this._matches(cmd, parsed)) {
        return { valid: true, matchedCommand: cmd.name, errors: [] };
      }
    }

    return {
      valid: false,
      matchedCommand: null,
      errors: [`Unknown command: "${parsed.action}". Use suggest() for completions.`],
    };
  }

  /**
   * Returns possible command completions for partial input.
   * @param {string} partialInput
   * @returns {string[]}
   */
  suggest(partialInput) {
    const lower = (partialInput ?? '').toLowerCase().trim();
    if (lower.length === 0) {
      return this._commands.map((c) => c.name);
    }

    const matches = [];

    for (const cmd of this._commands) {
      // Match against keywords
      for (const kw of cmd.keywords) {
        if (kw.startsWith(lower) || lower.startsWith(kw)) {
          matches.push(cmd.name);
          break;
        }
      }

      // Match against regex source
      if (cmd.pattern instanceof RegExp && cmd.pattern.source.includes(lower)) {
        if (!matches.includes(cmd.name)) matches.push(cmd.name);
      }
    }

    return matches;
  }

  /* ---- internal ---- */

  /**
   * Tokenizes raw input respecting quoted strings.
   * @param {string} input
   * @returns {string[]}
   * @private
   */
  _tokenize(input) {
    const tokens = [];
    const regex = /(?:[^\s"']+|"([^"]*)"|'([^']*)')/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
      tokens.push(match[1] ?? match[2] ?? match[0]);
    }
    return tokens;
  }

  /**
   * Checks whether a registered command matches a parsed command.
   * @private
   */
  _matches(cmd, parsed) {
    if (cmd.pattern instanceof RegExp) {
      return cmd.pattern.test(parsed.raw);
    }
    // Keyword match — action must match one of the keywords
    return cmd.keywords.includes(parsed.action.toLowerCase());
  }
}

export default CommandParser;
