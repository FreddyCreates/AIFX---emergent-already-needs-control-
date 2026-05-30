/**
 * AGENTS INDEX
 * 
 * The 12 agent organs of Civitas:
 *   - ANIMUS: Mind — reasoning, decisions, planning
 *   - CORPUS: Body — execution, action, resources
 *   - SENSUS: Senses — perception, filtering, attention
 *   - MEMORIA: Memory — encoding, retrieval, consolidation
 *   + 8 more specialized agents
 */

export { AnimusAgent } from './animus-agent.js';
export { CorpusAgent } from './corpus-agent.js';
export { SensusAgent } from './sensus-agent.js';
export { MemoriaAgent } from './memoria-agent.js';

// Agent factory for creating all agents
export function createAgents(engines) {
  return {
    animus: new AnimusAgent(engines),
    corpus: new CorpusAgent(engines),
    sensus: new SensusAgent(engines),
    memoria: new MemoriaAgent(engines),
  };
}
