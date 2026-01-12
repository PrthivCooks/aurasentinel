// Domain Types for Aura-Sentinel Core

// 1. Cognitive Engine Types
export enum EngineType {
  PERCEPTION = 'PERCEPTION',
  WORLD_MODEL = 'WORLD_MODEL',
  PLANNING = 'PLANNING',
  POLICY = 'POLICY',
  EXECUTION = 'EXECUTION',
  MEMORY = 'MEMORY',
  META_REASONING = 'META_REASONING',
  SELF_EVALUATION = 'SELF_EVALUATION'
}

export interface CognitiveTrace {
  stepId: string;
  engine: EngineType;
  timestamp: number;
  inputHash: string;
  output: any;
  confidence: number;
  latencyMs: number;
}

// 2. Asset Types
export interface RWAAsset {
  id: string;
  type: 'INVOICE' | 'BOND' | 'REAL_ESTATE';
  value: number;
  currency: string;
  issuer: string;
  riskScore: number;
  status: 'PENDING' | 'TOKENIZED' | 'REJECTED';
  metadataHash: string; // IPFS Hash
}

// 3. Workflow Definitions (Now oriented around Intelligence Objectives)
export interface AgentWorkflow {
  id: string;
  name: string;
  objective: string; // Replaces 'description' for alignment
  triggerEvent: string;
  requiredEngines: EngineType[];
  owner: string;
  created: number;
}

// 4. Agent Decision Record (ADR) - The Immutable Proof
export interface AgentDecisionRecord {
  id: string;
  workflowId: string;
  timestamp: number;
  finalDecision: 'APPROVED' | 'REJECTED' | 'HALTED';
  
  // The full cognitive lineage
  traces: CognitiveTrace[];
  
  // Self-Correction & Alignment
  selfEvaluation?: {
    score: number;
    feedback: string;
  };
  
  // Execution
  txHash?: string; // WeilChain Transaction Hash
  signature: string; // Cryptographic proof
}

// 5. App UI State
export type ViewState = 'DASHBOARD' | 'WORKFLOW_BUILDER' | 'EXECUTION_MONITOR' | 'AUDIT_EXPLORER';

export interface MCPData {
    source: string;
    data: any;
    timestamp: string;
}

// 6. Workflow Visualization Types
export enum WorkflowState {
  VERIFICATION = 'VERIFICATION',
  RISK_ANALYSIS = 'RISK_ANALYSIS',
  APPROVAL = 'APPROVAL',
  EXECUTED = 'EXECUTED'
}

export interface WorkflowStep {
  id: string;
  state: WorkflowState | string;
  name: string;
  description: string;
  requiredTools: string[];
}