const PHI = 1.618033988749;

/**
 * DualLayerSearch — combines semantic (TF-IDF token-overlap) search with
 * φ-resonance coordinate-proximity search and merges results into a single
 * ranked list.
 */
export class DualLayerSearch {
  /**
   * Search a corpus by meaning similarity using TF-IDF-style token overlap.
   *
   * Each corpus entry must have at least `{ id, text }`.
   * Returns entries sorted by descending relevance score.
   *
   * @param {string} query
   * @param {{id: string, text: string}[]} corpus
   * @returns {{id: string, score: number, layer: string}[]}
   */
  searchSemantic(query, corpus) {
    const queryTokens = this._tokenize(query);
    const idf = this._computeIDF(queryTokens, corpus);

    return corpus
      .map((doc) => {
        const docTokens = this._tokenize(doc.text);
        const score = this._tfidfScore(queryTokens, docTokens, idf);
        return { id: doc.id, score, layer: 'semantic' };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Search a corpus by φ-resonance coordinate proximity.
   *
   * Each corpus entry must have `{ id, coordinates }` where coordinates
   * contain `{ theta, phi, rho, ring, beat }`.
   * The query is also a coordinate object.
   *
   * @param {{theta: number, phi: number, rho: number, ring: number, beat: number}} query
   * @param {{id: string, coordinates: {theta: number, phi: number, rho: number, ring: number, beat: number}}[]} corpus
   * @param {number} [phiThreshold=0.5] — maximum φ-weighted distance to include
   * @returns {{id: string, score: number, distance: number, layer: string}[]}
   */
  searchResonance(query, corpus, phiThreshold = 0.5) {
    return corpus
      .map((doc) => {
        const dist = this._phiDistance(query, doc.coordinates);
        const score = Math.max(0, 1 - dist);
        return { id: doc.id, score, distance: dist, layer: 'resonance' };
      })
      .filter((r) => r.distance <= phiThreshold)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Dual-read: run both search layers and merge into a unified ranked list.
   *
   * Corpus entries need `{ id, text, coordinates }`.
   *
   * @param {{text: string, coordinates: {theta: number, phi: number, rho: number, ring: number, beat: number}}} query
   * @param {{id: string, text: string, coordinates: object}[]} corpus
   * @param {object} [options]
   * @param {number} [options.semanticWeight=0.5]
   * @param {number} [options.resonanceWeight=0.5]
   * @param {number} [options.phiThreshold=0.5]
   * @returns {{id: string, score: number, semanticScore: number, resonanceScore: number}[]}
   */
  dualRead(query, corpus, options = {}) {
    const {
      semanticWeight = 0.5,
      resonanceWeight = 0.5,
      phiThreshold = 0.5,
    } = options;

    const semanticResults = this.searchSemantic(query.text, corpus);
    const resonanceResults = this.searchResonance(
      query.coordinates,
      corpus,
      phiThreshold,
    );

    const scoreMap = new Map();

    for (const r of semanticResults) {
      scoreMap.set(r.id, {
        id: r.id,
        semanticScore: r.score,
        resonanceScore: 0,
      });
    }

    for (const r of resonanceResults) {
      const existing = scoreMap.get(r.id) || {
        id: r.id,
        semanticScore: 0,
        resonanceScore: 0,
      };
      existing.resonanceScore = r.score;
      scoreMap.set(r.id, existing);
    }

    return [...scoreMap.values()]
      .map((entry) => ({
        ...entry,
        score:
          entry.semanticScore * semanticWeight +
          entry.resonanceScore * resonanceWeight,
      }))
      .sort((a, b) => b.score - a.score);
  }

  /* ---- internal helpers ---- */

  /** @private */
  _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  /** @private — inverse document frequency for query terms across corpus */
  _computeIDF(queryTokens, corpus) {
    const n = corpus.length || 1;
    const idf = {};
    for (const token of new Set(queryTokens)) {
      const docsWithToken = corpus.filter((doc) =>
        this._tokenize(doc.text).includes(token),
      ).length;
      idf[token] = Math.log((n + 1) / (docsWithToken + 1)) + 1;
    }
    return idf;
  }

  /** @private */
  _tfidfScore(queryTokens, docTokens, idf) {
    const docFreq = {};
    for (const t of docTokens) {
      docFreq[t] = (docFreq[t] || 0) + 1;
    }
    const docLen = docTokens.length || 1;

    let score = 0;
    for (const t of queryTokens) {
      const tf = (docFreq[t] || 0) / docLen;
      score += tf * (idf[t] || 0);
    }
    return score;
  }

  /** @private — φ-weighted Euclidean distance between two coordinate sets */
  _phiDistance(a, b) {
    const dTheta = (a.theta - b.theta) * PHI;
    const dPhi = (a.phi - b.phi) * PHI;
    const dRho = a.rho - b.rho;
    const dRing = (a.ring - b.ring) / PHI;
    const dBeat = (a.beat - b.beat) / (PHI * PHI);

    return Math.sqrt(
      dTheta ** 2 + dPhi ** 2 + dRho ** 2 + dRing ** 2 + dBeat ** 2,
    );
  }
}

export default DualLayerSearch;
