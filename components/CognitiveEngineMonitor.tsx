import React from 'react';
import { EngineType, CognitiveTrace } from '../types';

interface CognitiveEngineMonitorProps {
  activeEngine: EngineType | null;
  traces: CognitiveTrace[];
}

const ENGINE_LAYOUT = [
  { id: EngineType.PERCEPTION, label: "Perception", icon: "👁️", col: 1, row: 1 },
  { id: EngineType.MEMORY, label: "Memory & Identity", icon: "💾", col: 2, row: 1 },
  { id: EngineType.WORLD_MODEL, label: "World Model", icon: "🌍", col: 1, row: 2 },
  { id: EngineType.SELF_EVALUATION, label: "Self Evaluation", icon: "⚖️", col: 2, row: 2 },
  { id: EngineType.PLANNING, label: "Planning", icon: "🗺️", col: 1, row: 3 },
  { id: EngineType.META_REASONING, label: "Meta-Reasoning", icon: "🧠", col: 2, row: 3 },
  { id: EngineType.POLICY, label: "Policy Guard", icon: "🛡️", col: 1, row: 4 },
  { id: EngineType.EXECUTION, label: "Execution", icon: "⚡", col: 1, row: 5, span: 2 },
];

const CognitiveEngineMonitor: React.FC<CognitiveEngineMonitorProps> = ({ activeEngine, traces }) => {
  
  const getTraceForEngine = (engine: EngineType) => traces.find(t => t.engine === engine);

  return (
    <div className="w-full bg-gray-950 p-6 rounded-xl border border-gray-800 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {ENGINE_LAYOUT.map((engine) => {
          const isActive = activeEngine === engine.id;
          const trace = getTraceForEngine(engine.id);
          const hasData = !!trace;
          
          return (
            <div 
              key={engine.id}
              className={`
                relative rounded-lg p-4 border transition-all duration-500
                ${engine.span ? 'col-span-2' : 'col-span-1'}
                ${isActive ? 'bg-primary-900/20 border-primary-500 shadow-[0_0_30px_rgba(14,165,233,0.15)] scale-[1.02]' : 'bg-gray-900/60 border-gray-800'}
                ${hasData && !isActive ? 'border-emerald-500/30' : ''}
              `}
            >
              {/* Connector Lines (Abstract) */}
              {engine.row < 5 && (
                <div className="absolute left-1/2 bottom-0 w-px h-6 bg-gray-800 translate-y-full z-0"></div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${isActive ? 'animate-bounce' : 'opacity-50'}`}>{engine.icon}</div>
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-primary-400' : 'text-gray-400'}`}>
                      {engine.label}
                    </h3>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {isActive ? 'PROCESSING...' : hasData ? 'IDLE' : 'WAITING'}
                    </div>
                  </div>
                </div>
                {hasData && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700 font-mono">
                      {trace.latencyMs}ms
                    </span>
                    <span className="text-[10px] text-emerald-500 mt-1">
                      Conf: {(trace.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Output Visualization */}
              {hasData && (
                <div className="mt-3 p-2 bg-black/40 rounded border border-gray-800/50">
                  <p className="text-xs text-gray-300 font-mono line-clamp-2">
                    {trace.output.summary || JSON.stringify(trace.output)}
                  </p>
                </div>
              )}
              
              {isActive && (
                <div className="absolute inset-0 border-2 border-primary-500/20 rounded-lg animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CognitiveEngineMonitor;