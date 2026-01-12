import React from 'react';
import { WorkflowStep, WorkflowState } from '../types';

interface FSMVisualizerProps {
  steps: WorkflowStep[];
  activeStepIndex?: number;
}

const FSMVisualizer: React.FC<FSMVisualizerProps> = ({ steps, activeStepIndex = -1 }) => {
  return (
    <div className="w-full overflow-x-auto py-8 px-4 bg-gray-900 border border-gray-800 rounded-lg">
      <div className="flex items-center space-x-4 min-w-max">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isPast = index < activeStepIndex;
          const isFuture = index > activeStepIndex;

          let statusColor = "border-gray-700 bg-gray-800 text-gray-500";
          if (isActive) statusColor = "border-primary-500 bg-primary-500/10 text-primary-400 ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-900";
          if (isPast) statusColor = "border-emerald-500 bg-emerald-500/10 text-emerald-400";

          return (
            <React.Fragment key={step.id}>
              {/* Node */}
              <div className="flex flex-col items-center group relative cursor-help">
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono font-bold transition-all duration-300 ${statusColor}`}>
                  {index + 1}
                </div>
                <div className="mt-3 text-center w-32">
                  <div className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.state}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-1 max-w-full">
                    {step.name}
                  </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 border border-gray-700 p-2 rounded text-xs text-gray-300 z-10 shadow-xl">
                    <p className="font-bold text-white mb-1">{step.name}</p>
                    <p>{step.description}</p>
                    {step.requiredTools.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <span className="text-gray-500">MCP Tools:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {step.requiredTools.map(t => (
                                    <span key={t} className="bg-black px-1 rounded text-[9px] text-gray-400 font-mono">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 w-12 bg-gray-800 relative">
                  <div 
                    className={`absolute inset-0 bg-emerald-500 transition-all duration-1000 ${isPast ? 'w-full' : 'w-0'}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FSMVisualizer;