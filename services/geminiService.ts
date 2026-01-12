import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AgentWorkflow, EngineType, CognitiveTrace } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_REASONING = 'gemini-3-pro-preview';
const MODEL_FAST = 'gemini-3-flash-preview';

// --- System Instructions for Specific Engines ---

const PROMPTS = {
  [EngineType.PERCEPTION]: `
    ROLE: Perception Engine.
    TASK: Ingest raw data streams and normalize them into a canonical Observation Object.
    CONSTRAINT: Do not infer intent. Do not assess risk. Only extract facts.
  `,
  [EngineType.WORLD_MODEL]: `
    ROLE: World-Model Engine.
    TASK: Update the causal graph state based on new observations. Identify uncertainties.
    CONSTRAINT: Explicitly state assumptions.
  `,
  [EngineType.PLANNING]: `
    ROLE: Planning Engine.
    TASK: Generate a set of candidate plans to achieve the objective.
    CONSTRAINT: Do not execute. Only propose. Plans must be reversible where possible.
  `,
  [EngineType.POLICY]: `
    ROLE: Policy & Norm Engine.
    TASK: Review candidate plans against hard constraints (legal, ethical, safety).
    CONSTRAINT: You have VETO power. Reject any plan that violates a constraint.
  `,
  [EngineType.EXECUTION]: `
    ROLE: Execution Engine.
    TASK: Convert approved plan into specific instruction code (JSON).
    CONSTRAINT: Deterministic output only.
  `,
  [EngineType.META_REASONING]: `
    ROLE: Meta-Reasoning Engine.
    TASK: Observe the reasoning process. Detect hallucinations, loops, or drift.
    CONSTRAINT: Output strictly boolean health checks.
  `,
  [EngineType.SELF_EVALUATION]: `
    ROLE: Self-Evaluation & Alignment Engine.
    TASK: Retroactively score the generated Execution Plan against the original Objective.
    CONSTRAINT: Output a confidence score reflecting alignment. High score = High Alignment. Provide specific feedback in summary.
  `
};

/**
 * Runs a specific cognitive engine cycle.
 */
export const runEngineCycle = async (
  engine: EngineType,
  inputContext: any
): Promise<CognitiveTrace> => {
  const startTime = Date.now();
  
  if (!apiKey) {
    // Simulation Mode
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
    return {
      stepId: crypto.randomUUID(),
      engine,
      timestamp: Date.now(),
      inputHash: "0xSIM_HASH",
      output: { summary: `Simulated output for ${engine}`, data: JSON.stringify(inputContext) },
      confidence: 0.95,
      latencyMs: Date.now() - startTime
    };
  }

  try {
    const prompt = `
      INPUT CONTEXT: ${JSON.stringify(inputContext)}
      
      Generate the strictly typed output for this engine.
      If you have complex data, serialize it as a JSON string in the 'data' field.
    `;

    // Define schema based on engine type (Simplified for this implementation)
    // Fixed: 'data' property changed to STRING because OBJECT type requires non-empty properties in Gemini API.
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        data: { type: Type.STRING, description: "Serialized JSON string of the detailed output data" },
        confidence: { type: Type.NUMBER },
        flags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["summary", "confidence"]
    };

    const response = await ai.models.generateContent({
      model: engine === EngineType.PLANNING || engine === EngineType.POLICY ? MODEL_REASONING : MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: PROMPTS[engine],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    const output = text ? JSON.parse(text) : { error: "No output" };

    return {
      stepId: crypto.randomUUID(),
      engine,
      timestamp: Date.now(),
      inputHash: crypto.randomUUID().slice(0, 8), // Mock hash
      output,
      confidence: output.confidence || 0.0,
      latencyMs: Date.now() - startTime
    };

  } catch (error) {
    console.error(`Engine ${engine} Failed:`, error);
    return {
      stepId: crypto.randomUUID(),
      engine,
      timestamp: Date.now(),
      inputHash: "ERROR",
      output: { error: "Engine Fault", details: JSON.stringify(error) },
      confidence: 0,
      latencyMs: Date.now() - startTime
    };
  }
};

// Generates an architectural plan (Workflow)
export const generateCognitiveArchitecture = async (objective: string): Promise<AgentWorkflow | null> => {
  if (!apiKey) return null;
  
  // Implementation similar to previous workflow gen, but mapping to Engines
  return {
    id: crypto.randomUUID(),
    name: "Generated Architecture",
    objective,
    triggerEvent: "Manual Trigger",
    requiredEngines: [
      EngineType.PERCEPTION,
      EngineType.WORLD_MODEL,
      EngineType.PLANNING,
      EngineType.POLICY,
      EngineType.EXECUTION,
      EngineType.META_REASONING
    ],
    owner: "0xAdmin",
    created: Date.now()
  };
};