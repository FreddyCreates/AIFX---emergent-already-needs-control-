/**
 * Orchestrator Worker — Micro-Worker Coordination & Task Decomposition
 *
 * Permanent Web Worker that provides:
 * - Task decomposition (break large tasks into micro-tasks)
 * - Parallel execution planning (fan-out, fan-in)
 * - Dependency graph resolution (DAG-based)
 * - Worker pool management (track all organism workers)
 * - Workflow definitions (multi-step processes)
 * - Completion tracking and result aggregation
 *
 * This worker IS the organism's conductor. It breaks down complex
 * operations into micro-tasks and distributes them across workers.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'create-workflow', workflow: { name, steps: [...] } }
 *   Main → Worker: { type: 'decompose', task: { name, subtasks: [...] } }
 *   Main → Worker: { type: 'execute', workflowId: '...' }
 *   Main → Worker: { type: 'task-complete', taskId: '...', result: {...} }
 *   Main → Worker: { type: 'status', workflowId: '...' }
 *   Main → Worker: { type: 'list' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'workflow-created', ... }
 *   Worker → Main: { type: 'micro-task', ... }
 *   Worker → Main: { type: 'workflow-complete', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Orchestration State
   ════════════════════════════════════════════════════════════════ */

var workflows = Object.create(null);
var microTasks = Object.create(null);
var workflowCount = 0;
var taskCount = 0;

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var orchestratorMetrics = {
  totalWorkflows: 0,
  totalMicroTasks: 0,
  totalCompleted: 0,
  totalFailed: 0,
  totalDecomposed: 0,
  activeWorkflows: 0,
  activeTasks: 0
};

/* ════════════════════════════════════════════════════════════════
   Workflow Management
   ════════════════════════════════════════════════════════════════ */

function createWorkflow(spec) {
  workflowCount++;
  var id = 'WF-' + String(workflowCount).padStart(4, '0');
  var workflow = {
    id: id,
    name: spec.name || 'Unnamed Workflow',
    steps: (spec.steps || []).map(function (s, idx) {
      return {
        id: id + '-S' + idx,
        name: s.name || 'Step ' + idx,
        worker: s.worker || 'engine',
        action: s.action || 'dispatch',
        payload: s.payload || null,
        dependsOn: s.dependsOn || [],
        status: 'pending',    // pending, running, completed, failed
        result: null,
        startedAt: null,
        completedAt: null
      };
    }),
    status: 'created',   // created, running, completed, failed, cancelled
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    completedSteps: 0
  };

  workflows[id] = workflow;
  orchestratorMetrics.totalWorkflows++;
  return workflow;
}

function executeWorkflow(workflowId) {
  if (!isSafeKey(workflowId)) return null;
  var workflow = workflows[workflowId];
  if (!workflow) return null;

  workflow.status = 'running';
  workflow.startedAt = Date.now();
  orchestratorMetrics.activeWorkflows++;

  // Find steps with no dependencies — start them
  var readySteps = workflow.steps.filter(function (s) {
    return s.status === 'pending' && s.dependsOn.length === 0;
  });

  for (var i = 0; i < readySteps.length; i++) {
    emitMicroTask(workflow, readySteps[i]);
  }

  return { workflowId: workflowId, startedSteps: readySteps.length, totalSteps: workflow.steps.length };
}

function emitMicroTask(workflow, step) {
  step.status = 'running';
  step.startedAt = Date.now();
  taskCount++;
  orchestratorMetrics.totalMicroTasks++;
  orchestratorMetrics.activeTasks++;

  microTasks[step.id] = {
    taskId: step.id,
    workflowId: workflow.id,
    worker: step.worker,
    action: step.action,
    payload: step.payload
  };

  self.postMessage({
    type: 'micro-task',
    taskId: step.id,
    workflowId: workflow.id,
    worker: step.worker,
    action: step.action,
    payload: step.payload
  });
}

