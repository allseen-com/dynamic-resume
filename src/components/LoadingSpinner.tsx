import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  submessage?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  submessage,
  variant = 'spinner',
  className = ''
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`bg-blue-600 rounded-full animate-bounce ${getSizeClasses()}`} style={{ animationDelay: '0ms' }}></div>
            <div className={`bg-blue-600 rounded-full animate-bounce ${getSizeClasses()}`} style={{ animationDelay: '150ms' }}></div>
            <div className={`bg-blue-600 rounded-full animate-bounce ${getSizeClasses()}`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`bg-blue-600 rounded-full animate-pulse ${getSizeClasses()}`}></div>
        );
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${getSizeClasses()}`}></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      
      {message && (
        <div className="text-center">
          <p className={`font-medium text-gray-700 ${getTextSizeClasses()}`}>
            {message}
          </p>
          {submessage && (
            <p className="text-sm text-gray-500 mt-1">
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Progress indicator component
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-xs mt-1 text-center ${
              index <= currentStep ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

// Specific loading states for different operations
export function AIProcessingLoader() {
  return (
    <LoadingSpinner 
      size="large"
      message="AI is analyzing your job description..."
      submessage="This may take 10-30 seconds depending on the complexity"
      variant="dots"
      className="py-8"
    />
  );
}

export function URLExtractionLoader() {
  return (
    <LoadingSpinner 
      size="medium"
      message="Extracting job description from URL..."
      submessage="Analyzing webpage content"
      variant="pulse"
      className="py-4"
    />
  );
}

export function PDFGenerationLoader() {
  return (
    <LoadingSpinner 
      size="medium"
      message="Generating your PDF resume..."
      submessage="Creating optimized document"
      variant="spinner"
      className="py-4"
    />
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ isVisible, children, className = '' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 ${className}`}>
      {children}
    </div>
  );
} 