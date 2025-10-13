import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ currentPath }) => {
  const stages = [
    { path: '/quote', label: 'Quote', step: 1 },
    { path: '/information', label: 'Information', step: 2 },
    { path: '/schedule', label: 'Schedule', step: 3 },
    { path: '/confirmation', label: 'Confirmation', step: 4 },
  ];

  const currentStage = stages.find(stage => stage.path === currentPath) || stages[0];
  const progress = (currentStage.step / stages.length) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="progress-steps">
        {stages.map((stage) => (
          <div 
            key={stage.path}
            className={`progress-step ${currentPath === stage.path ? 'active' : ''} ${currentStage.step > stage.step ? 'completed' : ''}`}
          >
            <div className="step-number">{stage.step}</div>
            <div className="step-label">{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;