function completeTask(taskId, result) {
  if (!isSafeKey(taskId)) return null;
  var micro = microTasks[taskId];
  if (!micro) return null;

  var workflow = workflows[micro.workflowId];
  if (!workflow) return null;

  // Find and update the step
  var step = null;
  for (var i = 0; i < workflow.steps.length; i++) {
    if (workflow.steps[i].id === taskId) {
      step = workflow.steps[i];
      break;
    }
  }

  if (!step) return null;

  step.status = 'completed';
  step.result = result;
  step.completedAt = Date.now();
  workflow.completedSteps++;
  orchestratorMetrics.totalCompleted++;
  orchestratorMetrics.activeTasks = Math.max(0, orchestratorMetrics.activeTasks - 1);

  delete microTasks[taskId];

  // Check for newly-ready steps (dependencies met)
  var newReady = workflow.steps.filter(function (s) {
    if (s.status !== 'pending') return false;
    // All dependencies must be completed
    return s.dependsOn.every(function (depId) {
      var depStep = workflow.steps.find(function (ws) { return ws.id === depId; });
      return depStep && depStep.status === 'completed';
    });
  });

  for (var j = 0; j < newReady.length; j++) {
    emitMicroTask(workflow, newReady[j]);
  }

  // Check if workflow is complete
  var allDone = workflow.steps.every(function (s) { return s.status === 'completed' || s.status === 'failed'; });
  if (allDone) {
    workflow.status = 'completed';
    workflow.completedAt = Date.now();
    orchestratorMetrics.activeWorkflows = Math.max(0, orchestratorMetrics.activeWorkflows - 1);
    self.postMessage({
      type: 'workflow-complete',
      workflowId: workflow.id,
      name: workflow.name,
      steps: workflow.steps.length,
      durationMs: workflow.completedAt - workflow.startedAt
    });
  }

  return { taskId: taskId, workflowStatus: workflow.status, remaining: workflow.steps.length - workflow.completedSteps };
}

/* ════════════════════════════════════════════════════════════════
   Task Decomposition
   ════════════════════════════════════════════════════════════════ */

function decompose(task) {
  orchestratorMetrics.totalDecomposed++;
  var subtasks = task.subtasks || [];

  // Auto-generate workflow from subtasks
  var steps = subtasks.map(function (st, idx) {
    return {
      name: st.name || 'Subtask ' + idx,
      worker: st.worker || 'engine',
      action: st.action || 'dispatch',
      payload: st.payload || null,
      dependsOn: st.dependsOn || (idx > 0 ? [task.name + '-S' + (idx - 1)] : [])
    };
  });

  var workflow = createWorkflow({ name: task.name || 'Decomposed Task', steps: steps });
  return workflow;
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'create-workflow': {
      var workflow = createWorkflow(msg.workflow || {});
      self.postMessage({ type: 'workflow-created', workflow: { id: workflow.id, name: workflow.name, steps: workflow.steps.length } });
      break;
    }
    case 'decompose': {
      var decomposed = decompose(msg.task || {});
      self.postMessage({ type: 'decomposed', workflow: { id: decomposed.id, name: decomposed.name, steps: decomposed.steps.length } });
      break;
    }
    case 'execute': {
      var result = executeWorkflow(msg.workflowId);
      self.postMessage({ type: 'execution-started', data: result });
      break;
    }
    case 'task-complete': {
      var completion = completeTask(msg.taskId, msg.result || {});
      self.postMessage({ type: 'task-completed', data: completion });
      break;
    }
    case 'status': {
      if (isSafeKey(msg.workflowId) && workflows[msg.workflowId]) {
        var wf = workflows[msg.workflowId];
        self.postMessage({ type: 'workflow-status', data: { id: wf.id, name: wf.name, status: wf.status, completed: wf.completedSteps, total: wf.steps.length } });
      }
      break;
    }
    case 'list': {
      var list = [];
      for (var id in workflows) {
        var w = workflows[id];
        list.push({ id: w.id, name: w.name, status: w.status, steps: w.steps.length, completed: w.completedSteps });
      }
      self.postMessage({ type: 'workflow-list', workflows: list });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'orchestrator-stats', stats: orchestratorMetrics });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('orchestrator');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'orchestrator',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: orchestratorMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
