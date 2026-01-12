import React, { useState } from 'react';
import { ViewState, AgentWorkflow, AgentDecisionRecord, EngineType, CognitiveTrace } from './types';
import { generateCognitiveArchitecture, runEngineCycle } from './services/geminiService';
import { MOCK_ASSETS, MOCK_MCP_DATA } from './services/mockData';
import CognitiveEngineMonitor from './components/CognitiveEngineMonitor.tsx';
import { ADRCard } from './components/ADRCard';

// Icons
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Workflow: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Monitor: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Audit: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

const App = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [activeWorkflow, setActiveWorkflow] = useState<AgentWorkflow | null>(null);
  const [executionLog, setExecutionLog] = useState<AgentDecisionRecord[]>([]);
  
  // Intelligence State
  const [activeEngine, setActiveEngine] = useState<EngineType | null>(null);
  const [currentTraces, setCurrentTraces] = useState<CognitiveTrace[]>([]);
  
  // Workflow Builder State
  const [prompt, setPrompt] = useState("Ensure all Invoice RWAs are from non-sanctioned entities and have a risk score < 20 before tokenization.");
  const [isBuilding, setIsBuilding] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // --- Handlers ---

  const handleCreateArchitecture = async () => {
    if (!prompt) return;
    setIsBuilding(true);
    const workflow = await generateCognitiveArchitecture(prompt);
    setActiveWorkflow(workflow);
    setIsBuilding(false);
    if(workflow) setView('EXECUTION_MONITOR');
  };

  const handleRunCognitiveCycle = async () => {
    if (!activeWorkflow) return;
    setIsExecuting(true);
    setCurrentTraces([]);
    
    // Define the Cognitive Cycle Sequence
    const sequence = [
      EngineType.PERCEPTION,
      EngineType.WORLD_MODEL,
      EngineType.PLANNING,
      EngineType.META_REASONING, // Check plan
      EngineType.POLICY,
      EngineType.EXECUTION,
      EngineType.SELF_EVALUATION
    ];

    let context: any = { ...MOCK_MCP_DATA, objective: activeWorkflow.objective };
    const traces: CognitiveTrace[] = [];

    for (const engine of sequence) {
      setActiveEngine(engine);
      
      const trace = await runEngineCycle(engine, context);
      traces.push(trace);
      setCurrentTraces([...traces]);
      
      // Update context for next engine
      context = { ...context, previousStep: trace.output };
      
      // If Policy rejects, Halt.
      if (engine === EngineType.POLICY && trace.output?.summary?.toLowerCase().includes("reject")) {
          break;
      }
    }

    // Extract Self-Evaluation Result
    const selfEvalTrace = traces.find(t => t.engine === EngineType.SELF_EVALUATION);

    // Finalize Record
    const newADR: AgentDecisionRecord = {
        id: `ADR-${Date.now().toString().slice(-4)}`,
        workflowId: activeWorkflow.id,
        timestamp: Date.now(),
        finalDecision: 'APPROVED', // Simplified for demo
        traces: traces,
        selfEvaluation: selfEvalTrace ? {
            score: selfEvalTrace.confidence,
            feedback: selfEvalTrace.output.summary || "Evaluation complete."
        } : undefined,
        txHash: `0xWeilChain${Math.random().toString(16).slice(2,8)}...`,
        signature: "0xSig..."
    };

    setExecutionLog(prev => [newADR, ...prev]);
    setActiveEngine(null);
    setIsExecuting(false);
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icons.Audit />
                </div>
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Managed RWAs</h3>
                <div className="mt-2 text-4xl font-bold text-white">{MOCK_ASSETS.length}</div>
                <div className="mt-2 text-xs text-emerald-400 font-mono flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    Systems Nominal
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Intelligence Level</h3>
                <div className="mt-2 text-4xl font-bold text-white">L4</div>
                <div className="mt-2 text-xs text-gray-400 font-mono">
                    Autonomous / Human-Supervised
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Audit Proofs</h3>
                <div className="mt-2 text-4xl font-bold text-white">{executionLog.length}</div>
                <div className="mt-2 text-xs text-primary-400 font-mono">
                    On-Chain Anchored
                </div>
            </div>
        </div>

        <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Latest Cognitive Traces</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
                {executionLog.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No decisions recorded yet. Run a simulation.</div>
                ) : (
                    executionLog.slice(0, 3).map(adr => (
                        <ADRCard key={adr.id} adr={adr} />
                    ))
                )}
            </div>
        </div>
    </div>
  );

  const renderBuilder = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Initialize Intelligence Core</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Define the strategic objective. The Architect will instantiate the necessary cognitive engines.
                </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                <textarea 
                    className="w-full h-40 bg-black/50 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
                    placeholder="e.g. Maximize yield on Invoice portfolio while strictly adhering to OFAC sanctions and maintaining <5% sector concentration risk."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Engine: Gemini-3 Pro Reasoning</span>
                    <button 
                        onClick={handleCreateArchitecture}
                        disabled={isBuilding}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isBuilding ? (
                            <span className="animate-pulse">Synthesizing...</span>
                        ) : (
                            <>
                                <span className="mr-2"><Icons.Plus /></span>
                                Instantiate Core
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            {activeWorkflow ? (
                <div className="w-full h-full flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">Architecture Ready</h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">Objective: {activeWorkflow.objective}</p>
                    </div>
                    
                    <div className="flex-1 bg-gray-900/50 rounded-lg p-4 border border-gray-800 overflow-y-auto">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Active Subsystems</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {activeWorkflow.requiredEngines.map(e => (
                                <div key={e} className="bg-black p-2 rounded border border-gray-800 text-xs text-gray-300 font-mono flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                    {e}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setView('EXECUTION_MONITOR')}
                        className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
                    >
                        Initialize Execution Monitor
                    </button>
                </div>
            ) : (
                <div className="text-center text-gray-600">
                    <Icons.Workflow />
                    <p className="mt-2 text-sm">Awaiting Objective Definition...</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderExecution = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Cognitive Engine Monitor</h2>
            <div className="flex space-x-3">
                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700 font-mono flex items-center">
                    State: {isExecuting ? <span className="text-emerald-400 ml-2 animate-pulse">REASONING</span> : <span className="text-gray-500 ml-2">STANDBY</span>}
                </span>
                <button 
                    onClick={handleRunCognitiveCycle}
                    disabled={isExecuting || !activeWorkflow}
                    className="px-4 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-500 disabled:opacity-50 font-medium"
                >
                    Run Cognitive Cycle
                </button>
            </div>
        </div>

        <CognitiveEngineMonitor activeEngine={activeEngine} traces={currentTraces} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase">Input Context (MCP)</h3>
                </div>
                 <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-fit">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/40 border border-gray-800 rounded">
                            <div className="text-xs text-primary-400 mb-1">Perception Stream</div>
                            <pre className="text-[10px] text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(MOCK_MCP_DATA.invoiceData, null, 2)}
                            </pre>
                        </div>
                        <div className="p-3 bg-black/40 border border-gray-800 rounded">
                            <div className="text-xs text-primary-400 mb-1">World Model Context</div>
                            <pre className="text-[10px] text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(MOCK_MCP_DATA.marketConditions, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-1">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase">Recent Decisions</h3>
                </div>
                 <div className="space-y-3">
                    {executionLog.slice(0, 3).map(adr => (
                        <ADRCard key={adr.id} adr={adr} />
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-900 hidden md:flex flex-col">
        <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                <div className="w-3 h-3 bg-primary-500 rounded-sm mr-2 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                Aura-Sentinel
            </h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest pl-5">Intelligence Core</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
            <button onClick={() => setView('DASHBOARD')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'DASHBOARD' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'}`}>
                <span className="mr-3"><Icons.Dashboard /></span>
                Mission Control
            </button>
            <button onClick={() => setView('WORKFLOW_BUILDER')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'WORKFLOW_BUILDER' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'}`}>
                <span className="mr-3"><Icons.Workflow /></span>
                Architecture
            </button>
            <button onClick={() => setView('EXECUTION_MONITOR')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'EXECUTION_MONITOR' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'}`}>
                <span className="mr-3"><Icons.Monitor /></span>
                Engine Monitor
            </button>
        </nav>

        <div className="p-4 border-t border-gray-900">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">
                    AS
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-white">Chief Architect</p>
                    <p className="text-xs text-gray-500">Clearance Lvl 9</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-gray-900 flex items-center justify-between px-8 bg-gray-950/50 backdrop-blur sticky top-0 z-20">
            <div className="flex items-center text-sm text-gray-400">
                <span className="mr-2">Substrate:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 text-xs">Active / WeilChain Mainnet</span>
            </div>
            <div className="flex items-center space-x-4">
                {!process.env.API_KEY && (
                    <span className="text-rose-500 text-xs border border-rose-900/50 bg-rose-900/20 px-2 py-1 rounded">
                        API Key Missing (Sim Mode)
                    </span>
                )}
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-xs text-emerald-500 font-mono">Cognitive Engines Online</span>
            </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
            {view === 'DASHBOARD' && renderDashboard()}
            {view === 'WORKFLOW_BUILDER' && renderBuilder()}
            {view === 'EXECUTION_MONITOR' && renderExecution()}
            {view === 'AUDIT_EXPLORER' && renderDashboard() /* Reuse dashboard for audit view for now */ }
        </div>
      </main>
    </div>
  );
};

export default App;