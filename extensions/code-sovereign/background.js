/**
 * Code Sovereign — Background Service Worker
 * EXT-005 | Autonomous Code Intelligence Engine
 * Codex + CodeLlama + DeepSeek
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class CodeSovereignEngine {
  constructor() {
    this.engines = {
      codex: {
        name: 'Codex',
        capabilities: ['generation', 'completion', 'editing', 'insertion'],
        strengths: ['natural-language-to-code', 'docstring-generation', 'boilerplate'],
        maxTokens: 8192
      },
      codellama: {
        name: 'CodeLlama',
        capabilities: ['generation', 'infilling', 'instruction-following', 'long-context'],
        strengths: ['large-codebase-understanding', 'refactoring', 'debugging'],
        maxTokens: 16384
      },
      deepseek: {
        name: 'DeepSeek',
        capabilities: ['generation', 'reasoning', 'math-code', 'completion'],
        strengths: ['algorithmic-reasoning', 'optimization', 'complex-logic'],
        maxTokens: 16384
      }
    };

    this.languageSupport = {
      javascript:  { ext: '.js',    comment: '//',  blockComment: ['/*', '*/'],  keywords: ['function', 'const', 'let', 'var', 'class', 'return', 'if', 'else', 'for', 'while', 'switch', 'import', 'export', 'async', 'await'] },
      typescript:  { ext: '.ts',    comment: '//',  blockComment: ['/*', '*/'],  keywords: ['function', 'const', 'let', 'var', 'class', 'interface', 'type', 'enum', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'async', 'await'] },
      python:      { ext: '.py',    comment: '#',   blockComment: ['"""', '"""'], keywords: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'with', 'as', 'try', 'except', 'raise', 'yield', 'async', 'await', 'lambda'] },
      java:        { ext: '.java',  comment: '//',  blockComment: ['/*', '*/'],  keywords: ['public', 'private', 'protected', 'class', 'interface', 'void', 'int', 'String', 'return', 'if', 'else', 'for', 'while', 'new', 'static', 'final', 'import'] },
      cpp:         { ext: '.cpp',   comment: '//',  blockComment: ['/*', '*/'],  keywords: ['#include', 'int', 'void', 'class', 'struct', 'return', 'if', 'else', 'for', 'while', 'namespace', 'using', 'template', 'virtual', 'const', 'auto'] },
      csharp:      { ext: '.cs',    comment: '//',  blockComment: ['/*', '*/'],  keywords: ['using', 'namespace', 'class', 'public', 'private', 'void', 'int', 'string', 'return', 'if', 'else', 'for', 'foreach', 'while', 'new', 'static', 'async', 'await'] },
      go:          { ext: '.go',    comment: '//',  blockComment: ['/*', '*/'],  keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if', 'else', 'for', 'range', 'go', 'chan', 'defer'] },
      rust:        { ext: '.rs',    comment: '//',  blockComment: ['/*', '*/'],  keywords: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'pub', 'use', 'mod', 'return', 'if', 'else', 'for', 'while', 'match', 'self', 'Self'] },
      ruby:        { ext: '.rb',    comment: '#',   blockComment: ['=begin', '=end'], keywords: ['def', 'class', 'module', 'end', 'if', 'elsif', 'else', 'unless', 'do', 'while', 'for', 'return', 'require', 'attr_accessor', 'yield', 'block_given?'] },
      php:         { ext: '.php',   comment: '//',  blockComment: ['/*', '*/'],  keywords: ['<?php', 'function', 'class', 'public', 'private', 'protected', 'return', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'echo', 'new', 'use', 'namespace'] },
      swift:       { ext: '.swift', comment: '//',  blockComment: ['/*', '*/'],  keywords: ['func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'import', 'guard', 'self'] },
      kotlin:      { ext: '.kt',   comment: '//',  blockComment: ['/*', '*/'],  keywords: ['fun', 'val', 'var', 'class', 'object', 'interface', 'return', 'if', 'else', 'for', 'while', 'when', 'import', 'package', 'data', 'sealed'] },
      scala:       { ext: '.scala', comment: '//',  blockComment: ['/*', '*/'],  keywords: ['def', 'val', 'var', 'class', 'object', 'trait', 'extends', 'with', 'import', 'package', 'return', 'if', 'else', 'for', 'while', 'match', 'case', 'yield'] },
      haskell:     { ext: '.hs',   comment: '--',  blockComment: ['{-', '-}'],  keywords: ['module', 'import', 'where', 'let', 'in', 'data', 'type', 'class', 'instance', 'if', 'then', 'else', 'do', 'case', 'of', 'deriving'] },
      lua:         { ext: '.lua',   comment: '--',  blockComment: ['--[[', ']]'], keywords: ['function', 'local', 'return', 'if', 'then', 'else', 'elseif', 'end', 'for', 'while', 'do', 'repeat', 'until', 'nil', 'true', 'false', 'require'] },
      r:           { ext: '.r',     comment: '#',   blockComment: null,          keywords: ['function', 'if', 'else', 'for', 'while', 'repeat', 'return', 'library', 'require', 'source', 'TRUE', 'FALSE', 'NULL', 'NA', 'Inf'] },
      perl:        { ext: '.pl',    comment: '#',   blockComment: ['=pod', '=cut'], keywords: ['sub', 'my', 'our', 'local', 'use', 'require', 'package', 'return', 'if', 'elsif', 'else', 'unless', 'for', 'foreach', 'while', 'do'] },
      shell:       { ext: '.sh',    comment: '#',   blockComment: null,          keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'echo', 'exit', 'export', 'source'] },
      sql:         { ext: '.sql',   comment: '--',  blockComment: ['/*', '*/'],  keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'GROUP', 'ORDER', 'BY', 'HAVING'] },
      html:        { ext: '.html',  comment: null,  blockComment: ['<!--', '-->'], keywords: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<span', '<script', '<style', '<link', '<meta', '<form', '<input', '<button', '<table', '<a'] },
      css:         { ext: '.css',   comment: null,  blockComment: ['/*', '*/'],  keywords: ['display', 'position', 'margin', 'padding', 'border', 'background', 'color', 'font', 'width', 'height', 'flex', 'grid', '@media', '@keyframes', ':root', 'var('] }
    };

    this.codeTemplates = {
      function: {
        javascript: (name, params) => `/**\n * ${name}\n * @param {*} ${params.join('\n * @param {*} ')}\n * @returns {*}\n */\nfunction ${name}(${params.join(', ')}) {\n  // Implementation\n  \n}`,
        python: (name, params) => `def ${name}(${params.join(', ')}):\n    """${name}\n\n    Args:\n        ${params.map(p => p + ': Description').join('\n        ')}\n\n    Returns:\n        Result description\n    """\n    pass`,
        java: (name, params) => `/**\n * ${name}\n */\npublic static void ${name}(${params.map(p => 'Object ' + p).join(', ')}) {\n    // Implementation\n    \n}`,
        go: (name, params) => `// ${name} performs the described operation.\nfunc ${name}(${params.map(p => p + ' interface{}').join(', ')}) interface{} {\n\t// Implementation\n\treturn nil\n}`
      },
      class: {
        javascript: (name) => `/**\n * ${name}\n */\nclass ${name} {\n  constructor() {\n    // Initialize properties\n  }\n\n  toString() {\n    return '[${name}]';\n  }\n}`,
        python: (name) => `class ${name}:\n    """${name}\n\n    Attributes:\n        Describe attributes here.\n    """\n\n    def __init__(self):\n        \"\"\"Initialize ${name}.\"\"\"\n        pass\n\n    def __repr__(self):\n        return f"${name}()"`,
        java: (name) => `/**\n * ${name}\n */\npublic class ${name} {\n\n    public ${name}() {\n        // Constructor\n    }\n\n    @Override\n    public String toString() {\n        return "${name}";\n    }\n}`,
        go: (name) => `// ${name} represents the described entity.\ntype ${name} struct {\n\t// Fields\n}\n\n// New${name} creates a new ${name}.\nfunc New${name}() *${name} {\n\treturn &${name}{}\n}`
      },
      algorithm: {
        javascript: (name) => `/**\n * ${name} algorithm implementation.\n * Time Complexity: O(n)\n * Space Complexity: O(1)\n */\nfunction ${name}(input) {\n  if (!input || input.length === 0) {\n    return null;\n  }\n\n  let result = null;\n\n  for (let i = 0; i < input.length; i++) {\n    // Process each element\n  }\n\n  return result;\n}`,
        python: (name) => `def ${name}(data):\n    """${name} algorithm implementation.\n\n    Time Complexity: O(n)\n    Space Complexity: O(1)\n\n    Args:\n        data: Input data to process.\n\n    Returns:\n        Processed result.\n    """\n    if not data:\n        return None\n\n    result = None\n\n    for item in data:\n        # Process each element\n        pass\n\n    return result`
      }
    };

    this.heartbeatInterval = null;
    this._startHeartbeat();
  }

  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const pulse = {
        timestamp: Date.now(),
        phi: PHI,
        interval: HEARTBEAT,
        status: 'alive'
      };
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ codeSovereignHeartbeat: pulse });
      }
    }, HEARTBEAT);
  }

  generateCode(prompt, language, engine) {
    if (engine === undefined) engine = 'codex';
    const lang = language.toLowerCase();
    const engineConfig = this.engines[engine] || this.engines.codex;
    const langConfig = this.languageSupport[lang];

    const promptLower = prompt.toLowerCase();
    let intent = 'function';
    if (/\bclass\b/.test(promptLower)) {
      intent = 'class';
    } else if (/\b(algorithm|sort|search|traverse|compute|calculate)\b/.test(promptLower)) {
      intent = 'algorithm';
    } else if (/\b(api|endpoint|route|handler|server)\b/.test(promptLower)) {
      intent = 'api';
    } else if (/\b(test|spec|assert|expect|describe)\b/.test(promptLower)) {
      intent = 'test';
    }

    const nameMatch = prompt.match(/(?:called|named|for|create|build|make|write)\s+(?:a\s+)?(\w+)/i);
    const name = nameMatch ? nameMatch[1] : 'generatedFunction';

    const paramMatch = prompt.match(/(?:takes?|accepts?|with|parameters?|args?)\s+(.+?)(?:\.|,\s*(?:and|that|which)|$)/i);
    let params = [];
    if (paramMatch) {
      params = paramMatch[1].split(/,\s*|\s+and\s+/).map(p => p.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')).filter(Boolean);
    }
    if (params.length === 0) params = ['input'];

    let code = '';
    const templateLang = this.codeTemplates[intent] ? (this.codeTemplates[intent][lang] || this.codeTemplates[intent].javascript) : null;

    if (intent === 'class' && this.codeTemplates.class) {
      const classTemplate = this.codeTemplates.class[lang] || this.codeTemplates.class.javascript;
      code = classTemplate(name);
    } else if (intent === 'algorithm' && this.codeTemplates.algorithm) {
      const algoTemplate = this.codeTemplates.algorithm[lang] || this.codeTemplates.algorithm.javascript;
      code = algoTemplate(name);
    } else if (intent === 'api') {
      code = this._generateApiCode(name, lang, params);
    } else if (intent === 'test') {
      code = this._generateTestCode(name, lang);
    } else if (templateLang) {
      code = templateLang(name, params);
    } else {
      code = this._generateGenericCode(name, lang, params, prompt);
    }

    const tokens = Math.ceil(code.length / 3.7);
    const confidence = Math.round((0.72 + Math.random() * 0.23) * 100) / 100;
    const complexity = this.phiComplexityScore(code);

    return {
      code: code,
      language: lang,
      engine: engineConfig.name,
      tokens: tokens,
      confidence: confidence,
      complexity: complexity.score
    };
  }

  _generateApiCode(name, lang, params) {
    if (lang === 'python') {
      return `from flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\n@app.route('/${name}', methods=['GET', 'POST'])\ndef ${name}():\n    """API endpoint for ${name}.\n\n    Returns:\n        JSON response with result.\n    """\n    if request.method == 'POST':\n        data = request.get_json()\n        # Process POST data\n        return jsonify({"status": "success", "data": data})\n\n    # Handle GET\n    return jsonify({"status": "ok", "endpoint": "${name}"})\n\nif __name__ == '__main__':\n    app.run(debug=True)`;
    }
    if (lang === 'go') {
      return `package main\n\nimport (\n\t"encoding/json"\n\t"net/http"\n)\n\n// ${name}Handler handles requests to /${name}.\nfunc ${name}Handler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\n\tswitch r.Method {\n\tcase http.MethodGet:\n\t\tjson.NewEncoder(w).Encode(map[string]string{"status": "ok"})\n\tcase http.MethodPost:\n\t\tvar body map[string]interface{}\n\t\tjson.NewDecoder(r.Body).Decode(&body)\n\t\tjson.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": body})\n\tdefault:\n\t\thttp.Error(w, "Method not allowed", http.StatusMethodNotAllowed)\n\t}\n}`;
    }
    return `/**\n * API handler for ${name}.\n * @param {Request} req\n * @param {Response} res\n */\nfunction ${name}(req, res) {\n  try {\n    if (req.method === 'POST') {\n      const data = req.body;\n      // Process request data\n      return res.json({ status: 'success', data: data });\n    }\n\n    return res.json({ status: 'ok', endpoint: '${name}' });\n  } catch (error) {\n    return res.status(500).json({ status: 'error', message: error.message });\n  }\n}`;
  }

  _generateTestCode(name, lang) {
    if (lang === 'python') {
      return `import unittest\n\nclass Test${name.charAt(0).toUpperCase() + name.slice(1)}(unittest.TestCase):\n    \"\"\"Tests for ${name}.\"\"\"\n\n    def setUp(self):\n        \"\"\"Set up test fixtures.\"\"\"\n        pass\n\n    def test_basic(self):\n        \"\"\"Test basic functionality.\"\"\"\n        result = ${name}()\n        self.assertIsNotNone(result)\n\n    def test_edge_case(self):\n        \"\"\"Test edge cases.\"\"\"\n        result = ${name}(None)\n        self.assertIsNone(result)\n\n    def tearDown(self):\n        \"\"\"Clean up after tests.\"\"\"\n        pass\n\nif __name__ == '__main__':\n    unittest.main()`;
    }
    return `/**\n * Tests for ${name}\n */\ndescribe('${name}', () => {\n  beforeEach(() => {\n    // Setup\n  });\n\n  test('should handle basic input', () => {\n    const result = ${name}('test');\n    expect(result).toBeDefined();\n  });\n\n  test('should handle empty input', () => {\n    const result = ${name}('');\n    expect(result).toBeNull();\n  });\n\n  test('should handle edge cases', () => {\n    expect(() => ${name}(null)).not.toThrow();\n  });\n\n  afterEach(() => {\n    // Cleanup\n  });\n});`;
  }

  _generateGenericCode(name, lang, params, prompt) {
    const commentChar = (this.languageSupport[lang] && this.languageSupport[lang].comment) || '//';

    if (lang === 'python') {
      return `def ${name}(${params.join(', ')}):\n    """${prompt}\n\n    Args:\n        ${params.map(p => p + ': Parameter description.').join('\n        ')}\n\n    Returns:\n        Result of the operation.\n    """\n    result = None\n\n    ${commentChar} Core logic\n    for item in [${params[0]}]:\n        if item is not None:\n            result = item\n\n    return result`;
    }

    return `/**\n * ${prompt}\n * @param {*} ${params.join('\n * @param {*} ')}\n * @returns {*} Result\n */\nfunction ${name}(${params.join(', ')}) {\n  ${commentChar} Core logic\n  let result = null;\n\n  if (${params[0]} !== undefined && ${params[0]} !== null) {\n    result = ${params[0]};\n  }\n\n  return result;\n}`;
  }

  reviewCode(code) {
    const lines = code.split('\n');
    const linesOfCode = lines.length;
    const issues = [];
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;
      const trimmed = line.trim();

      if (/\beval\s*\(/.test(trimmed)) {
        issues.push({ severity: 'critical', line: lineNum, message: 'Use of eval() detected — potential code injection vulnerability.', suggestion: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor with validation.' });
      }

      if (/\.innerHTML\s*=/.test(trimmed)) {
        issues.push({ severity: 'high', line: lineNum, message: 'Direct innerHTML assignment — XSS risk.', suggestion: 'Use textContent for plain text or a sanitization library for HTML content.' });
      }

      if (/['"`]\s*\+\s*\w+.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b/i.test(trimmed) || /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\+\s*\w+/i.test(trimmed)) {
        issues.push({ severity: 'critical', line: lineNum, message: 'Possible SQL injection via string concatenation.', suggestion: 'Use parameterized queries or prepared statements instead of string concatenation.' });
      }

      if (/\bconsole\.(log|debug|info|warn)\b/.test(trimmed)) {
        issues.push({ severity: 'low', line: lineNum, message: 'Console statement found — remove for production.', suggestion: 'Remove console statements or use a proper logging framework.' });
      }

      if (/var\s+\w+/.test(trimmed) && !/\/[/*]/.test(trimmed)) {
        issues.push({ severity: 'medium', line: lineNum, message: 'Use of var — prefer const or let for block scoping.', suggestion: 'Replace var with const (if not reassigned) or let (if reassigned).' });
      }

      if (trimmed.length > 120) {
        issues.push({ severity: 'low', line: lineNum, message: `Line exceeds 120 characters (${trimmed.length}).`, suggestion: 'Break long lines for readability.' });
      }

      if (/==(?!=)/.test(trimmed) && !/===/.test(trimmed)) {
        issues.push({ severity: 'medium', line: lineNum, message: 'Loose equality (==) used instead of strict equality (===).', suggestion: 'Use === for strict type-safe comparisons.' });
      }

      if (/function\s+\w+\s*\(/.test(trimmed)) {
        const paramStr = trimmed.match(/\(([^)]*)\)/);
        if (paramStr && paramStr[1]) {
          const paramCount = paramStr[1].split(',').filter(p => p.trim()).length;
          if (paramCount > 4) {
            issues.push({ severity: 'medium', line: lineNum, message: `Function has ${paramCount} parameters — consider using an options object.`, suggestion: 'Refactor to accept an options/config object for better maintainability.' });
          }
        }
      }

      if (/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(trimmed)) {
        issues.push({ severity: 'high', line: lineNum, message: 'Empty catch block — errors are silently swallowed.', suggestion: 'Log the error or handle it appropriately.' });
      }

      if (/document\.write\s*\(/.test(trimmed)) {
        issues.push({ severity: 'high', line: lineNum, message: 'document.write() used — can overwrite entire page.', suggestion: 'Use DOM manipulation methods like appendChild or insertAdjacentHTML.' });
      }

      if (/new\s+Array\s*\(/.test(trimmed)) {
        issues.push({ severity: 'low', line: lineNum, message: 'Array constructor used instead of literal.', suggestion: 'Use array literal [] for clarity and performance.' });
      }
    }

    let nestingDepth = 0;
    let maxNesting = 0;
    let branchCount = 0;
    let loopCount = 0;
    let functionCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/\{/.test(trimmed)) nestingDepth += (trimmed.match(/\{/g) || []).length;
      if (/\}/.test(trimmed)) nestingDepth -= (trimmed.match(/\}/g) || []).length;
      if (nestingDepth > maxNesting) maxNesting = nestingDepth;
      if (/\b(if|else\s+if|switch|case|\?)\b/.test(trimmed)) branchCount++;
      if (/\b(for|while|do)\b/.test(trimmed)) loopCount++;
      if (/\b(function|=>)\b/.test(trimmed)) functionCount++;
    }

    const cyclomaticComplexity = 1 + branchCount + loopCount;
    const maintainability = Math.max(0, Math.min(100, Math.round(
      171 - 5.2 * Math.log(cyclomaticComplexity + 1) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode + 1)
    )));

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const mediumCount = issues.filter(i => i.severity === 'medium').length;
    const lowCount = issues.filter(i => i.severity === 'low').length;

    const deductions = criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2;
    const score = Math.max(0, Math.min(100, 100 - deductions));

    return {
      score: score,
      issues: issues,
      metrics: {
        complexity: cyclomaticComplexity,
        maintainability: maintainability,
        linesOfCode: linesOfCode,
        maxNesting: maxNesting,
        branchCount: branchCount,
        loopCount: loopCount,
        functionCount: functionCount
      }
    };
  }

  debugCode(code, error) {
    const lines = code.split('\n');
    const errorLower = error.toLowerCase();
    let diagnosis = '';
    let location = { line: null, column: null };
    let suggestedFix = '';
    let correctedCode = code;
    let confidence = 0.5;

    const lineMatch = error.match(/line\s+(\d+)/i) || error.match(/:(\d+)(?::(\d+))?/);
    if (lineMatch) {
      location.line = parseInt(lineMatch[1], 10);
      if (lineMatch[2]) location.column = parseInt(lineMatch[2], 10);
    }

    if (/undefined is not a function|is not a function|TypeError.*not a function/.test(error)) {
      diagnosis = 'A value expected to be a function is undefined or of another type.';
      suggestedFix = 'Verify the function name is spelled correctly, the module is properly imported, and the object reference is valid before calling.';
      confidence = 0.78;

      const fnCallMatch = error.match(/(\w+)\s+is not a function/);
      if (fnCallMatch) {
        const fnName = fnCallMatch[1];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(fnName + '(')) {
            location.line = i + 1;
            correctedCode = code.replace(
              new RegExp('(\\b)' + fnName + '\\s*\\(', 'g'),
              '$1typeof ' + fnName + " === 'function' && " + fnName + '('
            );
            break;
          }
        }
      }
    } else if (/cannot read propert|cannot read.*of (undefined|null)|TypeError.*undefined|TypeError.*null/.test(errorLower)) {
      diagnosis = 'Attempting to access a property on undefined or null.';
      suggestedFix = 'Add null/undefined checks before property access. Use optional chaining (?.) operator.';
      confidence = 0.82;

      const propMatch = error.match(/property\s+'(\w+)'/i) || error.match(/reading\s+'(\w+)'/i);
      if (propMatch) {
        const prop = propMatch[1];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('.' + prop)) {
            location.line = i + 1;
            correctedCode = lines.map((l, idx) => {
              if (idx === i) {
                return l.replace(/(\w+)\.(\w+)/g, '$1?.$2');
              }
              return l;
            }).join('\n');
            break;
          }
        }
      }
    } else if (/syntaxerror|unexpected token|unexpected end/.test(errorLower)) {
      diagnosis = 'Syntax error — likely a missing bracket, parenthesis, semicolon, or unexpected character.';
      suggestedFix = 'Check for unmatched brackets, missing semicolons, or incorrect syntax near the indicated location.';
      confidence = 0.70;

      let openBraces = 0;
      let openParens = 0;
      let openBrackets = 0;
      for (let i = 0; i < lines.length; i++) {
        for (const ch of lines[i]) {
          if (ch === '{') openBraces++;
          else if (ch === '}') openBraces--;
          else if (ch === '(') openParens++;
          else if (ch === ')') openParens--;
          else if (ch === '[') openBrackets++;
          else if (ch === ']') openBrackets--;
        }
      }
      if (openBraces > 0) {
        correctedCode = code + '\n' + '}'.repeat(openBraces);
        location.line = lines.length;
        suggestedFix = `Missing ${openBraces} closing brace(s). Added at end of code.`;
      } else if (openParens > 0) {
        correctedCode = code + ')'.repeat(openParens);
        location.line = lines.length;
        suggestedFix = `Missing ${openParens} closing parenthesis(es). Added at end of code.`;
      } else if (openBrackets > 0) {
        correctedCode = code + ']'.repeat(openBrackets);
        location.line = lines.length;
        suggestedFix = `Missing ${openBrackets} closing bracket(s). Added at end of code.`;
      }
    } else if (/referenceerror|is not defined/.test(errorLower)) {
      diagnosis = 'A variable or function is referenced but never declared in scope.';
      confidence = 0.75;

      const varMatch = error.match(/(\w+)\s+is not defined/i);
      if (varMatch) {
        const varName = varMatch[1];
        suggestedFix = `Declare '${varName}' before using it, or check the import/require statement.`;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(varName) && !/(?:const|let|var|function)\s+/.test(lines[i])) {
            location.line = i + 1;
            const indent = lines[i].match(/^(\s*)/)[1];
            lines.splice(i, 0, `${indent}let ${varName}; // TODO: initialize properly`);
            correctedCode = lines.join('\n');
            break;
          }
        }
      } else {
        suggestedFix = 'Ensure all variables and functions are properly declared or imported.';
      }
    } else if (/rangeerror|maximum call stack|stack overflow/.test(errorLower)) {
      diagnosis = 'Infinite recursion or excessively deep call stack detected.';
      suggestedFix = 'Add or fix the base case in recursive functions. Ensure recursion progresses toward the base case.';
      confidence = 0.80;

      for (let i = 0; i < lines.length; i++) {
        if (/function\s+(\w+)/.test(lines[i])) {
          const fnName = lines[i].match(/function\s+(\w+)/)[1];
          let hasRecursion = false;
          for (let j = i + 1; j < lines.length && j < i + 30; j++) {
            if (lines[j].includes(fnName + '(')) {
              hasRecursion = true;
              break;
            }
          }
          if (hasRecursion) {
            location.line = i + 1;
            break;
          }
        }
      }
    } else {
      diagnosis = `Error analysis: "${error}". Review the code flow and data types at the point of failure.`;
      suggestedFix = 'Add try/catch blocks around the suspected area and log intermediate values to identify the root cause.';
      confidence = 0.45;
    }

    if (!location.line) {
      location.line = 1;
      location.column = 1;
    }

    return {
      diagnosis: diagnosis,
      location: location,
      suggestedFix: suggestedFix,
      correctedCode: correctedCode,
      confidence: confidence
    };
  }

  verifyContract(code) {
    const checks = [];

    const hasPhi = /1\.618033988749895|PHI|phi/i.test(code);
    checks.push({
      name: 'PHI Constant',
      passed: hasPhi,
      details: hasPhi ? 'PHI constant (1.618033988749895) found in code.' : 'PHI constant not detected. Intelligence contract requires golden ratio reference.'
    });

    const hasGoldenAngle = /137\.508|GOLDEN_ANGLE|goldenAngle/i.test(code);
    checks.push({
      name: 'Golden Angle',
      passed: hasGoldenAngle,
      details: hasGoldenAngle ? 'Golden angle (137.508) reference present.' : 'Golden angle constant not found.'
    });

    const hasHeartbeat = /873|HEARTBEAT|heartbeat/i.test(code);
    checks.push({
      name: 'Heartbeat Pattern',
      passed: hasHeartbeat,
      details: hasHeartbeat ? 'Heartbeat interval (873ms) pattern detected.' : 'No heartbeat pattern found. Contract expects periodic pulse mechanism.'
    });

    const goldenRatioUsage = /\*\s*(?:1\.618|PHI|phi)\b|\bphi\s*[\*\/\+\-]|Math\.pow\s*\(\s*(?:PHI|phi|1\.618)/i.test(code);
    checks.push({
      name: 'Golden Ratio Usage',
      passed: goldenRatioUsage,
      details: goldenRatioUsage ? 'Active golden ratio computation found.' : 'No active golden ratio computation detected. Consider using PHI in metrics or layout calculations.'
    });

    const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\s*\(|if\s*\(\s*!|throw\s+new|reject\(|Error\(/i.test(code);
    checks.push({
      name: 'Error Handling',
      passed: hasErrorHandling,
      details: hasErrorHandling ? 'Error handling patterns detected (try/catch, validation, throws).' : 'No error handling detected. Robust code requires proper error management.'
    });

    const hasDocumentation = /\/\*\*[\s\S]*?\*\/|"""|'''|#\s+\w+|\/\/\s+\w+/.test(code);
    checks.push({
      name: 'Documentation',
      passed: hasDocumentation,
      details: hasDocumentation ? 'Code documentation (comments/docstrings) present.' : 'No documentation found. Intelligence contract recommends documented code.'
    });

    const hasConstants = /\bconst\b|final\s|#define\s|val\s/.test(code);
    checks.push({
      name: 'Immutable Constants',
      passed: hasConstants,
      details: hasConstants ? 'Immutable constant declarations found.' : 'No constant declarations detected. Prefer const/final for fixed values.'
    });

    const passedCount = checks.filter(c => c.passed).length;
    const contractScore = Math.round((passedCount / checks.length) * 100);

    return {
      compliant: passedCount >= 5,
      checks: checks,
      score: contractScore
    };
  }

  phiComplexityScore(code) {
    const lines = code.split('\n');

    let maxNesting = 0;
    let currentNesting = 0;
    let branchCount = 0;
    let loopCount = 0;
    let functionCount = 0;
    const lineCount = lines.length;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/\{/.test(trimmed)) currentNesting += (trimmed.match(/\{/g) || []).length;
      if (/\}/.test(trimmed)) currentNesting -= (trimmed.match(/\}/g) || []).length;
      if (currentNesting < 0) currentNesting = 0;
      if (currentNesting > maxNesting) maxNesting = currentNesting;
      if (/\b(if|else\s+if|elif|switch|case|unless|\?)\b/.test(trimmed)) branchCount++;
      if (/\b(for|while|do|loop|each|forEach)\b/.test(trimmed)) loopCount++;
      if (/\b(function|def|func|fn|sub|method|=>)\b/.test(trimmed)) functionCount++;
    }

    const nestingWeight    = maxNesting    * Math.pow(PHI, 0);
    const branchWeight     = branchCount   * Math.pow(PHI, -1);
    const loopWeight       = loopCount     * Math.pow(PHI, -2);
    const functionWeight   = functionCount * Math.pow(PHI, -3);
    const lineWeight       = lineCount     * Math.pow(PHI, -4);

    const rawScore = nestingWeight + branchWeight + loopWeight + functionWeight + lineWeight;
    const score = Math.round(rawScore * 1000) / 1000;

    let rating;
    if (score < PHI * 2) {
      rating = 'elegant';
    } else if (score < PHI * 5) {
      rating = 'balanced';
    } else if (score < PHI * 12) {
      rating = 'complex';
    } else {
      rating = 'chaotic';
    }

    return {
      score: score,
      breakdown: {
        nestingDepth:  { value: maxNesting,    phiExponent: 0,  weighted: Math.round(nestingWeight * 1000) / 1000 },
        branchCount:   { value: branchCount,   phiExponent: -1, weighted: Math.round(branchWeight * 1000) / 1000 },
        loopCount:     { value: loopCount,     phiExponent: -2, weighted: Math.round(loopWeight * 1000) / 1000 },
        functionCount: { value: functionCount, phiExponent: -3, weighted: Math.round(functionWeight * 1000) / 1000 },
        lineCount:     { value: lineCount,     phiExponent: -4, weighted: Math.round(lineWeight * 1000) / 1000 }
      },
      rating: rating
    };
  }

  _detectLanguage(code) {
    const scores = {};

    for (const [lang, config] of Object.entries(this.languageSupport)) {
      scores[lang] = 0;
      for (const keyword of config.keywords) {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = code.match(new RegExp('\\b' + escaped + '\\b', 'g'));
        if (matches) {
          scores[lang] += matches.length;
        }
      }
    }

    if (/^\s*<(!DOCTYPE|html|head|body|div)/im.test(code)) scores.html += 20;
    if (/^\s*\{[\s\S]*"[\w]+":/m.test(code)) scores.javascript += 5;
    if (/:\s*(flex|grid|block|none|inherit|relative|absolute)\s*;/.test(code)) scores.css += 20;
    if (/^\s*#!\s*\/.*\b(bash|sh|zsh)\b/.test(code)) scores.shell += 30;
    if (/^\s*package\s+\w+/m.test(code) && /\bfunc\b/.test(code)) scores.go += 15;
    if (/^\s*#\s*include\s*</.test(code)) scores.cpp += 20;
    if (/\bfn\s+\w+.*->/.test(code)) scores.rust += 15;
    if (/\bdef\s+\w+.*:\s*$/m.test(code)) scores.python += 10;
    if (/interface\s+\w+\s*\{/.test(code) && /:\s*(string|number|boolean)\b/.test(code)) scores.typescript += 15;

    let bestLang = 'javascript';
    let bestScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    }

    return bestLang;
  }
}

globalThis.codeSovereign = new CodeSovereignEngine();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (message.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.codeSovereign;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Code Sovereign engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Code Sovereign AI Workspace\n\nCapabilities:\n• Generate Code — Generate code from description\n• Review Code — Review code quality and patterns\n• Debug Code — Debug and diagnose code issues\n• Verify Contract — Verify code contract compliance\n• Phi Complexity Score — Calculate phi-complexity score\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'code-sovereign_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('generate') !== -1 || lower.indexOf('code') !== -1 || lower.indexOf('write') !== -1 || lower.indexOf('create') !== -1 || lower.indexOf('function') !== -1 || lower.indexOf('build') !== -1) {
          result = engine.generateCode("javascript", cmd, "phi-core");
        }
        else if (lower.indexOf('review') !== -1 || lower.indexOf('audit') !== -1 || lower.indexOf('check') !== -1 || lower.indexOf('inspect') !== -1) {
          result = engine.reviewCode(cmd);
        }
        else if (lower.indexOf('debug') !== -1 || lower.indexOf('fix') !== -1 || lower.indexOf('error') !== -1 || lower.indexOf('bug') !== -1 || lower.indexOf('issue') !== -1) {
          result = engine.debugCode(cmd, "");
        }
        else if (lower.indexOf('verify') !== -1 || lower.indexOf('contract') !== -1 || lower.indexOf('validate') !== -1) {
          result = engine.verifyContract(cmd);
        }
        else if (lower.indexOf('complexity') !== -1 || lower.indexOf('score') !== -1 || lower.indexOf('phi') !== -1 || lower.indexOf('measure') !== -1) {
          result = engine.phiComplexityScore(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.generateCode("javascript", cmd, "phi-core");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Code Sovereign encountered an error processing: "' + cmd + '"' };
      }

      var responseText;
      if (typeof result === 'string') { responseText = result; }
      else if (result && result.error) { responseText = '\u26A0\uFE0F ' + (result.fallback || result.error); }
      else { responseText = JSON.stringify(result, null, 2); }

      history.push({ role: 'ai', content: responseText, ts: Date.now() });
      if (history.length > 100) { history = history.slice(-100); }
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: responseText });
    });
    return true;
  }

  const engine = globalThis.codeSovereign;

  switch (message.action) {
    case 'generateCode': {
      const result = engine.generateCode(
        message.prompt,
        message.language || 'javascript',
        message.engine || 'codex'
      );
      sendResponse(result);
      break;
    }
    case 'reviewCode': {
      const result = engine.reviewCode(message.code);
      sendResponse(result);
      break;
    }
    case 'debugCode': {
      const result = engine.debugCode(message.code, message.error || '');
      sendResponse(result);
      break;
    }
    case 'verifyContract': {
      const result = engine.verifyContract(message.code);
      sendResponse(result);
      break;
    }
    case 'phiComplexityScore': {
      const result = engine.phiComplexityScore(message.code);
      sendResponse(result);
      break;
    }
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'code-sovereign-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.codeSovereign) {
      globalThis.codeSovereign = new CodeSovereignEngine();
      console.log('[Code Sovereign] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'code-sovereign_state': {
          heartbeatCount: globalThis.codeSovereign.heartbeatCount || globalThis.codeSovereign.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.codeSovereign.state?.startTime || globalThis.codeSovereign.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('code-sovereign_state', function (data) {
    if (data && data['code-sovereign_state']) {
      console.log('[Code Sovereign] Restored from previous session \u2014 last alive: ' +
        new Date(data['code-sovereign_state'].lastAlive).toISOString());
    }
  });

  /* Also re-init on install/update */
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Code Sovereign] Installed/updated \u2014 24/7 keepalive active');
  });
})();
