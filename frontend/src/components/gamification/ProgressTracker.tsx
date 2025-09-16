import React from 'react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  points?: number;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  title?: string;
  nextMilestone?: string;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  title = "Progress Tracker",
  nextMilestone,
  className = ''
}) => {
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">
            {completedSteps}/{totalSteps} completed
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {nextMilestone && (
          <p className="text-sm text-blue-600 font-medium">
            🎯 {nextMilestone}
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-4 p-3 rounded-lg transition-all duration-200 ${
              step.isActive ? 'bg-blue-50 border border-blue-200' : 
              step.isCompleted ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            {/* Step indicator */}
            <div className="flex-shrink-0 mt-1">
              {step.isCompleted ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : step.isActive ? (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                </div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-medium ${
                  step.isCompleted ? 'text-green-900' : 
                  step.isActive ? 'text-blue-900' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                {step.points && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    step.isCompleted ? 'bg-green-100 text-green-800' : 
                    step.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    +{step.points} pts
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                step.isCompleted ? 'text-green-700' : 
                step.isActive ? 'text-blue-700' : 'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>

            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className="absolute left-9 mt-8 w-px h-4 bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {completedSteps === totalSteps && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h4 className="font-semibold text-green-900">Congratulations!</h4>
          </div>
          <p className="text-sm text-green-700">
            You've completed all progress steps! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;