import { AgentDecisionRecord, RWAAsset, EngineType } from "../types";

export const MOCK_ASSETS: RWAAsset[] = [
  {
    id: "INV-2024-001",
    type: "INVOICE",
    value: 54000.00,
    currency: "USD",
    issuer: "Acme Logistics LLC",
    riskScore: 12, // Low risk
    status: "TOKENIZED",
    metadataHash: "QmX7...9a2"
  },
  {
    id: "BND-EU-882",
    type: "BOND",
    value: 1250000.00,
    currency: "EUR",
    issuer: "Global Green Energy",
    riskScore: 45, // Medium
    status: "PENDING",
    metadataHash: "QmY8...b31"
  }
];

export const MOCK_MCP_DATA = {
  invoiceData: {
    lineItems: 12,
    taxCode: "US-CA-550",
    previousDefaults: 0,
    daysOutstanding: 15
  },
  marketConditions: {
    volatilityIndex: 14.5,
    sectorOutlook: "STABLE",
    liquidityScore: "HIGH"
  }
};

export const MOCK_ADRS: AgentDecisionRecord[] = [
  {
    id: "ADR-001",
    workflowId: "WF-INV-AUDIT",
    timestamp: Date.now() - 100000,
    finalDecision: 'APPROVED',
    traces: [
      {
        stepId: "step-101",
        engine: EngineType.PERCEPTION,
        timestamp: Date.now() - 100000,
        inputHash: "0x88a...11b",
        output: { summary: "Invoice metadata matches issuer on-chain identity registry." },
        confidence: 0.98,
        latencyMs: 120
      },
      {
        stepId: "step-102",
        engine: EngineType.POLICY,
        timestamp: Date.now() - 99000,
        inputHash: "0x88a...11c",
        output: { summary: "Digital signature verified valid via WeilChain Identity Applet." },
        confidence: 1.0,
        latencyMs: 45
      },
      {
        stepId: "step-103",
        engine: EngineType.EXECUTION,
        timestamp: Date.now() - 98000,
        inputHash: "0x88a...11d",
        output: { summary: "PROCEED_TO_RISK" },
        confidence: 1.0,
        latencyMs: 15
      }
    ],
    selfEvaluation: {
        score: 0.98,
        feedback: "High alignment with Identity Verification Protocol protocols."
    },
    txHash: "0xWeil...abc",
    signature: "0xSig...123"
  },
  {
    id: "ADR-002",
    workflowId: "WF-INV-AUDIT",
    timestamp: Date.now() - 50000,
    finalDecision: 'APPROVED',
    traces: [
       {
        stepId: "step-201",
        engine: EngineType.WORLD_MODEL,
        timestamp: Date.now() - 50000,
        inputHash: "0x99b...22c",
        output: { summary: "Sector volatility low. Issuer 'Acme Logistics' has clean repayment history." },
        confidence: 0.95,
        latencyMs: 200
      },
      {
        stepId: "step-202",
        engine: EngineType.PLANNING,
        timestamp: Date.now() - 49000,
        inputHash: "0x99b...22d",
        output: { summary: "Invoice value $54k is within calculated credit limit ($75k)." },
        confidence: 0.94,
        latencyMs: 320
      },
      {
        stepId: "step-203",
        engine: EngineType.EXECUTION,
        timestamp: Date.now() - 48000,
        inputHash: "0x99b...22e",
        output: { summary: "APPROVE_TOKENIZATION" },
        confidence: 0.99,
        latencyMs: 20
      }
    ],
    selfEvaluation: {
        score: 0.92,
        feedback: "Action adheres to risk thresholds, though market volatility requires monitoring."
    },
    txHash: "0xWeil...def",
    signature: "0xSig...456"
  }
];