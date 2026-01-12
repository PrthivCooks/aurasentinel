import React, { useState } from 'react';
import { AgentDecisionRecord } from '../types';

export const ADRCard: React.FC<{ adr: AgentDecisionRecord }> = ({ adr }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Find key traces
  const executionTrace = adr.traces.find(t => t.engine === 'EXECUTION');
  
  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 0.5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="border border-gray-800 bg-gray-900/50 rounded-md overflow-hidden hover:border-gray-700 transition-colors">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`h-2 w-2 rounded-full ${adr.finalDecision === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <div>
            <div className="text-sm font-bold text-gray-200">{adr.finalDecision}</div>
            <div className="text-xs text-gray-500 font-mono">{adr.id}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <div className="text-xs text-gray-400">Cognitive Load</div>
            <div className="text-xs font-mono text-primary-400">{adr.traces.length} Engines</div>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-400">Timestamp</div>
             <div className="text-xs text-gray-500">{new Date(adr.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800 bg-black/20">
          <div className="mt-3 space-y-4">
            
            {/* Trace List */}
            <div>
              <div className="flex items-center mb-2">
                <h4 className="text-xs uppercase tracking-wider text-gray-500">Cognitive Lineage</h4>
                {adr.selfEvaluation && (
                  <span className={`ml-3 text-[10px] px-2 py-0.5 rounded border ${getAlignmentColor(adr.selfEvaluation.score)}`}>
                    Alignment: {(adr.selfEvaluation.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {adr.traces.map((trace, idx) => (
                  <div key={idx} className="flex items-start text-xs font-mono p-2 bg-gray-800/30 rounded border border-gray-800">
                    <span className="w-24 text-primary-500 shrink-0">{trace.engine}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="text-gray-300 truncate">{trace.output.summary}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Final Action</h4>
                <div className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                  {executionTrace?.output?.summary || "N/A"}
                </div>
              </div>
               <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Chain Proof</h4>
                <div className="text-xs font-mono text-gray-500 truncate">{adr.txHash || "Pending"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};