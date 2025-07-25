import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-100 rounded-full p-4 mb-4">
        <AlertCircle size={48} className="text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Bir hata oluştu</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <RefreshCw size={20} className="mr-2" />
          Tekrar Dene
        </button>
      )}
    </div>
  );
};